#!/usr/bin/env python3
"""F9: copy only pinned Impeccable reference text from an existing local checkout.

No network, package manager, upstream executable, hook, model, or global install.
This is provenance checking, not a sandbox or acceptance authority.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

PIN = '687bc381bc9091bf252c0a05303640561014a425'
REPOSITORY = 'https://github.com/pbakaus/impeccable'
FILES = (
    'LICENSE', 'NOTICE.md',
    'skill/reference/audit.md',
    'skill/reference/polish.md',
    'skill/reference/craft-floor.md',
)
MAX_BYTES = 131072


def git(source: Path, *args: str) -> bytes:
    # Ignore replacement refs and inherited Git directory/config overrides.
    env = {k: v for k, v in os.environ.items() if not k.startswith('GIT_')}
    env.update(GIT_NO_REPLACE_OBJECTS='1', GIT_CONFIG_NOSYSTEM='1',
               GIT_CONFIG_GLOBAL=os.devnull, GIT_TERMINAL_PROMPT='0')
    result = subprocess.run(
        ['git', '--no-pager', '-C', str(source), *args],
        env=env, capture_output=True, check=False, timeout=20,
    )
    if result.returncode:
        raise ValueError('Pinned local Git object unavailable; no download was attempted.')
    return result.stdout


def collect(source: Path) -> dict[str, bytes]:
    source = source.resolve(strict=True)
    if git(source, 'cat-file', '-t', PIN).strip() != b'commit':
        raise ValueError('Pin is not a commit.')
    payload = {}
    for name in FILES:
        spec = f'{PIN}:{name}'
        if git(source, 'cat-file', '-t', spec).strip() != b'blob':
            raise ValueError(f'Not a blob: {name}')
        size = int(git(source, 'cat-file', '-s', spec))
        if not 0 < size <= MAX_BYTES:
            raise ValueError(f'Invalid reference size: {name}')
        data = git(source, 'cat-file', 'blob', spec)
        data.decode('utf-8', errors='strict')
        if b'\0' in data or len(data) != size:
            raise ValueError(f'Invalid text reference: {name}')
        payload[name] = data
    receipt = {
        'schema': 'saelion-impeccable-text-import-v1',
        'upstream': REPOSITORY, 'commit': PIN,
        'mode': 'reference-text-only',
        'upstream_code_executed': False, 'hooks_installed': False,
        'sha256': {p: hashlib.sha256(b).hexdigest() for p, b in payload.items()},
    }
    payload['receipt.json'] = (json.dumps(receipt, indent=2, sort_keys=True) + '\n').encode()
    return payload


def verify_existing(target: Path, payload: dict[str, bytes]) -> None:
    if target.is_symlink() or not target.is_dir():
        raise ValueError('Existing destination is not a regular directory.')
    entries = list(target.rglob('*'))
    if any(p.is_symlink() or (not p.is_file() and not p.is_dir()) for p in entries):
        raise ValueError('Existing destination contains a link or special file.')
    files = {p.relative_to(target).as_posix() for p in entries if p.is_file()}
    if files != set(payload) or any((target / p).read_bytes() != b for p, b in payload.items()):
        raise ValueError('Existing references differ; refusing to overwrite.')


def install(source: Path, project: Path, apply: bool = False) -> dict:
    project = project.resolve(strict=True)
    if not project.is_dir():
        raise ValueError('Project must be an existing directory.')
    payload = collect(source)
    parent = project / '.saelion-design'
    if parent.is_symlink() or (parent.exists() and not parent.is_dir()):
        raise ValueError('Refusing a linked or non-directory destination.')
    target = parent / f'impeccable-{PIN}'
    if target.exists() or target.is_symlink():
        verify_existing(target, payload)
        return {'status': 'unchanged', 'target': str(target), 'files': len(payload)}
    if not apply:
        return {'status': 'dry-run', 'target': str(target), 'files': len(payload)}
    parent.mkdir(exist_ok=True)
    staging = Path(tempfile.mkdtemp(prefix='.impeccable-stage-', dir=parent))
    try:
        for name, data in payload.items():
            dest = staging / name
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(data)
        # Detect a destination that appeared while staging; no hostile-race guarantee.
        if target.exists() or target.is_symlink():
            raise ValueError('Destination appeared during staging; retry verification.')
        staging.rename(target)
    finally:
        if staging.exists():
            shutil.rmtree(staging)
    return {'status': 'installed-reference-text', 'target': str(target), 'files': len(payload)}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, required=True, help='Existing local upstream checkout')
    parser.add_argument('--project', type=Path, default=Path.cwd())
    parser.add_argument('--apply', action='store_true', help='Copy text; default is dry-run')
    args = parser.parse_args()
    try:
        print(json.dumps(install(args.source, args.project, args.apply), indent=2))
        return 0
    except (ValueError, OSError, UnicodeError, subprocess.SubprocessError) as exc:
        print(json.dumps({'status': 'blocked', 'reason': str(exc)}))
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
