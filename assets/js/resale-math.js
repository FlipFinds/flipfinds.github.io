/* One engine for every intent. Tax collected is a fixed entered amount, not revenue. */
(function (root) {
  var config = typeof module === "object" && module.exports ? require('../../data/fees.json') : root.FFFees;
  function receivedShipping(input) { return input.marketplace === "poshmark" ? 0 : input.shippingCharged; }
  function feeParts(sale, input) {
    var posh = config.presets.poshmark.rules;
    if (input.marketplace === "poshmark") return sale < posh.threshold ? {rate:0,fixed:posh.flatFee} : {rate:posh.rate/100,fixed:0};
    var offset = input.feeIncludesShipping ? input.shippingCharged : 0;
    if (input.marketplace === "ebay") {
      offset += input.taxCollected;
      var ebay = config.presets.ebay.rules;
      var base=sale+offset,rate=base<=ebay.tierBase ? ebay.lowerRate/100 : ebay.upperRate/100;
      var fixed=base<=ebay.smallOrderMax ? ebay.smallOrderFee : ebay.regularOrderFee;
      return {rate:rate,fixed:fixed+offset*rate+(base>ebay.tierBase ? ebay.tierBase*(ebay.lowerRate-ebay.upperRate)/100 : 0)};
    }
    return {rate:input.sellerFeePct/100,fixed:offset*input.sellerFeePct/100+input.fixedFee};
  }
  function fees(sale,input){var parts=feeParts(sale,input);return parts.rate*sale+parts.fixed;}
  function profitAt(sale, input) {
    return sale + receivedShipping(input) - input.purchaseCost - input.shippingCost - input.packagingCost - input.otherCosts - fees(sale, input);
  }
  function requiredSale(target, input) {
    if (input.marketplace !== "ebay" && input.marketplace !== "poshmark" && input.sellerFeePct >= 100) return NaN;
    var cuts = [0];
    if (input.marketplace === "poshmark") cuts.push(config.presets.poshmark.rules.threshold);
    if (input.marketplace === "ebay") {
      var rules=config.presets.ebay.rules;
      var offset=(input.feeIncludesShipping ? input.shippingCharged : 0)+input.taxCollected;
      [rules.smallOrderMax-offset,rules.tierBase-offset].forEach(function(c){if(c>0)cuts.push(c);});
    }
    cuts.sort(function(a,b){return a-b;});cuts.push(Infinity);
    var candidates=[];
    // Solve each linear region independently: fee jumps can make profit non-monotonic.
    for(var i=0;i<cuts.length-1;i++){
      var start=cuts[i],end=cuts[i+1],sample=start+.001;
      var parts=feeParts(sample,input),slope=1-parts.rate;
      if(slope<=0)continue;
      var invested=input.purchaseCost+input.shippingCost+input.packagingCost+input.otherCosts;
      var required=(target+invested+parts.fixed-receivedShipping(input))/slope;
      var price=Math.ceil((Math.max(start,required)-1e-7)*100)/100;
      // Include the exact boundary plus its adjacent cent on either side.
      [price,price+.01,Math.floor(start*100)/100,Math.ceil(start*100)/100,Math.floor(end*100)/100].forEach(function(c){
        if(Number.isFinite(c)&&c>=0&&c>=start-.01&&c<=end+.01&&profitAt(c,input)>=target-1e-7)candidates.push(c);
      });
    }
    return candidates.length ? Math.min.apply(null,candidates) : NaN;
  }
  function calculate(input) {
    var overhead = input.shippingCost + input.packagingCost + input.otherCosts;
    var invested = input.purchaseCost + overhead;
    var revenue = input.salePrice + receivedShipping(input);
    var sellerFees = fees(input.salePrice, input);
    var profit = revenue - invested - sellerFees;
    var available = revenue - sellerFees;
    var targetProfit = input.targetMode === "roi" ? invested * input.targetValue / 100 : input.targetValue;
    return {
      revenue: revenue, sellerFees: sellerFees, invested: invested, profit: profit,
      roi: invested > 0 ? profit / invested * 100 : NaN,
      margin: revenue > 0 ? profit / revenue * 100 : NaN,
      breakEven: requiredSale(0, input), minimumSale: input.targetMode === "roi" && invested === 0 ? NaN : requiredSale(targetProfit, input),
      maxBuy: input.targetMode === "roi" ? available / (1 + input.targetValue / 100) - overhead : available - overhead - input.targetValue,
      meetsTarget: input.targetMode === "roi" && invested === 0 ? null : profit >= targetProfit - 1e-7
    };
  }
  var api = { fees: fees, requiredSale: requiredSale, calculate: calculate };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.FFResaleMath = api;
})(typeof window === "object" ? window : this);
