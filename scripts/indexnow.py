"""Snapshot discovery URLs, then notify IndexNow only after an approved deploy."""
import argparse
import json
import pathlib
import time
import urllib.request
import xml.etree.ElementTree as ET

HOST='flipfinds.net'
def fetch(url):
    with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'FlipFindsSite/1.0'}),timeout=20) as response: return response.read()
def urls(xml):
    found=[x.text for x in ET.fromstring(xml).findall('{*}url/{*}loc')]
    if any(not u.startswith('https://'+HOST+'/') for u in found): raise ValueError('Sitemap contains an unexpected host')
    return found
def main():
    parser=argparse.ArgumentParser();parser.add_argument('mode',choices=['snapshot','notify']);parser.add_argument('--baseline',default='indexnow-baseline.json');parser.add_argument('--dry-run',action='store_true');parser.add_argument('--build');a=parser.parse_args()
    baseline=pathlib.Path(a.baseline)
    if a.mode=='snapshot': baseline.write_text(json.dumps(urls(fetch('https://'+HOST+'/sitemap.xml'))),encoding='utf8');return
    config=json.loads(pathlib.Path('data/acquisition.json').read_text(encoding='utf8'));key=config['indexNowKey']
    current=urls((pathlib.Path(a.build)/'sitemap.xml').read_bytes()) if a.build else urls(fetch('https://'+HOST+'/sitemap.xml'))
    previous=json.loads(baseline.read_text(encoding='utf8')) if baseline.exists() else []
    combined=sorted(set(current)|set(previous))
    payload={'host':HOST,'key':key,'keyLocation':'https://'+HOST+'/'+key+'.txt','urlList':combined}
    if a.dry_run: print(json.dumps({'current':len(current),'previous':len(previous),'notified':len(combined),'removed_from_sitemap':sorted(set(previous)-set(current))},indent=2));return
    if a.build: raise ValueError('Notifications must use the deployed sitemap')
    for attempt in range(3):
        try:
            if fetch(payload['keyLocation']).decode().strip()!=key: raise ValueError('Ownership key mismatch')
            break
        except Exception:
            if attempt==2: raise
            time.sleep(10)
    request=urllib.request.Request('https://api.indexnow.org/indexnow',data=json.dumps(payload).encode(),headers={'Content-Type':'application/json; charset=utf-8'},method='POST')
    with urllib.request.urlopen(request,timeout=30) as response: print('IndexNow accepted notification:',response.status,'URLs:',len(combined))
if __name__=='__main__':main()
