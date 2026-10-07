/* Referência pública de mesma origem; não envia orçamento nem dados do usuário. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CotacaoIndice=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function valid(q,now=Date.now()){
    return !!q&&q.version===1&&typeof q.points==='number'&&Number.isFinite(q.points)&&q.points>0&&q.points<=1e7&&
      ['spot','future'].includes(q.kind)&&['Yahoo Finance','brapi'].includes(q.source)&&typeof q.symbol==='string'&&
      (q.kind==='spot'?q.symbol==='^BVSP':/^WIN[FGHJKMNQUVXZ][0-9]{2}$/.test(q.symbol))&&
      Number.isFinite(Date.parse(q.asOf))&&Date.parse(q.asOf)>Date.UTC(2020,0,1)&&Date.parse(q.asOf)<=now+300000;
  }
  function describe(q,now=Date.now()){
    if(!valid(q,now))throw Error('Referência inválida');
    const date=new Date(q.asOf),stale=now-date.getTime()>36*3600000;
    const when=q.kind==='future'?date.toLocaleDateString('pt-BR',{timeZone:'UTC'}):date.toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'});
    const label=(q.kind==='spot'?'Ibovespa à vista · aproximação para o WIN':'WIN · '+q.symbol+' · ajuste de fim de dia')+' · '+q.source+' · '+when+' · '+(stale?'Referência antiga: confira antes de usar.':'Não é tempo real.');
    return {...q,label,stale};
  }
  async function load(){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);try{const r=await fetch('cotacao.json',{cache:'no-store',signal:controller.signal});if(!r.ok)throw Error('Cotação indisponível');return describe(await r.json());}finally{clearTimeout(timer);}}
  return {valid,describe,load};
});
