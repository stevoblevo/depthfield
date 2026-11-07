# Impeccable pilot: F9

Owner: Steven. Implementer: Sae. Status: candidate, not merged, deployed or independently accepted.

This is the first slice of the approved Impeccable integration. It uses the existing Depthfield family contract, not a fourth kit. The pilot is a separate Guardian preview under `design-pilots/guardian/`; it leaves the published preview, bundle, game saves and shared docs shell unchanged.

## Pin and boundaries

Upstream: https://github.com/pbakaus/impeccable/tree/687bc381bc9091bf252c0a05303640561014a425 (Apache-2.0).
Reviewed reference blobs: audit `51bde6ce806816e74b7ba0d6f526040e05d9e086`, polish `f2146990505863574e3c8298613a37d4c31ee73c`, craft-floor `3331f4845d00756869e48edc0277ba8bc8e5826e`.

Only reference text is admitted. The upstream README documents a live Apply fallback that launches a CLI with approval/sandbox bypass. This pilot neither imports nor starts that implementation. No global installs, hooks, background workers, network fetches, telemetry or provider calls are added. No promise that prose or this import helper sandboxes a worker.

Existing brand rules win over incompatible generic style rules. Missing `PRODUCT.md` or `DESIGN.md` does not authorize replacing the existing brand book or creating another canonical specification.

## Use

The tracked `.agents/skills/saelion-design/SKILL.md` is the entrypoint for a supporting harness. Other workers can read it directly under their existing harness rules. This is not a claim of automatic discovery by Claude, Grok or Hermes.

With an already acquired upstream checkout containing the pin:

```sh
python3 tools/impeccable_refs.py --source /path/to/impeccable --project .
python3 tools/impeccable_refs.py --source /path/to/impeccable --project . --apply
python3 -m unittest discover -s tools -p 'test_impeccable_refs.py' -v
```

Default is dry-run. Import reads committed Git blobs, not the working tree. Existing changed references cause refusal rather than overwrite. License and notice accompany every import. The SHA-256 receipt describes imported text only; it grants no execution or acceptance authority. The tool assumes no concurrent adversarial mutation of its destination and is not a hostile-filesystem security boundary.

## Pilot check

Serve the repo locally and open `design-pilots/guardian/`. It loads the existing bundle and tokens. With that runtime unavailable, accessible door selection still works and the page explicitly reports the missing companion. No fake companion is supplied.

```sh
python3 -m http.server 8701 --bind 127.0.0.1
python3 tools/check_guardian_pilot.py --url http://127.0.0.1:8701/design-pilots/guardian/
```

Use `--require-runtime` for the full-repository acceptance check. For source-only checks in a network-restricted environment, use `--html design-pilots/guardian/index.html`; its screenshots explicitly label the missing runtime.

The browser check requires the already installed Python Playwright package and Chromium; it installs nothing. Local fallback checks are not proof of real-bundle integration. Before promotion, run this against the full repository, inspect screenshots, run the existing Taste check, and obtain independent review. Physical TV, native zoom and assistive-technology tests remain separate.

## Rollback and remaining work

Before merge, close the candidate without changing main. After an accepted merge, revert its exact commit; the original preview and runtime were never replaced. Reference-text imports can be removed as a whole after checking for owner edits.

Next within F9: full-repository browser verification; independent review of the exact candidate; a deliberate upstream runtime/detector review if useful; only then a consumer PR under Storeybrook or another game's own rules. F7 shared Taste remains a separate task and is not claimed complete. Reignfawn is not restarted by this pilot.
