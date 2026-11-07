"""F9: offline contract tests; synthetic Git fixture, not an upstream install."""
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch
import impeccable_refs as tool


class ReferenceImport(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.source = self.root / 'upstream'
        self.project = self.root / 'project'
        self.source.mkdir(); self.project.mkdir()
        self.git('init', '-q')
        self.git('config', 'user.email', 'fixture@example.invalid')
        self.git('config', 'user.name', 'Test fixture')
        for name in tool.FILES:
            p = self.source / name
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text('# Fixture for ' + name + '\n')
        self.git('add', '.')
        self.git('commit', '-qm', 'Fixture')
        self.pin = self.git('rev-parse', 'HEAD').strip()
        self.patch = patch.object(tool, 'PIN', self.pin)
        self.patch.start()
        self.addCleanup(self.patch.stop)
        self.addCleanup(self.temp.cleanup)

    def git(self, *args):
        return subprocess.check_output(['git', '-C', str(self.source), *args], text=True)

    def run_import(self, apply=False):
        return tool.install(self.source, self.project, apply)

    def target(self):
        return self.project / '.saelion-design' / ('impeccable-' + self.pin)

    def test_dry_run_writes_nothing(self):
        self.assertEqual(self.run_import()['status'], 'dry-run')
        self.assertEqual(list(self.project.iterdir()), [])

    def test_apply_copies_only_closed_text_set(self):
        result = self.run_import(True)
        self.assertEqual(result['status'], 'installed-reference-text')
        files = {p.relative_to(self.target()).as_posix() for p in self.target().rglob('*') if p.is_file()}
        self.assertEqual(files, set(tool.FILES) | {'receipt.json'})

    def test_receipt_has_exact_pin_and_hashes(self):
        self.run_import(True)
        receipt = json.loads((self.target() / 'receipt.json').read_text())
        self.assertEqual(receipt['commit'], self.pin)
        self.assertFalse(receipt['hooks_installed'])
        self.assertFalse(receipt['upstream_code_executed'])
        self.assertEqual(len(receipt['sha256']), len(tool.FILES))

    def test_idempotent(self):
        self.run_import(True)
        before = {p: p.stat().st_mtime_ns for p in self.target().rglob('*') if p.is_file()}
        self.assertEqual(self.run_import(True)['status'], 'unchanged')
        self.assertEqual(before, {p: p.stat().st_mtime_ns for p in before})

    def test_uncommitted_source_is_not_imported(self):
        (self.source / 'LICENSE').write_text('modified working tree')
        self.run_import(True)
        self.assertEqual((self.target() / 'LICENSE').read_text(), '# Fixture for LICENSE\n')

    def test_wrong_pin_fails_before_write(self):
        with patch.object(tool, 'PIN', '0' * 40), self.assertRaises(ValueError):
            self.run_import(True)
        self.assertEqual(list(self.project.iterdir()), [])

    def test_existing_changed_file_is_not_overwritten(self):
        self.run_import(True)
        (self.target() / 'LICENSE').write_text('owner change')
        with self.assertRaises(ValueError): self.run_import(True)
        self.assertEqual((self.target() / 'LICENSE').read_text(), 'owner change')

    def test_existing_extra_file_blocks(self):
        self.run_import(True)
        (self.target() / 'extra.txt').write_text('preserve me')
        with self.assertRaises(ValueError): self.run_import(True)

    def test_destination_parent_symlink_blocks(self):
        (self.project / '.saelion-design').symlink_to(self.root, target_is_directory=True)
        with self.assertRaises(ValueError): self.run_import(True)

    def test_destination_child_symlink_blocks(self):
        self.run_import(True)
        p = self.target() / 'LICENSE'; p.unlink(); p.symlink_to(self.source / 'LICENSE')
        with self.assertRaises(ValueError): self.run_import(True)

    def test_missing_source_file_blocks(self):
        self.git('rm', '-q', 'LICENSE'); self.git('commit', '-qm', 'Remove license')
        with patch.object(tool, 'PIN', self.git('rev-parse', 'HEAD').strip()), self.assertRaises(ValueError):
            self.run_import(True)
        self.assertEqual(list(self.project.iterdir()), [])

    def test_binary_text_blocks(self):
        (self.source / 'LICENSE').write_bytes(b'bad\x00text')
        self.git('add', '.'); self.git('commit', '-qm', 'Binary fixture')
        with patch.object(tool, 'PIN', self.git('rev-parse', 'HEAD').strip()), self.assertRaises(ValueError):
            self.run_import(True)

    def test_oversized_text_blocks(self):
        (self.source / 'LICENSE').write_bytes(b'x' * (tool.MAX_BYTES + 1))
        self.git('add', '.'); self.git('commit', '-qm', 'Oversize fixture')
        with patch.object(tool, 'PIN', self.git('rev-parse', 'HEAD').strip()), self.assertRaises(ValueError):
            self.run_import(True)

    def test_preserves_other_project_files(self):
        (self.project / 'CLAUDE.md').write_text('Existing instructions')
        self.run_import(True)
        self.assertEqual((self.project / 'CLAUDE.md').read_text(), 'Existing instructions')


if __name__ == '__main__':
    unittest.main(verbosity=2)
