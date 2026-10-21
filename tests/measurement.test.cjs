const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const attr=require('../assets/js/attribution.js');
const config=JSON.parse(fs.readFileSync('data/acquisition.json','utf8'));
const storage=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};};

test('public pages contain no Google Analytics collection or consent controls',()=>{
 const root=process.env.SITE_BUILD||'public';
 function walk(path){return fs.readdirSync(path,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path+'/'+e.name):e.name.endsWith('.html')?[path+'/'+e.name]:[]);}
 for(const path of walk(root)){
  const html=fs.readFileSync(path,'utf8');
  assert.doesNotMatch(html,/countapi\.mileshilliard\.com|googletagmanager\.com|google-analytics\.com|ffAnalyticsChoice|ffAnalyticsStatus|ffAnalyticsSettings/,path);
  const scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(x=>x[1]).join('\n');
  assert.doesNotMatch(scripts,/FFAttribution\.capture|gtag\(/,path);
 }
});

test('attribution excludes arbitrary content and preserves approved first and current touches',()=>{
 const first=storage(),session=storage();
 let a=attr.capture(first,session,'?utm_source=embed&utm_medium=referral&utm_campaign=ff_resources&item=Private&amount=99','',config);
 assert.deepEqual(a.first,{utm_source:'embed',utm_medium:'referral',utm_campaign:'ff_resources'});
 a=attr.capture(first,session,'','',config);assert.equal(a.current.utm_source,'embed');
 a=attr.capture(first,storage(),'?utm_source=google&utm_medium=organic','',config);
 assert.equal(a.first.utm_source,'embed');assert.equal(a.current.utm_source,'google');
 assert.deepEqual(attr.sanitize('?utm_source=Private%20Title&utm_campaign=99999',config),{});
 const u=new URL(attr.handoff('https://example.com/signup',a,config));
 assert.equal(u.searchParams.get('ff_first_utm_source'),'embed');assert.equal(u.searchParams.get('ff_current_utm_source'),'google');
 assert.equal(attr.handoff('http://example.com/signup',a,config),null);
});
test('device routing prefers the appropriate store and changes desktop only when web is enabled',()=>{
 const script=fs.readFileSync('assets/js/acquisition.js','utf8');
 function preferred(agent,touch,enabled){
   let selected=null;const links={};['ios','android','web'].forEach(k=>links[k]={platform:k,classList:{add(){}}});
   const group={querySelector:selector=>links[selector.match(/="([^"]+)"/)?.[1]]||null,prepend:link=>{selected=link.platform;}};
   vm.runInNewContext(script,{window:{FFAcquisition:{...config,webSignupEnabled:enabled}},navigator:{userAgent:agent,maxTouchPoints:touch},document:{querySelectorAll:()=>[group],addEventListener(){}}});return selected;
 }
 assert.equal(preferred('Android',0,false),'android');assert.equal(preferred('iPhone',0,false),'ios');assert.equal(preferred('Macintosh',5,false),'ios');
 assert.equal(preferred('Windows',0,false),null);assert.equal(preferred('Windows',0,true),'web');
});

test('acquisition clicks emit the correct event and placement without item amounts',()=>{
 const script=fs.readFileSync('assets/js/acquisition.js','utf8');
 const events=[];let click;
 vm.runInNewContext(script,{
  window:{FFAcquisition:config,ffTrack:(name,payload)=>events.push({name,payload})},
  navigator:{userAgent:'Windows',maxTouchPoints:0},location:{origin:'https://flipfinds.net'},URL,
  document:{querySelectorAll:()=>[],addEventListener:(name,fn)=>{if(name==='click')click=fn;}}
 });
 function follow(href,dataset){const link={href,dataset};click({target:{closest:()=>link}});}
 follow(config.ios,{source:'home_hero'});
 follow(config.android,{source:'calculator_result'});
 follow('https://flipfinds.net/downloads/flipfinds-inventory-template.xlsx',{resource:'inventory_template',source:'resource_page',itemTitle:'Private',cost:'99'});
 follow('https://flipfinds.net/download/',{source:'nav_download'});
 follow('https://app.flipfinds.net/start?mode=signin&next=%2Fdashboard',{source:'header_signin'});
 follow('https://app.flipfinds.net/get-pro',{source:'header_purchase'});
 assert.deepEqual(events.map(e=>e.name),['ios_app_store_cta_clicked','android_play_store_cta_clicked','resource_downloaded','internal_navigation_clicked','dashboard_opened','pro_opened']);
 assert.deepEqual(events.map(e=>e.payload.cta_placement),['home_hero','calculator_result','resource_page','nav_download','header_signin','header_purchase']);
 assert.equal(events[2].payload.resource_name,'inventory_template');
 assert.equal(events[2].payload.itemTitle,undefined);assert.equal(events[2].payload.cost,undefined);
});
