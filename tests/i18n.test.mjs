import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {catalogs,validate,render} from '../scripts/build-site.mjs';
import {archive,inventory} from '../scripts/arquivar-versao.mjs';
import I from '../public/assets/i18n.js';
import M from '../public/assets/gerenciamento-modelo.js';

test('Catálogos possuem as mesmas chaves e parâmetros, sem traduções vazias',()=>validate());
test('Ausência de tradução ou parâmetro impede a geração',()=>{
 const key='Etapa {step} de 2',original=catalogs.en[key];try{delete catalogs.en[key];assert.throws(validate,/Chaves/);catalogs.en[key]='Step';assert.throws(validate,/Parâmetros/);}finally{catalogs.en[key]=original;}
});
test('Valores seguem BRL e plural de cada idioma sem mudar os dados',()=>{
 const state={finance:{income:8000,bills:5000,capital:0,cdi:0,tax:15,allocation:3000,withdrawal:0,reserve:'full',extras:[]},stop:350,results:[-100.25,150.5]};const before=M.calculate(state);
 for(const lang of ['pt-BR','en','es']){I.setLocale(lang);assert.deepEqual(M.calculate(state),before);assert.match(I.money(123456),lang==='pt-BR'?/R\$/ : /BRL/);assert.notEqual(I.days(1),I.days(2));assert.equal(I.number(35.5),lang==='en'?'35.5':'35,5');assert.equal(I.t('Etapa {step} de 2',{step:2}).includes('{'),false);assert.ok(I.t('status.'+before.status,before.messageParams).length>20);}I.setLocale('pt-BR');
});
test('HTML gerado escapa traduções e preserva IDs e valores internos',()=>{
 const key='Suas obrigações',value=catalogs.en[key];try{catalogs.en[key]='<img onerror="bad()">';const output=render('<h2 id="x">Suas obrigações</h2><option value="aluguel">Aluguel</option>','en');assert.ok(!output.includes('<img'));assert.ok(output.includes('id="x"'));assert.ok(output.includes('value="aluguel"'));assert.match(output,/Rental income/);}finally{catalogs.en[key]=value;}
});
test('Páginas estáticas possuem idioma, canonical e alternates recíprocos',()=>{
 for(const lang of ['pt-BR','en','es'])for(const page of ['index','gerenciamento']){const html=fs.readFileSync(path.join('public',lang==='pt-BR'?'':lang,page+'.html'),'utf8');assert.ok(html.includes('lang="'+lang+'"'));assert.equal((html.match(/rel="canonical"/g)||[]).length,1);for(const l of ['pt-BR','en','es','x-default'])assert.ok(html.includes('hreflang="'+l+'"'));assert.ok(html.includes('data-locale="en"'));assert.ok(!html.includes('src="assets/')||lang==='pt-BR');if(lang!=='pt-BR')assert.ok(html.includes('og-cover-'+lang+'.png'));}
});
test('Rotas de idioma funcionam sem JavaScript e sem duplicar cálculo/cotação',()=>{
 for(const lang of ['en','es']){const html=fs.readFileSync('public/'+lang+'/index.html','utf8');assert.ok(html.includes('href=".././"'));assert.ok(html.includes('href="../en/"'));assert.ok(html.includes('href="../es/"'));assert.ok(!fs.existsSync('public/'+lang+'/cotacao.json'));}
});
test('Snapshot sequencial inclui ocultos e mantém cópias anteriores intactas',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'pqs-snapshot-test-'));fs.mkdirSync(path.join(root,'public/assets'),{recursive:true});fs.writeFileSync(path.join(root,'public/.nojekyll'),'');fs.writeFileSync(path.join(root,'public/assets/file.txt'),'anterior');const one=archive(root);assert.equal(one.snapshot,'PQS#17');assert.deepEqual(inventory(path.join(root,'public')),inventory(one.path));fs.writeFileSync(path.join(root,'public/assets/file.txt'),'nova');const two=archive(root);assert.equal(two.snapshot,'PQS#18');assert.equal(fs.readFileSync(path.join(one.path,'assets/file.txt'),'utf8'),'anterior');assert.equal(fs.readFileSync(path.join(two.path,'assets/file.txt'),'utf8'),'nova');
 // Artefatos temporários pequenos ficam disponíveis para auditoria; não apagar recursivamente.
});
