const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const attr=require('../assets/js/attribution.js');
const config=JSON.parse(fs.readFileSync('data/acquisition.json','utf8'));
const storage=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};};
test('inline attribution initializes before consent without a blocking script request',()=>{
 const html=fs.readFileSync((process.env.SITE_BUILD||'public')+'/index.html','utf8');
 assert.doesNotMatch(html, /<script[^>]+src=["']?[^ >]*attribution/);
 const scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
 const attributionIndex=scripts.findIndex(x=>x.includes('FFAttribution'));
 const consentIndex=scripts.findIndex(x=>x.includes('ff_website_analytics_consent'));
 assert.ok(attributionIndex>=0 && consentIndex>attributionIndex);
 const window={}; vm.runInNewContext(scripts[attributionIndex],{window,URL,URLSearchParams});
 assert.equal(typeof window.FFAttribution.capture,'function');
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
test('generated consent wrapper blocks collection, sanitizes payloads, revokes and regrants',()=>{
 const built=process.env.SITE_BUILD||'public';
 const html=fs.readFileSync(built+'/calculator/index.html','utf8');
 const script=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(x=>x[1]).find(x=>x.includes('ff_website_analytics_consent'));
 assert.ok(script,'Build the site before running measurement tests');
 const listeners={},buttons={};
 ['ffAnalyticsChoice','ffAnalyticsStatus','ffAnalyticsAllow','ffAnalyticsDecline','ffAnalyticsSettings'].forEach(k=>buttons[k]={hidden:false,addEventListener:(event,fn)=>{buttons[k][event]=fn;}});
 const inserted=[],first=storage(),session=storage();
 const window={FFPage:{page_path:'/calculator/',page_type:'calculator',intent:'resale_profit'},FFAcquisition:config,FFAttribution:attr};
 const document={referrer:'https://example.org/private/item?cost=10',getElementById:k=>buttons[k],addEventListener:(event,fn)=>{listeners[event]=fn;},createElement:()=>({}),head:{appendChild:s=>inserted.push(s)}};
 const location={origin:'http://localhost:1314',hostname:'localhost',search:'?item=Private&cost=99&utm_source=embed&utm_medium=referral&utm_campaign=ff_resources'};
 vm.runInNewContext(script,{window,document,location,localStorage:first,sessionStorage:session,URL,URLSearchParams,Date});listeners.DOMContentLoaded();
 assert.equal(window.ffTrack('calculator_completed',{marketplace:'ebay'}),false);assert.equal(window.dataLayer,undefined);
 buttons.ffAnalyticsAllow.click();let events=window.dataLayer.filter(x=>x[0]==='event');assert.equal(events.length,1);assert.equal(events[0][1],'page_view');assert.equal(inserted.length,0);
 assert.equal(window.ffTrack('calculator_completed',{calculator_name:'resale_profit',marketplace:'ebay',cost:99,item_title:'Private',destination:'private text'}),true);
 const payload=window.dataLayer.at(-1)[2];assert.equal(payload.cost,undefined);assert.equal(payload.item_title,undefined);assert.equal(payload.destination,undefined);
 assert.equal(payload.page_referrer,'https://example.org/');assert.ok(!payload.page_location.includes('cost'));assert.equal(payload.campaign_name,'ff_resources');
 buttons.ffAnalyticsDecline.click();assert.equal(window.ffTrack('calculator_started',{}),false);assert.equal(first.getItem('ff_acquisition_first'),null);
 assert.equal(window['ga-disable-G-XX9ZJKDNEC'],true);
 buttons.ffAnalyticsAllow.click();assert.equal(window['ga-disable-G-XX9ZJKDNEC'],false);assert.equal(window.ffTrack('calculator_started',{}),true);
});

test('AI referrals use exact hosts and retain only bounded attribution',()=>{
 for(const [host,source] of [['chatgpt.com','chatgpt'],['www.chatgpt.com','chatgpt'],['chat.openai.com','chatgpt'],['claude.ai','claude'],['gemini.google.com','gemini'],['perplexity.ai','perplexity'],['www.perplexity.ai','perplexity']]){
  const first=storage(),session=storage();
  const result=attr.capture(first,session,'',`https://${host}/private-conversation?prompt=secret`,config);
  assert.deepEqual(result.current,{utm_source:source,utm_medium:'referral'});
  assert.deepEqual(attr.capture(first,session,'','https://flipfinds.net/tools/',config),result);
  assert.ok(!JSON.stringify(result).includes('secret'));
 }
 for(const host of ['chatgpt.com.evil.example','fakeclaude.ai','google.com.evil.example','constructor','toString'])
  assert.deepEqual(attr.capture(storage(),storage(),'',`https://${host}/`,config).current,{});
 assert.deepEqual(attr.capture(storage(),storage(),'','',config).current,{});
 assert.equal(attr.capture(storage(),storage(),'','https://www.google.com/search?q=private',config).current.utm_source,'google');
});

test('AI source tags normalize safely without changing explicit campaigns or first touch',()=>{
 assert.deepEqual(attr.sanitize('?utm_source=chatgpt.com&prompt=secret',config),{utm_source:'chatgpt',utm_medium:'referral'});
 assert.deepEqual(attr.sanitize('?utm_source=claude&utm_medium=cpc',config),{utm_source:'claude',utm_medium:'cpc'});
 assert.deepEqual(attr.sanitize('?utm_source=chatgpt.com.evil.example',config),{});
 const first=storage();
 attr.capture(first,storage(),'?utm_source=google&utm_medium=organic','',config);
 const result=attr.capture(first,storage(),'','https://gemini.google.com/app/private',config);
 assert.equal(result.first.utm_source,'google');assert.equal(result.current.utm_source,'gemini');
 const tagged=attr.capture(storage(),storage(),'?utm_source=newsletter&utm_medium=email','https://claude.ai/',config);
 assert.equal(tagged.current.utm_source,'newsletter');
});

test('AI attribution reaches generated analytics only after consent without conversation data',()=>{
 const html=fs.readFileSync((process.env.SITE_BUILD||'public')+'/index.html','utf8');
 const script=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(x=>x[1]).find(x=>x.includes('ff_website_analytics_consent'));
 for(const [search,referrer,source] of [['?utm_source=chatgpt.com&prompt=secret','','chatgpt'],['','https://claude.ai/chat/private?prompt=secret','claude'],['','https://gemini.google.com/app/private','gemini']]){
  const listeners={},buttons={},first=storage(),session=storage();
  for(const k of ['ffAnalyticsChoice','ffAnalyticsStatus','ffAnalyticsAllow','ffAnalyticsDecline','ffAnalyticsSettings'])buttons[k]={addEventListener:(e,fn)=>buttons[k][e]=fn};
  const window={FFPage:{page_path:'/',page_type:'home'},FFAcquisition:config,FFAttribution:attr};
  const document={referrer,getElementById:k=>buttons[k],addEventListener:(e,fn)=>listeners[e]=fn};
  const location={origin:'http://localhost',hostname:'localhost',search};
  vm.runInNewContext(script,{window,document,location,localStorage:first,sessionStorage:session,URL,URLSearchParams,Date});listeners.DOMContentLoaded();
  assert.equal(window.dataLayer,undefined);assert.equal(first.getItem('ff_acquisition_first'),null);
  buttons.ffAnalyticsAllow.click();
  const payload=window.dataLayer.find(x=>x[0]==='event')[2];
  assert.equal(payload.campaign_source,source);assert.equal(payload.campaign_medium,'referral');
  assert.doesNotMatch(JSON.stringify(payload),/secret|private|prompt/);
  buttons.ffAnalyticsDecline.click();assert.equal(window.ffTrack('page_view'),false);
  assert.equal(first.getItem('ff_acquisition_first'),null);assert.equal(session.getItem('ff_acquisition_current'),null);
 }
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
 assert.deepEqual(events.map(e=>e.name),['ios_app_store_cta_clicked','android_play_store_cta_clicked','resource_downloaded','internal_navigation_clicked']);
 assert.deepEqual(events.map(e=>e.payload.cta_placement),['home_hero','calculator_result','resource_page','nav_download']);
 assert.equal(events[2].payload.resource_name,'inventory_template');
 assert.equal(events[2].payload.itemTitle,undefined);assert.equal(events[2].payload.cost,undefined);
});
