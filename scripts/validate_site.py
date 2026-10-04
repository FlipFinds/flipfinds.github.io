"""Validate a built Hugo site using Python's standard library."""
import collections
import json
import pathlib
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path=path; self.title=''; self.in_title=False; self.description=''
        self.canonicals=[]; self.robots=''; self.h1=0; self.ids=set(); self.links=[]
        self.resources=[]; self.schema=[]; self.json_text=None; self.alias=False; self.images=[]
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if a.get('id'): self.ids.add(a['id'])
        if tag=='title': self.in_title=True
        if tag=='h1': self.h1+=1
        if tag=='meta':
            if a.get('name')=='description': self.description=a.get('content','')
            if a.get('name')=='robots': self.robots=a.get('content','')
            if a.get('http-equiv','').lower()=='refresh': self.alias=True
        if tag=='link' and a.get('rel')=='canonical': self.canonicals.append(a.get('href',''))
        if tag=='a' and a.get('href'): self.links.append(a['href'])
        if tag in ('img','script') and a.get('src'): self.resources.append(a['src'])
        if tag=='link' and a.get('rel') in ('stylesheet','preload stylesheet','icon','apple-touch-icon'): self.resources.append(a.get('href',''))
        if tag=='img': self.images.append(a)
        if tag=='script' and a.get('type')=='application/ld+json': self.json_text=''
    def handle_data(self, data):
        if self.in_title: self.title+=data
        if self.json_text is not None: self.json_text+=data
    def handle_endtag(self, tag):
        if tag=='title': self.in_title=False
        if tag=='script' and self.json_text is not None:
            self.schema.append(json.loads(self.json_text)); self.json_text=None

def validate(root):
    errors=[]; pages={}; links={}; image_warnings=[]
    if not (root/'sitemap.xml').is_file(): raise ValueError('Missing sitemap: build the site first')
    urls=[n.text for n in ET.parse(root/'sitemap.xml').findall('{*}url/{*}loc')]
    if len(urls)!=len(set(urls)): errors.append('Duplicate sitemap URL')
    for f in root.rglob('*.html'):
        relative=f.relative_to(root).as_posix(); path='/'+(relative[:-10] if relative.endswith('index.html') else relative)
        p=Page(path)
        try: p.feed(f.read_text(encoding='utf8'))
        except (json.JSONDecodeError,ValueError) as e: errors.append(f'{path}: invalid structured data: {e}')
        pages[path]=p
    def target(value,source):
        u=urlsplit(value)
        if u.scheme not in ('','http','https') or (u.netloc and u.netloc!='flipfinds.net'): return None
        path=unquote(u.path)
        file=root/path.lstrip('/') if path.startswith('/') else root/source.lstrip('/')/path
        if not path: file=root/source.lstrip('/')
        if file.is_dir(): file=file/'index.html'
        if not file.is_file(): errors.append(f'{source}: missing target {value}'); return None
        rel=file.relative_to(root).as_posix(); route='/'+(rel[:-10] if rel.endswith('index.html') else rel)
        if u.fragment and route in pages and unquote(u.fragment) not in pages[route].ids: errors.append(f'{source}: missing fragment {value}')
        return route
    for path,p in pages.items():
        links[path]=[r for r in (target(v,path) for v in p.links) if r is not None]
        for v in p.resources: target(v,path)
        for image in p.images:
            if 'alt' not in image: errors.append(f'{path}: image missing alt')
            if not image.get('width') or not image.get('height'): image_warnings.append([path,image.get('src')])
        for document in p.schema:
            for node in document.get('@graph',[document]):
                if node.get('@type')=='BreadcrumbList':
                    positions=[x.get('position') for x in node.get('itemListElement',[])]
                    if positions!=list(range(1,len(positions)+1)): errors.append(f'{path}: invalid breadcrumb positions')
    indexed=[]
    for url in urls:
        u=urlsplit(url); path=u.path; p=pages.get(path)
        if u.scheme!='https' or u.netloc!='flipfinds.net' or u.query: errors.append(f'Invalid sitemap location: {url}')
        if p is None: errors.append(f'Sitemap missing HTML: {path}'); continue
        if 'noindex' in p.robots or p.alias: errors.append(f'Nonindexable sitemap page: {path}')
        if p.canonicals!=[url]: errors.append(f'{path}: canonical {p.canonicals} does not match sitemap')
        if p.h1!=1: errors.append(f'{path}: expected one H1, found {p.h1}')
        if not p.title.strip() or not p.description.strip(): errors.append(f'{path}: missing title/description')
        indexed.append(p)
    for field in ('title','description'):
        values=collections.defaultdict(list)
        for p in indexed: values[getattr(p,field).strip()].append(p.path)
        for value,paths in values.items():
            if len(paths)>1: errors.append(f'Duplicate {field}: {paths}')
    reached=set(); pending=['/']
    while pending:
        path=pending.pop()
        if path not in reached: reached.add(path); pending.extend(links.get(path,[]))
    for p in indexed:
        if p.path not in reached: errors.append(f'Orphan sitemap page: {p.path}')
    for p in pages.values():
        if p.h1 and not p.alias and 'noindex' not in p.robots and p.path not in [urlsplit(u).path for u in urls]:
            errors.append(f'Indexable HTML missing from sitemap: {p.path}')
    result={'html_files':len(pages),'indexable_sitemap_pages':len(indexed),'schema_documents':sum(len(p.schema) for p in pages.values()),'errors':sorted(set(errors)),'images_without_dimensions':image_warnings}
    print(json.dumps(result,indent=2)); return bool(errors)

if __name__=='__main__': sys.exit(validate(pathlib.Path(sys.argv[1] if len(sys.argv)>1 else 'public').resolve()))
