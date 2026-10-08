/* Fonte única dos cálculos de orçamento, contratos, metas e limites. Valores monetários em centavos. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GerenciamentoModelo = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const DEFAULTS = { WIN: [100,200,250,300,350,400,450,500,600,700,800,900,1000,1200,1500,1700,2000,2100,2500], WDO: [7,10,12,15,17,25] };
  const POINT = { WIN:20, WDO:1000 }; // centavos por ponto
  const finite = v => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1e9;
  const cents = v => Math.round(v * 100);
  const monthlyYield = f => cents(f.capital*(Math.pow(1+f.cdi/100,1/12)-1)*(1-f.tax/100));
  const extraAllocation = x => x.allocation === undefined ? cents(x.amount*x.percent/100) : cents(x.allocation);
  function validFinance(f) {
    return !!f && ['income','bills','capital','allocation','withdrawal','cdi','tax'].every(k=>finite(f[k])) &&
      ['none','partial','full'].includes(f.reserve) && f.allocation <= Math.max(0, f.income-f.bills)+.00001 &&
      f.cdi <= 50 && [15,17.5,20,22.5].includes(f.tax) &&
      (f.yieldAllocation === undefined || (finite(f.yieldAllocation) && f.yieldAllocation <= monthlyYield(f)/100)) && Array.isArray(f.extras) && f.extras.length <= 4 &&
      f.extras.every(x=>x && ['aluguel','dividendos','extra','prolabore','outra'].includes(x.type) && finite(x.amount) && (x.allocation === undefined ? finite(x.percent) && x.percent<=100 : finite(x.allocation) && x.allocation<=x.amount));
  }
  function budget(f) {
    if (!validFinance(f)) return {total:0,income:0,yield:0,allocation:0,extras:0,withdrawal:0,health:'unknown'};
    const estimatedYield=monthlyYield(f),yieldValue=f.yieldAllocation===undefined?estimatedYield:cents(f.yieldAllocation);
    const extra=f.extras.reduce((n,x)=>n+extraAllocation(x),0);
    const allocation=cents(f.allocation),withdrawal=cents(f.withdrawal);
    return {total:yieldValue+extra+allocation+withdrawal,yield:yieldValue,estimatedYield,extras:extra,allocation,withdrawal,
      income:yieldValue+extra+allocation,health:f.income<f.bills||(withdrawal>0&&f.reserve==='none')?'red':f.reserve!=='full'||withdrawal>0?'amber':'green'};
  }
  function ledger(results, total, daily, days) {
    let sum=0,first=null,highestLoss=0,gains=0,losses=0;
    const rows=Array.from({length:days},(_,i)=>{
      const v=results[i]; if (typeof v!=='number'||!Number.isFinite(v)) return {day:i+1,value:null};
      const before=first!==null; sum+=cents(v); highestLoss=Math.max(highestLoss,-sum);
      if(first===null&&sum<0&&-sum>=total) first=i+1;
      if(v>0) gains++; if(v<0) losses++;
      return {day:i+1,value:cents(v),balance:total+sum,after:before,dailyViolation:cents(v)<-daily,hit:first===i+1};
    });
    return {rows,sum,remaining:Math.max(0,total+sum),first,highestLoss,gains,losses};
  }
  function calculate(state) {
    const confirmed=validFinance(state.finance), b=budget(state.finance);
    const stop=finite(state.stop)?cents(state.stop):0;
    const configured=confirmed&&b.total>0&&stop>0&&stop<=b.total;
    const days=configured?Math.min(20,Math.floor(b.total/stop)):0;
    // Guardar lançamentos mesmo quando uma edição deixa o orçamento/stop inválido.
    const entries=Array.isArray(state.results)?state.results:[];
    const activeCount=Math.min(20,entries.length);
    const actual=ledger(entries,b.total,stop,activeCount);
    const eligible=configured&&actual.first===null&&actual.remaining>=stop;
    const tables={WIN:contractTable('WIN',stop),WDO:contractTable('WDO',stop)};
    let message=!confirmed?'Conclua suas respostas para calcular.':b.total<=0?'Sem orçamento disponível. A tabela é apenas uma referência; não há orçamento para operar.':stop<=0?'Informe um stop financeiro maior que zero.':stop>b.total?'O stop excede o orçamento. Reduza o stop ou reveja suas respostas.':actual.first!==null?'Limite do orçamento atingido no dia '+actual.first+'. Encerre o período.':actual.remaining<stop?'O saldo restante não comporta outro stop completo. Encerre ou revise o período.':'Limites compatíveis. Uma operação por dia; o stop financeiro também é o limite diário.';
    return {confirmed,budget:b,stop,days,actual,eligible,tables,message,
      target2:stop*2,target3:stop*3,canExport:eligible};
  }
  // Tabela informativa: nenhuma linha altera metas, simulações ou emissão.
  function contractTable(asset,risk){
    const point=POINT[asset],rows=[];
    for(const p of DEFAULTS[asset]){const n=Math.floor(risk/(p*point));rows.push({p,n,loss:n*p*point});if(n===0)return rows;}
    const tick=asset==='WIN'?5:.5,p=(Math.floor(risk/(point*tick))+1)*tick;
    rows.push({p,n:0,loss:0,terminal:true});return rows;
  }
  function simulationContext(model,period='operator'){
    if(period==='monthly'){const stop=model.stop||35000;return {days:20,stop,budget:{total:stop*20},example:!model.stop};}
    return {days:model.days,stop:model.stop,budget:{total:model.budget.total},example:false};
  }
  function scenario(model, percent, payoff, order) {
    const days=model.days,loss=model.stop;
    if(!days||!loss)return [];
    const gains=Math.round(days*percent/100),values=Array(days).fill(-loss);
    let k=0; for(const i of order){if(i>=0&&i<days&&k<gains){values[i]=loss*(payoff==='mix'?(k%2?2:3):Number(payoff));k++;}}
    let total=0,closed=false;
    return values.map(v=>{if(closed)return null;total+=v;if(total<=-model.budget.total||model.budget.total+total<model.stop)closed=true;return v/100;});
  }
  return {DEFAULTS,POINT,cents,monthlyYield,extraAllocation,validFinance,budget,ledger,calculate,contractTable,simulationContext,scenario};
});