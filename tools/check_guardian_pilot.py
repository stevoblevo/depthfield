#!/usr/bin/env python3
"""F9 browser checks. Does not install packages or claim physical-device testing."""
import argparse
import json
import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright


def run(url, output, require_runtime=False, html=None):
    output.mkdir(parents=True, exist_ok=True)
    if html and require_runtime:
        raise ValueError('Offline source-only mode cannot prove real-runtime integration.')
    def load(page):
        if html:
            page.route('**/*', lambda route: route.abort())
            page.set_content(html.read_text(), wait_until='networkidle')
            page.evaluate("document.documentElement.dataset.companion='unavailable'; document.getElementById('runtime-note').textContent='Offline source-only review. Choose a door directly; the existing kit companion is not loaded.'")
        else:
            page.goto(url, wait_until='networkidle')
    checks = []
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'), headless=True)
        for width, height, label in [(390,844,'phone'),(1440,1000,'desktop'),(2560,1440,'tv-viewport')]:
            page = browser.new_page(viewport={'width':width,'height':height}, reduced_motion='reduce')
            page.on('pageerror', lambda e: errors.append(str(e)))
            load(page)
            page.wait_for_function("['ready','unavailable'].includes(document.documentElement.dataset.companion)")
            runtime = page.locator('html').get_attribute('data-companion')
            if require_runtime: assert runtime == 'ready', 'Real Depthfield runtime is required'
            checks.append({'name':label+' runtime','result':runtime})
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Horizontal overflow'
            for theme in ['night','day','contrast']:
                page.select_option('#theme', theme)
                field = page.get_by_role('button', name='Field', exact=True)
                page.locator('#theme').focus(); page.keyboard.press('Tab')
                assert field.evaluate('(el)=>el===document.activeElement'), 'Tab order did not reach Field'
                page.keyboard.press('Enter')
                assert field.get_attribute('aria-pressed') == 'true'
                assert page.get_by_role('button', name='Loom', exact=True).get_attribute('aria-pressed') == 'false'
                loom = page.get_by_role('button', name='Loom', exact=True)
                page.keyboard.press('Tab')
                assert loom.evaluate('(el)=>el===document.activeElement'), 'Tab order did not reach Loom'
                page.keyboard.press('Space')
                assert loom.get_attribute('aria-pressed') == 'true'
                assert field.get_attribute('aria-pressed') == 'false'
                page.get_by_role('button', name='Clear selection').click()
                assert page.get_by_role('button', name='Clear selection').is_disabled()
                assert loom.evaluate('(el)=>el===document.activeElement'), 'Focus was lost on clear'
                assert page.locator('[aria-pressed="true"]').count()==0
                page.get_by_role('button', name='Ledger', exact=True).click()
                assert 'Ledger selected.' in page.locator('#selection').inner_text()
                for door in page.locator('.door').all():
                    box=door.bounding_box(); assert box['width']>=44 and box['height']>=44
                assert page.locator('.portal').first.evaluate('(el)=>getComputedStyle(el).transitionDuration')=='0s'
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
                page.screenshot(path=str(output/f'{label}-{theme}.png'), full_page=True)
                checks.append({'name':label+' '+theme+' direct-input/layout/reduced-motion','result':'pass'})
            # A text-enlargement stress test, not a claim of native browser zoom.
            page.evaluate("document.documentElement.style.fontSize='200%'")
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), '200% text overflow'
            for name in page.locator('.door-name').all():
                assert name.evaluate('(el)=>el.getBoundingClientRect().height < parseFloat(getComputedStyle(el).lineHeight)*1.5'), 'Destination name broke across lines'
            page.screenshot(path=str(output/f'{label}-large-text.png'), full_page=True)
            checks.append({'name':label+' 200-percent-text','result':'pass'})
            page.close()
        # Network/runtime failure is explicit; direct controls must remain functional.
        page=browser.new_page(viewport={'width':390,'height':844})
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.route('**/project/components/bundle.js', lambda route: route.abort())
        load(page)
        page.wait_for_function("document.documentElement.dataset.companion==='unavailable'")
        page.get_by_role('button', name='Field', exact=True).click()
        assert page.locator('#selection').inner_text()=='Field selected.'
        checks.append({'name':'missing-runtime fallback','result':'pass'})
        page.close(); browser.close()
    assert not errors, errors
    result={'checks':checks,'page_errors':errors,'physical_devices_tested':False,
            'detector_run':False,'independent_review':False,
            'mode':'offline-source-only' if html else 'full-repository-url',
            'scope':'direct selection, layout, reduced-motion CSS and missing-runtime fallback; not throw physics'}
    (output/'browser-results.json').write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(result,indent=2))


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    inputs=parser.add_mutually_exclusive_group(required=True)
    inputs.add_argument('--url')
    inputs.add_argument('--html',type=Path,help='Offline source-only layout and direct-input test; excludes runtime integration')
    parser.add_argument('--output',type=Path,default=Path('guardian-pilot-qa'))
    parser.add_argument('--require-runtime',action='store_true')
    args=parser.parse_args();run(args.url,args.output,args.require_runtime,args.html)
