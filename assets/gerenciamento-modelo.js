/* Fonte única dos cálculos de orçamento, contratos, metas e limites. Valores monetários em centavos. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GerenciamentoModelo = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const DEFAULTS = { WIN: [250,300,350,400,450,500], WDO: [10,11,11.5,12,15,20] };
  const POINT = { WIN:20, WDO:1000 }; // centavos por ponto
  const finite = v => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1e9;
  const cents = v => Math.round(v * 100);
  function validFinance(f) {
    return !!f && ['income','bills','capital','allocation','withdrawal','cdi','tax'].every(k=>finite(f[k])) &&
      ['none','partial','full'].includes(f.reserve) && f.allocation <= Math.max(0, f.income-f.bills)+.00001 &&
      f.cdi <= 50 && [15,17.5,20,22.5].includes(f.tax) && Array.isArray(f.extras) && f.extras.length <= 4 &&
      f.extras.every(x=>x && ['aluguel','dividendos','extra','prolabore','outra'].includes(x.type) && finite(x.amount) && finite(x.percent) && x.percent<=100);
  }
  function budget(f) {
    if (!validFinance(f)) return {total:0,income:0,yield:0,allocation:0,extras:0,withdrawal:0,health:'unknown'};
    const yieldValue=cents(f.capital*(Math.pow(1+f.cdi/100,1/12)-1)*(1-f.tax/100));
    const extra=f.extras.reduce((n,x)=>n+cents(x.amount*x.percent/100),0);
    const allocation=cents(f.allocation),withdrawal=cents(f.withdrawal);
    return {total:yieldValue+extra+allocation+withdrawal,yield:yieldValue,extras:extra,allocation,withdrawal,
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
    const make=(asset,risk)=>(state.stops?.[asset]||DEFAULTS[asset]).slice(0,6).map(p=>{
      const valid=finite(p)&&p>0&&Math.abs(p/(asset==='WIN'?5:.5)-Math.round(p/(asset==='WIN'?5:.5)))<1e-7;
      const n=valid&&risk>0?Math.floor(risk/(p*POINT[asset])+1e-9):0;
      return {p,valid,n,loss:Math.round(n*p*POINT[asset])};
    });
    const tables={WIN:make('WIN',eligible?stop:0),WDO:make('WDO',eligible?stop:0)};
    const baseTables={WIN:make('WIN',configured?stop:0),WDO:make('WDO',configured?stop:0)};
    const asset=state.selected?.asset==='WDO'?'WDO':'WIN',index=Math.max(0,Math.min(5,state.selected?.index||0));
    const selected=tables[asset][index],baseSelected=baseTables[asset][index];
    let message=!confirmed?'Conclua suas respostas para calcular.':b.total<=0?'Sem orçamento disponível. Nenhuma operação pode ser dimensionada.':stop<=0?'Informe um stop financeiro maior que zero.':stop>b.total?'O stop excede o orçamento. Reduza o stop ou reveja suas respostas.':actual.first!==null?'Limite do orçamento atingido no dia '+actual.first+'. Encerre o período.':actual.remaining<stop?'O saldo restante não comporta outro stop completo. Encerre ou revise o período.':!selected?.n?'O stop em pontos escolhido não comporta um contrato. Escolha uma linha válida.':'Limites compatíveis. Uma operação por dia; o stop financeiro também é o limite diário.';
    return {confirmed,budget:b,stop,days,actual,eligible,tables,baseTables,asset,index,selected,baseSelected,message,
      target2:(selected?.loss||0)*2,target3:(selected?.loss||0)*3,canExport:eligible&&selected?.n>0};
  }
  function scenario(model, percent, payoff, order) {
    const days=model.days,loss=model.baseSelected?.loss||0;
    if(!days||!loss)return [];
    const gains=Math.round(days*percent/100),values=Array(days).fill(-loss);
    let k=0; for(const i of order){if(i>=0&&i<days&&k<gains){values[i]=loss*(payoff==='mix'?(k%2?2:3):Number(payoff));k++;}}
    let total=0,closed=false;
    return values.map(v=>{if(closed)return null;total+=v;if(total<=-model.budget.total||model.budget.total+total<model.stop)closed=true;return v/100;});
  }
  return {DEFAULTS,POINT,cents,validFinance,budget,ledger,calculate,scenario};
});