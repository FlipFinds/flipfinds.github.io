const assert = require('node:assert/strict');
const test = require('node:test');
const math = require('../assets/js/resale-math.js');
const base = {marketplace:'custom',purchaseCost:10,salePrice:40,shippingCost:5,shippingCharged:0,packagingCost:.75,otherCosts:0,sellerFeePct:10,fixedFee:0,feeIncludesShipping:true,taxCollected:0,targetMode:'profit',targetValue:15};
test('revenue excludes collected tax; eBay fees include it',()=>{
  const r=math.calculate({...base,marketplace:'ebay',taxCollected:3});
  assert.equal(r.revenue,40); assert.ok(Math.abs(r.profit-18.002)<1e-9);
});
test('eBay order fee and upper tier boundaries',()=>{
  assert.ok(Math.abs(math.fees(10,{...base,marketplace:'ebay'})-1.66)<1e-9);
  assert.ok(Math.abs(math.fees(10.01,{...base,marketplace:'ebay'})-1.76136)<1e-9);
  assert.ok(Math.abs(math.fees(8000,{...base,marketplace:'ebay'})-1032.15)<1e-9);
});
test('Poshmark threshold and fee-base exclusions',()=>{
  assert.equal(math.fees(14.99,{...base,marketplace:'poshmark',shippingCharged:8}),2.95);
  assert.equal(math.fees(15,{...base,marketplace:'poshmark',shippingCharged:8}),3);
  const outcome=math.calculate({...base,marketplace:'poshmark',shippingCharged:8});
  assert.equal(outcome.revenue,40);assert.equal(outcome.profit,16.25);
});

test('minimum prices remain minimal around downward profit jumps',()=>{
 for(const marketplace of ['ebay','poshmark']) {
   for(const target of [7,7.01,7.02,7.04,7.05,7.06]) {
     const input={...base,marketplace,purchaseCost:5,shippingCost:0,packagingCost:0};
     const actual=math.requiredSale(target,input);
     let brute=0;while(brute<3000 && math.calculate({...input,salePrice:brute/100}).profit<target-1e-7)brute++;
     assert.ok(Math.abs(actual-brute/100)<1e-6,marketplace+' '+target);
   }
 }
});
test('zero investment leaves ROI undefined; loss is retained',()=>{
  const r=math.calculate({...base,purchaseCost:0,shippingCost:0,packagingCost:0});
  assert.ok(Number.isNaN(r.roi));
  const roi=math.calculate({...base,purchaseCost:0,shippingCost:0,packagingCost:0,targetMode:'roi'});
  assert.equal(roi.meetsTarget,null);assert.ok(Number.isNaN(roi.minimumSale));
  assert.ok(math.calculate({...base,salePrice:5}).profit<0);
});
test('max buy with ROI solves the target independently of current item cost',()=>{
  const input={...base,targetMode:'roi',targetValue:100};
  const r=math.calculate(input);
  const outcome=math.calculate({...input,purchaseCost:r.maxBuy});
  assert.ok(Math.abs(outcome.roi-100)<1e-9);
});
test('break-even and target prices clear costs at cent precision across fee discontinuities',()=>{
  for(const marketplace of ['custom','ebay','poshmark','mercari']){
    for(const purchaseCost of [0,7.04,8,20,7500]){
      const input={...base,marketplace,purchaseCost};const r=math.calculate(input);
      assert.ok(math.calculate({...input,salePrice:r.breakEven}).profit>=-1e-7);
      assert.ok(math.calculate({...input,salePrice:r.minimumSale}).profit>=15-1e-7);
      if(r.breakEven>=.01)assert.ok(math.calculate({...input,salePrice:r.breakEven-.01}).profit<1e-7);
    }
  }
});
test('impossible custom percentage has no required price',()=>{
  assert.ok(Number.isNaN(math.calculate({...base,sellerFeePct:100}).breakEven));
});
