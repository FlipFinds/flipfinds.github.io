const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const attr=require('../assets/js/attribution.js');
const config=JSON.parse(fs.readFileSync('data/acquisition.json','utf8'));
const storage=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};};
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
 buttons.ffAnalyticsAllow.click();let events=window.dataLayer.filter(x=>x[0]==='event');assert.equal(events.length,2);assert.equal(inserted.length,0);
 assert.equal(window.ffTrack('calculator_completed',{calculator_name:'resale_profit',marketplace:'ebay',cost:99,item_title:'Private',destination:'private text'}),true);
 const payload=window.dataLayer.at(-1)[2];assert.equal(payload.cost,undefined);assert.equal(payload.item_title,undefined);assert.equal(payload.destination,undefined);
 assert.equal(payload.page_referrer,'https://example.org/');assert.ok(!payload.page_location.includes('cost'));assert.equal(payload.campaign_name,'ff_resources');
 buttons.ffAnalyticsDecline.click();assert.equal(window.ffTrack('calculator_started',{}),false);assert.equal(first.getItem('ff_acquisition_first'),null);
 assert.equal(window['ga-disable-G-XX9ZJKDNEC'],true);
 buttons.ffAnalyticsAllow.click();assert.equal(window['ga-disable-G-XX9ZJKDNEC'],false);assert.equal(window.ffTrack('calculator_started',{}),true);
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
