/* Cartão usa o mesmo modelo da tela, sem recalcular ou juntar versões antigas. */
(function(){
  'use strict';
  const $=id=>document.getElementById(id), money=v=>(v/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}), num=v=>v.toLocaleString('pt-BR');
  function draw(m){
    const c=document.createElement('canvas');c.width=1080;c.height=1350;const x=c.getContext('2d');
    x.fillStyle='#fff';x.fillRect(0,0,1080,1350);
    function text(s,a,b,size=24,color='#183247',bold=false,max=960){x.font=(bold?'700 ':'400 ')+size+'px Arial, sans-serif';x.fillStyle=color;x.fillText(s,a,b,max);}
    function line(y){x.strokeStyle='#d7e1e8';x.beginPath();x.moveTo(60,y);x.lineTo(1020,y);x.stroke();}
    function tile(a,b,w,title,value,color='#183247'){x.fillStyle='#f5f8f7';x.fillRect(a,b,w,86);text(title,a+18,b+29,20,'#4a5e70',false,w-36);text(value,a+18,b+66,32,color,true,w-36);}
    function paragraph(value,a,b,width){x.font='20px Arial, sans-serif';let row='',y=b;for(const word of value.split(' ')){const next=row?row+' '+word:word;if(row&&x.measureText(next).width>width){text(row,a,y,20,'#4a5e70');row=word;y+=25;}else row=next;}if(row)text(row,a,y,20,'#4a5e70');}
    function rule(card,i){
      const a=60+(i%2)*490,b=986+Math.floor(i/2)*135,w=470,h=122,color=['#438b75','#5b85a8','#b56a63','#a88d55'][i];
      x.save();x.beginPath();x.roundRect(a,b,w,h,12);x.fillStyle='#fafbfc';x.fill();x.strokeStyle='#d7e1e8';x.lineWidth=1;x.stroke();x.clip();
      x.fillStyle=color;x.fillRect(a,b,5,h);
      // Mesmos ícones dos cartões da página, como marca-d'água deslocada.
      x.save();x.globalAlpha=.10;x.strokeStyle=color;x.lineWidth=1.8;x.lineCap='round';x.lineJoin='round';x.translate(a+w-83,b+h-76);x.rotate(i%2?.18:-.18);x.scale(3.6,3.6);
      card.querySelectorAll('svg path,svg line,svg circle').forEach(node=>{const n=k=>Number(node.getAttribute(k));if(node.tagName==='path')x.stroke(new Path2D(node.getAttribute('d')));else{x.beginPath();if(node.tagName==='circle')x.arc(n('cx'),n('cy'),n('r'),0,Math.PI*2);else{x.moveTo(n('x1'),n('y1'));x.lineTo(n('x2'),n('y2'));}x.stroke();}});x.restore();
      text(card.querySelector('strong').textContent,a+20,b+34,24,'#183247',true,w-40);
      paragraph(card.querySelector('span').textContent,a+20,b+65,w-44);x.restore();
    }
    text('PARAQUEDAS DO TRADER',60,57,22,'#235c47',true);
    text('Meu gerenciamento de risco',60,110,42,'#183247',true);
    text('Emitido em '+new Date().toLocaleDateString('pt-BR')+' · Uma operação por dia',60,150,23,'#4a5e70');line(174);
    tile(60,194,465,'ORÇAMENTO DO PERÍODO',money(m.budget.total));tile(545,194,475,'STOP FINANCEIRO / LIMITE DIÁRIO',money(m.stop),'#8a3734');
    text(m.days+' dias previstos · saldo após registros: '+money(m.actual.remaining),60,315,25);
    text('OPERAÇÃO SELECIONADA',60,355,20,'#4a5e70',true);
    text(m.asset+' · '+num(m.selected.p)+' pontos · '+m.selected.n+' contrato(s)',60,393,33,'#183247',true);
    text('Perda prevista no stop: '+money(m.selected.loss),60,428,25,'#8a3734');
    tile(60,449,465,'META MÍNIMA · 2:1',money(m.target2),'#235c47');tile(545,449,475,'META PREFERIDA · 3:1',money(m.target3),'#235c47');
    text('Alvos em pontos: '+num(m.selected.p*2)+' (2:1) / '+num(m.selected.p*3)+' (3:1)',60,570,24);
    text('Contratos por tamanho de stop',60,616,29,'#183247',true);
    for(const [asset,a] of [['WIN',60],['WDO',550]]){
      text(asset+' · '+(asset==='WIN'?'Mini Índice':'Mini Dólar'),a,656,23,'#28577d',true,460);
      text('STOP (PTS)',a,695,18,'#4a5e70',true);text('CONTR.',a+168,695,18,'#4a5e70',true);text('RISCO',a+295,695,18,'#4a5e70',true);
      m.tables[asset].forEach((r,i)=>{const y=730+i*34;if(m.asset===asset&&m.index===i){x.fillStyle='#eef6f1';x.fillRect(a-8,y-25,470,32);}text(num(r.p),a,y,23);text(String(r.n),a+178,y,23,'#183247',true);text(money(r.loss),a+295,y,23,'#183247',false,165);});
    }
    line(925);text('Disciplina antes da entrada',60,967,29,'#183247',true);
    document.querySelectorAll('.rule-hl').forEach(rule);
    text('Valores teóricos, sem custos ou slippage. Não há garantia de resultado.',60,1283,20,'#4a5e70');
    text('Gratuito · theceji.github.io/paraquedas',60,1315,20,'#4a5e70');return c;
  }
  function ligar(buttonId,getModel){
    const button=$(buttonId),dialog=$('cartaoDialog');let url=null,generation=0,downloadStarted=false;
    const release=()=>{generation++;if(url){const released=url;if(downloadStarted)setTimeout(()=>URL.revokeObjectURL(released),30000);else URL.revokeObjectURL(released);}url=null;button.focus();};
    dialog.addEventListener('close',release);$('fecharCartao').addEventListener('click',()=>dialog.close());
    $('baixarCartao').addEventListener('click',()=>{downloadStarted=true;setTimeout(()=>{if(dialog.open)dialog.close();},150);});
    button.addEventListener('click',async()=>{
      const m=getModel();if(!m.canExport)return;const run=++generation;downloadStarted=false;
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
