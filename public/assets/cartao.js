/* Cartão usa o mesmo modelo da tela, sem recalcular ou juntar versões antigas. */
(function(){
  'use strict';
  const I=window.I18n,t=I.t,$=id=>document.getElementById(id),money=I.money,num=I.number;
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
    text(t('PARAQUEDAS DO TRADER'),60,57,22,'#235c47',true);
    text(t('Meu gerenciamento de risco'),60,110,42,'#183247',true);
    text(t('Emitido em {date} · Uma operação por dia',{date:I.date(new Date())}),60,150,23,'#4a5e70');line(174);
    tile(60,194,465,t('ORÇAMENTO DO PERÍODO'),money(m.budget.total));tile(545,194,475,t('STOP FINANCEIRO / LIMITE DIÁRIO'),money(m.stop),'#8a3734');
    text(t('{days} · saldo após registros: {balance}',{days:I.days(m.days),balance:money(m.actual.remaining)}),60,315,25);
    tile(60,339,465,t('META MÍNIMA · 2:1'),money(m.target2),'#235c47');tile(545,339,475,t('META PREFERIDA · 3:1'),money(m.target3),'#235c47');
    text(t('Metas calculadas sobre o stop financeiro.'),60,455,22,'#4a5e70');
    text(t('Contratos por tamanho de stop'),60,497,29,'#183247',true);
    const rows=Math.max(m.tables.WIN.length,m.tables.WDO.length),rowHeight=Math.min(34,350/rows),font=Math.min(23,rowHeight*.83);
    for(const [asset,a] of [['WIN',60],['WDO',550]]){
      text(asset+' · '+(asset==='WIN'?t('Mini Índice'):t('Mini Dólar')),a,535,23,'#28577d',true,460);
      text(t('STOP (PTS)'),a,570,18,'#4a5e70',true);text(t('CONTR.'),a+168,570,18,'#4a5e70',true);text(t('RISCO'),a+295,570,18,'#4a5e70',true);
      m.tables[asset].forEach((r,i)=>{const y=578+(i+1)*rowHeight;if(i%2===0||r.n===0){x.fillStyle=r.n===0?'#fbf3f2':'#f5f8fa';x.fillRect(a-8,y-rowHeight+3,470,rowHeight);}text(num(r.p),a,y,font);text(String(r.n),a+178,y,font,'#183247',true);text(money(r.loss),a+295,y,font,r.n===0?'#963e36':'#183247',false,165);});
    }
    line(944);text(t('Disciplina antes da entrada'),60,967,29,'#183247',true);
    document.querySelectorAll('.rule-hl').forEach(rule);
    text(t('Valores teóricos, sem custos ou slippage. Não há garantia de resultado.'),60,1283,20,'#4a5e70');
    text(t('Gratuito · theceji.github.io/paraquedas'),60,1315,20,'#4a5e70');return c;
  }
  function ligar(buttonId,getModel){
    const button=$(buttonId),dialog=$('cartaoDialog');let url=null,generation=0,downloadStarted=false;
    const release=()=>{generation++;if(url){const released=url;if(downloadStarted)setTimeout(()=>URL.revokeObjectURL(released),30000);else URL.revokeObjectURL(released);}url=null;button.focus();};
    dialog.addEventListener('close',release);$('fecharCartao').addEventListener('click',()=>dialog.close());
    $('baixarCartao').addEventListener('click',()=>{downloadStarted=true;setTimeout(()=>{if(dialog.open)dialog.close();},150);});
    document.addEventListener('languagechange',()=>{if(dialog.open)button.click();});
    button.addEventListener('click',async()=>{
      const m=getModel();if(!m.canExport)return;const run=++generation;downloadStarted=false;if(url){URL.revokeObjectURL(url);url=null;}
      $('cartaoImagem').hidden=true;$('baixarCartao').hidden=true;$('cartaoCarregando').hidden=false;$('cartaoCarregando').textContent=t('Preparando seu cartão…');
      $('cartaoResumo').textContent=t('Stop financeiro: {stop}. Metas: {target2} e {target3}. Tabelas informativas de WIN e WDO, com todas as possibilidades até a primeira linha sem contrato. Uma única página.',{stop:money(m.stop),target2:money(m.target2),target3:money(m.target3)});
      $('cartaoDica').textContent=t('Fundo claro para impressão. O cartão reflete os limites e registros atuais, sem dados ocultos.');
      dialog.showModal();$('fecharCartao').focus();
      try{const canvas=draw(m),blob=await new Promise(r=>canvas.toBlob(r,'image/png'));if(run!==generation||!dialog.open)return;if(!blob)throw Error(t('PNG indisponível'));
        url=URL.createObjectURL(blob);$('cartaoImagem').src=url;$('cartaoImagem').alt=$('cartaoResumo').textContent;$('cartaoImagem').hidden=false;
        $('baixarCartao').href=url;$('baixarCartao').download=(I.locale==='pt-BR'?'gerenciamento-de-risco-':I.locale==='es'?'gestion-de-riesgo-es-':'risk-management-en-')+new Date().toISOString().slice(0,10)+'.png';$('baixarCartao').hidden=false;$('cartaoCarregando').hidden=true;
      }catch(e){$('cartaoCarregando').textContent=t('Não foi possível gerar o cartão. Feche esta janela e tente novamente.');}
    });
  }
  window.CartaoGerenciamento={ligar};
})();
