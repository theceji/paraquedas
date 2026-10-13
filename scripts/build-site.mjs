import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
export const locales=['pt-BR','en','es'];
export const catalogs=Object.fromEntries(locales.map(l=>[l,JSON.parse(fs.readFileSync(path.join(root,'src/locales',l+'.json'),'utf8'))]));
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>');
export const id=key=>'m'+createHash('sha256').update(key).digest('hex').slice(0,12);
const placeholders=s=>[...s.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort().join(',');
export function validate(){
 const keys=Object.keys(catalogs['pt-BR']).sort();
 for(const lang of locales){const dict=catalogs[lang];if(JSON.stringify(Object.keys(dict).sort())!==JSON.stringify(keys))throw Error('Chaves divergentes: '+lang);for(const key of keys){if(typeof dict[key]!=='string'||!dict[key].trim())throw Error('Tradução vazia: '+key);if(placeholders(dict[key])!==placeholders(catalogs['pt-BR'][key]))throw Error('Parâmetros divergentes: '+lang+' '+key);}}
 if(new Set(keys.map(id)).size!==keys.length)throw Error('Colisão de identificadores');
}
export function render(html,lang){
 const dict=catalogs[lang],prefix=lang==='pt-BR'?'':'../';let textTag='';
 return html.replace(/<!--[^]*?-->|<[^>]*>|[^<]+/g,token=>{
  if(token.startsWith('<!--'))return token;
  if(token.startsWith('<')){
   const tag=token.match(/^<\/?([\w-]+)/)?.[1]?.toLowerCase();
   if(token.startsWith('</')){textTag='';return token;}
   textTag=tag;
   if(tag==='html')token=token.replace('lang="pt-BR"',`lang="${lang}"`);
   const attrs=[];
   token=token.replace(/\b(aria-label|alt|placeholder|content)="([^"]*)"/g,(whole,attr,value)=>{const key=decode(value);if(!(key in dict))return whole;attrs.push(`data-i18n-${attr}="${id(key)}"`);return `${attr}="${escape(dict[key])}"`;});
   if(attrs.length)token=token.replace(/\/?>(?=$)/,end=>' '+attrs.join(' ')+end);
   token=token.replace(/\b(src|href)="(assets\/[^"#]*|LICENSE)"/g,(_,a,v)=>`${a}="${prefix}${v}"`);
   token=token.replace(/href="(?:\.\/|en\/|es\/)"([^>]*data-locale="(pt-BR|en|es)")/g,(_,tail,target)=>'href="'+(lang==='pt-BR'?'':'../')+(target==='pt-BR'?'./':target+'/')+'"'+tail);
   // Relative navigation remains inside the selected language directory.
   return token;
  }
  const key=decode(token.trim());if(!(key in dict)){
   if(/[A-Za-zÀ-ÿ]/.test(key)&&!['Português','English','Español'].includes(key)&&!['script','style'].includes(textTag))throw Error('Texto sem catálogo: '+key);
   return token;
  }
  const value=token.replace(token.trim(),escape(dict[key]));
  return ['title','script','style'].includes(textTag)?value:`<!--i18n:${id(key)}-->${value}<!--/i18n-->`;
 });
}
export function build(){
 validate();const origin=(process.env.SITE_URL||'https://theceji.github.io/paraquedas/').replace(/\/?$/,'/');
 const ids=Object.fromEntries(Object.keys(catalogs['pt-BR']).map(k=>[id(k),k]));
 const data={catalogs,ids};fs.writeFileSync(path.join(root,'public/assets/locales.js'),'/* Gerado por scripts/build-site.mjs. */\n(function(r){const data='+JSON.stringify(data).replaceAll('<','\\u003c')+';if(typeof module==="object"&&module.exports)module.exports=data;else r.ParaquedasLocales=data;})(globalThis);\n');
 for(const lang of locales){const folder=lang==='pt-BR'?'':lang+'/';fs.mkdirSync(path.join(root,'public',folder),{recursive:true});
  for(const page of ['index','gerenciamento','paraquedas']){
   let html=render(fs.readFileSync(path.join(root,'src/pages',page+'.html'),'utf8'),lang);
   const route=page==='index'?'':page==='paraquedas'?'gerenciamento.html':page+'.html',url=origin+folder+route;
   html=html.replace(/<link rel="canonical"[^>]*>/g,'');
   const seo=`<link rel="canonical" href="${url}">\n`+locales.map(l=>`<link rel="alternate" hreflang="${l}" href="${origin+(l==='pt-BR'?'':l+'/')+route}">`).join('\n')+`\n<link rel="alternate" hreflang="x-default" href="${origin+route}">`;
   html=html.replace('</head>',seo+'\n</head>').replace(/(<meta property="og:url" content=")[^"]+/, '$1'+url).replace(/(<meta property="og:locale" content=")[^"]+/, '$1'+({'pt-BR':'pt_BR',en:'en_US',es:'es_ES'}[lang]));
   const social=origin+'assets/og-cover'+(lang==='pt-BR'?'':'-'+lang)+'.png';
   html=html.replace(/(<meta property="og:image" content=")[^"]+/, '$1'+social);
   fs.writeFileSync(path.join(root,'public',folder,page+'.html'),html);
  }
 }
 const urls=locales.flatMap(l=>['','gerenciamento.html'].map(p=>origin+(l==='pt-BR'?'':l+'/')+p));
 fs.writeFileSync(path.join(root,'public/sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(u=>'<url><loc>'+escape(u)+'</loc></url>').join('')+'</urlset>\n');
 console.log('Build: 3 idiomas, 9 páginas, '+Object.keys(ids).length+' mensagens.');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))build();
