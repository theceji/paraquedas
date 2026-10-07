/* Cartão usa o mesmo modelo da tela, sem recalcular ou juntar versões antigas. */
(function(){
  'use strict';
  const $=id=>document.getElementById(id), money=v=>(v/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}), num=v=>v.toLocaleString('pt-BR');
  function draw(m){
    const c=document.createElement('canvas');c.width=1080;c.height=1350;const x=c.getContext('2d');
    x.fillStyle='#fff';x.fillRect(0,0,1080,1350);
    function text(s,a,b,size=24,color='#183247',bold=false,max=960){x.font=(bold?'700 ':'400 ')+size+'px Arial, sans-serif';x.fillStyle=color;x.fillText(s,a,b,max);}
    function line(y){x.strokeStyle='#d7e1e8';x.beginPath();x.moveTo(60,y);x.lineTo(1020,y);x.stroke();}
    function tile(a,b,w,title,value,color='#183247'){x.fillStyle='#f5f8f7';x.fillRect(a,b,w,100);text(title,a+18,b+32,20,'#4a5e70',false,w-36);text(value,a+18,b+76,32,color,true,w-36);}
    text('PARAQUEDAS DO TRADER',60,68,22,'#235c47',true);
    text('Meu gerenciamento de risco',60,126,42,'#183247',true);
    text('Emitido em '+new Date().toLocaleDateString('pt-BR')+' · Uma operação por dia',60,169,23,'#4a5e70');line(194);
    tile(60,218,465,'ORÇAMENTO DO PERÍODO',money(m.budget.total));
    tile(545,218,475,'STOP FINANCEIRO / LIMITE DIÁRIO',money(m.stop),'#8a3734');
    text(m.days+' dias previstos · saldo após registros: '+money(m.actual.remaining),60,358,25);
    text('OPERAÇÃO SELECIONADA',60,414,20,'#4a5e70',true);
    text(m.asset+' · '+num(m.selected.p)+' pontos · '+m.selected.n+' contrato(s)',60,459,33,'#183247',true);
    text('Perda prevista no stop: '+money(m.selected.loss),60,499,25,'#8a3734');
    tile(60,527,465,'META MÍNIMA · 2:1',money(m.target2),'#235c47');
    tile(545,527,475,'META PREFERIDA · 3:1',money(m.target3),'#235c47');
    text('Alvos em pontos: '+num(m.selected.p*2)+' (2:1) / '+num(m.selected.p*3)+' (3:1)',60,664,24);
    text('Contratos por tamanho de stop',60,722,29,'#183247',true);
    for(const [asset,a] of [['WIN',60],['WDO',550]]){
      text(asset+' · '+(asset==='WIN'?'R$ 0,20':'R$ 10,00')+' por ponto',a,766,23,'#28577d',true,460);
      text('STOP (PTS)',a,810,18,'#4a5e70',true);text('CONTR.',a+168,810,18,'#4a5e70',true);text('PERDA',a+295,810,18,'#4a5e70',true);
      m.tables[asset].forEach((r,i)=>{const y=850+i*43;if(m.asset===asset&&m.index===i){x.fillStyle='#eef6f1';x.fillRect(a-8,y-28,470,40);}text(num(r.p),a,y,24);text(String(r.n),a+178,y,24,'#183247',true);text(money(r.loss),a+295,y,24,'#183247',false,165);});
    }
    line(1110);text('Disciplina antes da entrada',60,1155,27,'#183247',true);
    text('1. Respeite o stop.  2. Dimensione os contratos pelo risco.',60,1194,23);
    text('3. Limite atingido, encerre.  4. Meta não é obrigação.',60,1230,23);
    text('Valores teóricos, sem custos ou slippage. Não há garantia de resultado.',60,1280,20,'#4a5e70');
    text('Gratuito · theceji.github.io/paraquedas',60,1315,20,'#4a5e70');return c;
  }
  function ligar(buttonId,getModel){
    const button=$(buttonId),dialog=$('cartaoDialog');let url=null,generation=0;
    const release=()=>{generation++;if(url)URL.revokeObjectURL(url);url=null;button.focus();};
    dialog.addEventListener('close',release);$('fecharCartao').addEventListener('click',()=>dialog.close());
    $('baixarCartao').addEventListener('click',()=>setTimeout(()=>{if(dialog.open)dialog.close();},150));
    button.addEventListener('click',async()=>{
      const m=getModel();if(!m.canExport)return;const run=++generation;
      $('cartaoImagem').hidden=true;$('baixarCartao').hidden=true;$('cartaoCarregando').hidden=false;$('cartaoCarregando').textContent='Preparando seu cartão…';
      $('cartaoResumo').textContent=m.asset+': '+m.selected.n+' contrato(s), stop de '+num(m.selected.p)+' pontos, perda prevista '+money(m.selected.loss)+'. Metas: '+money(m.target2)+' e '+money(m.target3)+'.';
      $('cartaoDica').textContent='Fundo claro para impressão. O cartão reflete os limites e registros atuais, sem dados ocultos.';
      dialog.showModal();$('fecharCartao').focus();
      try{const canvas=draw(m),blob=await new Promise(r=>canvas.toBlob(r,'image/png'));if(run!==generation||!dialog.open)return;if(!blob)throw Error('PNG indisponível');
        url=URL.createObjectURL(blob);$('cartaoImagem').src=url;$('cartaoImagem').alt=$('cartaoResumo').textContent;$('cartaoImagem').hidden=false;
        $('baixarCartao').href=url;$('baixarCartao').download='gerenciamento-de-risco-'+new Date().toISOString().slice(0,10)+'.png';$('baixarCartao').hidden=false;$('cartaoCarregando').hidden=true;
      }catch(e){$('cartaoCarregando').textContent='Não foi possível gerar o cartão. Feche esta janela e tente novamente.';}
    });
  }
  window.CartaoGerenciamento={ligar};
})();
