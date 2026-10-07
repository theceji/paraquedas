/* Interface do gerenciamento unificado. Dados confirmados locais; diário na sessão da aba. */
(function () {
  'use strict';
  const M=window.GerenciamentoModelo,$=id=>document.getElementById(id);
  const KEY='paraquedas-gerenciamento-v2',SESSION='paraquedas-diario-v2',TTL=30*86400000;
  const money=c=>(c<0?'−':'')+(Math.abs(c)/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const number=v=>v.toLocaleString('pt-BR',{maximumFractionDigits:2});
  const clone=v=>JSON.parse(JSON.stringify(v));
  const month=()=>new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',timeZone:'America/Sao_Paulo'}).format(new Date());
  function read(storage,key){try{return JSON.parse(storage.getItem(key)||'null');}catch{return null;}}
  function store(storage,key,value){try{storage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
  const state={finance:null,stop:null,stops:clone(M.DEFAULTS),selected:{asset:'WIN',index:0},results:Array(20).fill(null)};
  let previous=null,legacy=null,model,mode='manual',undo=null,order=[],rowsKey='',editing=false,stepOne=null,quote=null;
  let savedOK=true,sessionOK=true,openedBy=null,quoteRequest=0,quoteError=false;
  // Acesso aos objetos de armazenamento também pode ser bloqueado pelo navegador.
  let local,session;try{local=window.localStorage;}catch{}try{session=window.sessionStorage;}catch{}
  const rememberedQuote=session&&read(session,'paraquedas-cotacao-v1');
  if(rememberedQuote?.manual&&Number.isFinite(rememberedQuote.points)&&rememberedQuote.points>0&&rememberedQuote.points<=1e7&&Number.isFinite(Date.parse(rememberedQuote.asOf)))quote={...rememberedQuote,label:'Referência manual de índice futuro · informada em '+new Date(rememberedQuote.asOf).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'})+'.'};
  const saved=local&&read(local,KEY);
  if(saved?.version===2&&Date.now()-saved.ts<TTL&&saved.ts<=Date.now()+300000){
    previous=M.validFinance(saved.finance)?saved.finance:null;
    if(saved.month===month())state.finance=previous;
    if(Number.isFinite(saved.stop)&&saved.stop>=0)state.stop=saved.stop;
    for(const asset of ['WIN','WDO'])if(Array.isArray(saved.stops?.[asset])&&saved.stops[asset].length===6)state.stops[asset]=saved.stops[asset].map((v,i)=>Number.isFinite(v)&&v>=0?v:M.DEFAULTS[asset][i]);
    if(saved.selected&&['WIN','WDO'].includes(saved.selected.asset)&&Number.isInteger(saved.selected.index)&&saved.selected.index>=0&&saved.selected.index<6)state.selected=saved.selected;
  }else if(local){
    const old=read(local,'paraquedas-plano');
    const pq=old?.pq&&Date.now()-old.pq.ts<TTL?old.pq:null,ger=old?.ger&&Date.now()-old.ger.ts<TTL?old.ger:null;
    if(pq?.entradas)legacy=pq.entradas;
    if(ger&&Number.isFinite(ger.risco)&&ger.risco>=0)state.stop=ger.risco;
    else if(pq&&Number.isFinite(pq.stopEf)&&pq.stopEf>=0)state.stop=pq.stopEf;
    for(const asset of ['WIN','WDO']){const values=ger?.[asset==='WIN'?'stopsWin':'stopsWdo'];if(Array.isArray(values)&&values.length===6)state.stops[asset]=values.map((v,i)=>Number.isFinite(v)&&v>=0?v:M.DEFAULTS[asset][i]);}
  }
  const diary=session&&read(session,SESSION);
  if(diary?.month===month()&&Array.isArray(diary.results))state.results=Array.from({length:20},(_,i)=>typeof diary.results[i]==='number'&&Number.isFinite(diary.results[i])&&Math.abs(diary.results[i])<=1e9?diary.results[i]:null);
  function persist(){
    if(state.finance)savedOK=store(local,KEY,{version:2,ts:Date.now(),month:month(),finance:state.finance,stop:state.stop,stops:state.stops,selected:state.selected});
    sessionOK=store(session,SESSION,{month:month(),results:state.results});
    $('estadoSalvo').textContent=(savedOK?'Respostas e limites salvos por até 30 dias.':'Armazenamento local indisponível; mantenha esta página aberta.')+' '+(sessionOK?'Diário preservado nesta aba.':'Não foi possível preservar o diário ao recarregar.');
  }
  const inputNumber=id=>$(id).value===''?null:Number($(id).value);
  function stage(n){$('obrigacoesForm').hidden=n!==1;$('riscoForm').hidden=n!==2;$('etapaRotulo').textContent='Etapa '+n+' de 2';$('perguntasTitulo').textContent=n===1?'Suas obrigações':'Quanto vai para o risco?';$('orcamentoDialog').scrollTop=0;$(n===1?'renda':'temAplicacao').focus();}
  function refreshSobra(){
    const a=inputNumber('renda'),b=inputNumber('contas');
    $('sobraValor').textContent=a===null||b===null?'—':money(M.cents(a-b));
    const max=Math.max(0,(a||0)-(b||0));$('sobraRisco').max=String(max);$('sobraMaxima').textContent='Até '+money(M.cents(max))+' disponíveis da sobra. Informe zero se não destinar essa parte.';
  }
  function optionalFields(){
    const application=$('temAplicacao').value==='yes';$('aplicacaoCampos').hidden=!application;
    ['patrimonio','cdi','ir'].forEach(id=>$(id).disabled=!application);$('cdi').max='50';
    const extras=$('temExtras').value==='yes';$('extrasCampos').hidden=!extras;
    $('extras').querySelectorAll('input,select').forEach(e=>e.disabled=!extras);
    $('adicionarRenda').disabled=$('extras').children.length>=4;
  }
  function addExtra(x){
    if($('extras').children.length>=4)return;
    const item=document.createElement('div');item.className='extra-source';
    item.innerHTML='<div class="extra-heading"><select class="extra-type" aria-label="Tipo de renda" required><option value="">Selecione</option><option value="aluguel">Aluguel</option><option value="dividendos">Dividendos</option><option value="extra">Renda extra / freela</option><option value="prolabore">Pró-labore</option><option value="outra">Outra renda</option></select><button type="button" class="btn remove-extra" aria-label="Remover esta renda">×</button></div><div class="wizard-fields"><div class="field"><label>Valor líquido (R$)<input class="extra-amount" type="number" min="0" max="1000000000" step="0.01" required inputmode="decimal"></label></div><div class="field"><label>Vai para o risco (%)<input class="extra-percent" type="number" min="0" max="100" step="0.01" required inputmode="decimal"></label></div></div>';
    if(x){item.querySelector('.extra-type').value=x.type;item.querySelector('.extra-amount').value=x.amount;item.querySelector('.extra-percent').value=x.percent;}
    item.querySelector('.remove-extra').addEventListener('click',()=>{item.remove();if(!$('extras').children.length)$('temExtras').value='no';optionalFields();});
    $('extras').append(item);optionalFields();
  }
  function fillWizard(f){
    $('obrigacoesForm').reset();$('riscoForm').reset();$('extras').replaceChildren();$('wizardErro').hidden=true;
    if(f){
      $('renda').value=f.income;$('contas').value=f.bills;$('reserva').value=f.reserve;
      $('temAplicacao').value=f.capital>0?'yes':'no';$('patrimonio').value=f.capital;$('cdi').value=f.cdi;$('ir').value=f.tax;
      $('sobraRisco').value=f.allocation;$('saque').value=f.withdrawal;$('temExtras').value=f.extras.length?'yes':'no';f.extras.forEach(addExtra);
    }else if(legacy){
      for(const [id,key] of [['renda','renda'],['contas','contas'],['patrimonio','pat'],['cdi','cdi'],['ir','ir'],['saque','saque']])if(legacy[key]!==undefined)$(id).value=legacy[key];
      $('reserva').value={nao:'none',parte:'partial',completa:'full'}[legacy.reserva]||'';
      $('temAplicacao').value=Number(legacy.pat)>0?'yes':'no';
      const allocation=Math.max(0,Number(legacy.renda)-Number(legacy.contas))*Number(legacy.fracSobra);
      if(Number.isFinite(allocation))$('sobraRisco').value=(Math.round(allocation*100)/100);
      const extras=Array.isArray(legacy.extras)?legacy.extras.slice(0,4):[];$('temExtras').value=extras.length?'yes':'no';
      extras.forEach(x=>addExtra({type:x.tipo,amount:x.valor,percent:x.pct}));
    }
    optionalFields();refreshSobra();
  }
  function openWizard(button){editing=!!state.finance;$('orcamentoDialog').setAttribute('closedby',editing?'closerequest':'none');openedBy=button;fillWizard(state.finance||previous);$('cancelarEdicao').hidden=!editing;$('migracaoAviso').hidden=!!state.finance||!(legacy||previous);$('orcamentoDialog').showModal();stage(1);}
  $('obrigacoesForm').addEventListener('submit',e=>{e.preventDefault();if(!$('obrigacoesForm').reportValidity())return;stepOne={income:inputNumber('renda'),bills:inputNumber('contas'),reserve:$('reserva').value};refreshSobra();stage(2);});
  $('riscoForm').addEventListener('submit',e=>{
    e.preventDefault();if(!$('riscoForm').reportValidity())return;
    const app=$('temAplicacao').value==='yes';
    const f={...stepOne,capital:app?inputNumber('patrimonio'):0,cdi:app?inputNumber('cdi'):0,tax:app?Number($('ir').value):15,allocation:inputNumber('sobraRisco'),withdrawal:inputNumber('saque'),extras:$('temExtras').value==='yes'?[...$('extras').children].map(item=>({type:item.querySelector('.extra-type').value,amount:Number(item.querySelector('.extra-amount').value),percent:Number(item.querySelector('.extra-percent').value)})):[]};
    if(!M.validFinance(f)||($('temExtras').value==='yes'&&!f.extras.length)){$('wizardErro').hidden=false;$('wizardErro').textContent='Confira os valores e a parcela da sobra. Todos os campos aplicáveis precisam de resposta válida.';return;}
    state.finance=f;legacy=null;previous=null;persist();render();$('orcamentoDialog').close();$('rever').focus();
  });
  $('renda').addEventListener('input',refreshSobra);$('contas').addEventListener('input',refreshSobra);
  $('temAplicacao').addEventListener('change',optionalFields);$('temExtras').addEventListener('change',()=>{if($('temExtras').value==='yes'&&!$('extras').children.length)addExtra();optionalFields();});
  $('adicionarRenda').addEventListener('click',()=>{addExtra();$('extras').lastElementChild?.querySelector('select').focus();});
  $('voltarEtapa').addEventListener('click',()=>stage(1));
  $('cancelarEdicao').addEventListener('click',()=>{$('orcamentoDialog').close();openedBy?.focus();});
  $('orcamentoDialog').addEventListener('keydown',e=>{if(e.key==='Escape'&&!editing)e.preventDefault();});
  $('orcamentoDialog').addEventListener('cancel',e=>{if(!editing){e.preventDefault();$('perguntasDescricao').textContent='Conclua as duas etapas ou use Voltar ao início. Não há opção de pular.';}else openedBy?.focus();});
  $('comecar').addEventListener('click',e=>openWizard(e.currentTarget));$('rever').addEventListener('click',e=>openWizard(e.currentTarget));

  function mountTables(){for(const asset of ['WIN','WDO']){
    const body=$(asset==='WIN'?'tWin':'tWdo');
    body.innerHTML=state.stops[asset].map((v,i)=>'<tr id="row'+asset+i+'" data-asset="'+asset+'" data-index="'+i+'"><td><div class="stop-choice"><input id="stop'+asset+i+'" data-asset="'+asset+'" data-index="'+i+'" type="number" min="'+(asset==='WIN'?5:.5)+'" max="1000000" step="'+(asset==='WIN'?5:.5)+'" value="'+v+'" aria-label="Stop '+asset+' em pontos, linha '+(i+1)+'"></div></td><td><button class="contract-select" id="n'+asset+i+'" type="button" aria-pressed="false">—</button></td><td id="loss'+asset+i+'">—</td></tr>').join('');
    body.addEventListener('click',e=>{const row=e.target.closest('tr');if(!row)return;state.selected={asset,index:Number(row.dataset.index)};persist();render();});
    body.addEventListener('input',e=>{const {asset,index}=e.target.dataset;if(!asset)return;state.selected={asset,index:Number(index)};state.stops[asset][Number(index)]=e.target.value===''?0:Number(e.target.value);persist();render();});
  }}
  function renderAnswers(){
    const f=state.finance,b=model.budget,reserve={none:'Não tenho',partial:'Parcial',full:'Completa'}[f.reserve];
    function list(id,items){const dl=$(id);dl.replaceChildren();for(const [label,value]of items){const group=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;group.append(dt,dd);dl.append(group);}}
    const cash=v=>money(M.cents(v));
    list('respostasResumo',[['Renda líquida',cash(f.income)],['Contas do mês',cash(f.bills)],['Reserva de emergência',reserve],['Destinado ao risco',money(b.total)]]);
    list('respostasObrigacoes',[['Renda líquida mensal',cash(f.income)],['Contas do mês',cash(f.bills)],['Sobra após as contas',cash(f.income-f.bills)],['Reserva de emergência',reserve]]);
    const risk=[['Patrimônio aplicado',cash(f.capital)],['CDI estimado ao ano',f.capital>0?number(f.cdi)+'%':'Não se aplica'],['IR sobre rendimento',f.capital>0?number(f.tax)+'%':'Não se aplica'],['Rendimento mensal estimado líquido',money(b.yield)],['Sobra destinada ao risco',cash(f.allocation)],['Retirada do patrimônio',cash(f.withdrawal)]];
    const labels={aluguel:'Aluguel',dividendos:'Dividendos',extra:'Renda extra / freela',prolabore:'Pró-labore',outra:'Outra renda'};
    if(!f.extras.length)risk.push(['Outras rendas','Nenhuma informada']);
    f.extras.forEach((e,i)=>risk.push(['Renda '+(i+1)+' · '+labels[e.type],cash(e.amount)+' · '+number(e.percent)+'% para o risco ('+cash(e.amount*e.percent/100)+')']));
    list('respostasRisco',risk);
  }
  function shuffle(){order=Array.from({length:20},(_,i)=>i);for(let i=19;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}}
  function drawChart(id,values,labels){const W=600,H=200,pl=50,pb=25,pt=12;const maxP=Math.max(1,...values),maxN=Math.max(1,...values.map(v=>-v)),height=H-pb-pt,y0=pt+height*maxP/(maxP+maxN),scale=height/(maxP+maxN),step=(W-pl-12)/Math.max(1,values.length);let svg='<line x1="'+pl+'" x2="590" y1="'+y0+'" y2="'+y0+'" stroke="var(--line)"/>';values.forEach((v,i)=>{const x=pl+(i+.5)*step,h=Math.abs(v)*scale;svg+='<rect x="'+(x-step*.3)+'" y="'+(v>=0?y0-h:y0)+'" width="'+step*.6+'" height="'+h+'" fill="'+(v>=0?'var(--green)':'var(--red)')+'" rx="3"/><text x="'+x+'" y="194" fill="var(--muted)" text-anchor="middle" font-size="11">'+labels[i]+'</text>';});$(id).innerHTML=svg;}
  function renderDiary(){
    const simulated=mode==='scenario', values=simulated?M.scenario(model,Number($('acerto').value),$('payoff').value,order):state.results;
    const summary=simulated?M.ledger(values,model.budget.total,model.stop,model.days):model.actual;
    $('acertoField').hidden=!simulated;$('payoffField').hidden=!simulated;$('sortear').hidden=!simulated;$('limpar').hidden=simulated;$('desfazer').hidden=simulated||!undo;
    const key=model.days+'|'+mode;
    if(rowsKey!==key){$('tDias').innerHTML=Array.from({length:model.days},(_,i)=>'<tr id="dayrow'+i+'"><td>'+(i+1)+'</td><td>'+(simulated?'<span id="d'+i+'"></span>':'<input id="d'+i+'" data-day="'+i+'" type="number" step="0.01" min="-1000000000" max="1000000000" inputmode="decimal" aria-label="Resultado do dia '+(i+1)+' em reais">')+'</td><td id="sit'+i+'"></td><td id="saldo'+i+'"></td></tr>').join('');rowsKey=key;}
    summary.rows.slice(0,model.days).forEach((r,i)=>{const value=values[i];if(simulated)$('d'+i).textContent=r.value===null?'—':money(r.value);else if(document.activeElement!==$('d'+i))$('d'+i).value=typeof value==='number'?value:'';
      $('sit'+i).textContent=r.value===null?'—':(r.value>0?'Gain':r.value<0?'Loss':'Zero')+(r.after?' · após limite':r.hit?' · limite':r.dailyViolation?' · excedeu stop':'');
      $('dayrow'+i).classList.toggle('violation',!!(r.hit||r.after||r.dailyViolation));$('saldo'+i).textContent=r.value===null?'—':money(r.balance);
    });
    $('diasBadge').textContent=model.days+' dias';$('semDias').hidden=model.days>0;
    $('resultadoRotulo').textContent=simulated?'Resultado simulado':'Resultado registrado';$('resultadoTotal').textContent=money(summary.sum);$('saldoAtual').textContent=money(model.budget.total+summary.sum);$('acertosResumo').textContent=summary.gains+' / '+summary.losses;
    $('usoOrcamento').textContent=model.budget.total>0?number(summary.highestLoss/model.budget.total*100)+'%':summary.highestLoss>0?'Sem orçamento':'—';
    const violations=summary.rows.filter(r=>r.dailyViolation).length;
    $('diarioAlerta').textContent=summary.first!==null?'Limite do orçamento atingido no dia '+summary.first+'. '+(simulated?'O cenário encerra nesse limite.':'Lançamentos posteriores são violações; ganhos depois não apagam a ocorrência. Registros fora dos dias previstos também entram no saldo.'):violations?'Há '+violations+' dia(s) com perda superior ao stop diário informado.':simulated?'Cenário hipotético. Seus resultados próprios estão preservados e não entram nesta simulação.':'Registre uma operação por dia. O limite mensal é o orçamento confirmado.';
    $('diarioAlerta').classList.toggle('error',summary.first!==null||violations>0);
    const extra=state.results.map((v,i)=>({v,i})).filter(x=>x.i>=model.days&&x.v!==null);$('foraPeriodo').hidden=!extra.length;$('foraLista').replaceChildren();extra.forEach(x=>{const li=document.createElement('li');li.textContent='Dia '+(x.i+1)+': '+money(M.cents(x.v));$('foraLista').append(li);});
    drawChart('graficoDias',summary.rows.slice(0,model.days).map(r=>(r.value||0)/100),summary.rows.slice(0,model.days).map(r=>r.day));
  }
  function renderAnnual(){const sequence=[.4,-.6,.8,-.3,.5,-1,.6,.5,-.4,.9,-.3,.7],part=Number($('reinvestir').value);let extra=0,total=0,kept=0;const results=sequence.map(rate=>{const base=model.budget.total,v=Math.round((base+extra)*rate);total+=v;if(v>0){const back=Math.round(v*part);extra+=back;kept+=v-back;}else extra=Math.max(0,extra-Math.max(0,-v-base));return v/100;});drawChart('graficoAnual',results,['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']);$('resumoAnual').textContent='Resultado hipotético: '+money(total)+' · guardado fora do risco: '+money(kept)+'.';}
  function renderQuote(){
    $('cotacaoValor').textContent=quote?number(quote.points)+' pts':'—';
    $('cotacaoInfo').textContent=quote?quote.label+(quoteError?' Atualização indisponível; mantida a referência acima.':''):'Referência indisponível. Informe um valor manual ou tente atualizar. Contratos pelo stop continuam independentes da cotação.';
    const noc=quote?quote.points*20:null;$('nocional').textContent=noc===null?'—':money(noc);$('alavUm').textContent=noc!==null&&model?.budget.total>0?number(noc/model.budget.total)+'×':'—';$('alavPos').textContent=noc!==null&&model?.budget.total>0&&model.asset==='WIN'&&model.selected.n?number(noc*model.selected.n/model.budget.total)+'×':'—';
  }
  function render(){
    model=M.calculate(state);$('painel').hidden=!model.confirmed;$('inicioObrigatorio').hidden=model.confirmed;
    if(!model.confirmed)return;
    renderAnswers();
    const b=model.budget;$('orcamentoValor').textContent=money(b.total);
    $('saude').className='health '+b.health;$('saude').textContent=b.health==='red'?'Atenção: suas contas não fecham ou há retirada sem reserva. Reveja as respostas antes de arriscar.':b.health==='amber'?'Atenção: reserva incompleta ou retirada do patrimônio.':'Obrigações e reserva cobertas conforme as respostas informadas.';
    $('composicao').replaceChildren();for(const [label,v]of [['Da sobra',b.allocation],['Aplicação',b.yield],['Outras rendas',b.extras],['Do patrimônio',b.withdrawal]]){const li=document.createElement('li');li.textContent=label+': '+money(v);$('composicao').append(li);}
    if(document.activeElement!==$('stopFinanceiro'))$('stopFinanceiro').value=state.stop??'';
    $('alvo2').textContent=money(model.target2);$('alvo3').textContent=money(model.target3);$('alvo2pts').textContent=model.selected?.n?number(model.selected.p*2)+' pontos · '+model.asset:'Selecione um stop válido';$('alvo3pts').textContent=model.selected?.n?number(model.selected.p*3)+' pontos · '+model.asset:'Selecione um stop válido';
    $('diasValor').textContent=model.days+' dias';$('compatibilidade').textContent=model.message;$('compatibilidade').classList.toggle('error',!model.canExport);
    for(const asset of ['WIN','WDO'])model.tables[asset].forEach((row,i)=>{const tr=$('row'+asset+i);$('n'+asset+i).textContent=row.n;$('loss'+asset+i).textContent=money(row.loss);tr.classList.toggle('selected',asset===model.asset&&i===model.index);tr.classList.toggle('invalid',!row.valid);$('n'+asset+i).setAttribute('aria-pressed',String(asset===model.asset&&i===model.index));$('n'+asset+i).setAttribute('aria-label','Selecionar '+asset+', '+number(row.p)+' pontos, '+row.n+' contrato(s)');$('stop'+asset+i).setAttribute('aria-invalid',String(!row.valid));});
    $('selecao').textContent='Selecionado: '+model.asset+' · '+number(model.selected.p)+' pontos · '+model.selected.n+' contrato(s) · perda prevista '+money(model.selected.loss)+'.';
    $('btnCartao').disabled=!model.canExport;$('piorCaso').textContent='O limite do período é '+money(b.total)+'. Desta quantia, '+money(b.withdrawal)+' vieram do patrimônio e '+money(b.income)+' da renda destinada ao risco. A retirada pode reduzir o que já estava guardado. Não há garantia de preservação em operações reais.';
    renderDiary();renderAnnual();renderQuote();
  }
  $('stopFinanceiro').addEventListener('input',()=>{state.stop=inputNumber('stopFinanceiro');persist();render();});
  $('tDias').addEventListener('input',e=>{if(!e.target.matches('[data-day]'))return;if(!e.target.validity.valid)return;state.results[Number(e.target.dataset.day)]=e.target.value===''?null:Number(e.target.value);persist();render();});
  $('modo').addEventListener('change',()=>{mode=$('modo').value;renderDiary();});['acerto','payoff'].forEach(id=>$(id).addEventListener('change',renderDiary));
  $('sortear').addEventListener('click',()=>{shuffle();renderDiary();});
  $('limpar').addEventListener('click',()=>{if(!state.results.some(v=>v!==null))return;undo=[...state.results];state.results.fill(null);persist();render();});
  $('desfazer').addEventListener('click',()=>{if(undo){state.results=undo;undo=null;persist();render();}});
  $('reinvestir').addEventListener('change',renderAnnual);
  async function loadQuote(){const request=++quoteRequest;$('atualizarCotacao').disabled=true;try{const next=await window.CotacaoIndice.load();if(request===quoteRequest){quote=next;quoteError=false;store(session,'paraquedas-cotacao-v1',null);}}catch{if(request===quoteRequest)quoteError=true;}if(request===quoteRequest){renderQuote();$('atualizarCotacao').disabled=false;}}
  $('atualizarCotacao').addEventListener('click',loadQuote);
  $('usarCotacao').addEventListener('click',()=>{const e=$('cotacaoManual');if(!e.value||!e.reportValidity())return;quoteRequest++;quoteError=false;$('atualizarCotacao').disabled=false;quote={points:Number(e.value),manual:true,asOf:new Date().toISOString(),label:'Referência manual de índice futuro · informada em '+new Date().toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'})+'.'};store(session,'paraquedas-cotacao-v1',quote);renderQuote();});
  mountTables();shuffle();render();persist();
  window.GerenciamentoApp={snapshot:()=>clone(M.calculate(state))};
  window.CartaoGerenciamento.ligar('btnCartao',()=>M.calculate(state));
  if(!state.finance)openWizard($('comecar'));
  if(!quote?.manual)loadQuote();
})();