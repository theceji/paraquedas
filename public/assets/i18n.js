/* Catálogos locais. Valores e cálculos nunca passam pela tradução. */
(function(root,factory){
  const data=typeof module==='object'&&module.exports?require('./locales.js'):root.ParaquedasLocales;
  const api=factory(data);if(typeof module==='object'&&module.exports)module.exports=api;else root.I18n=api;
})(globalThis,function(data){
  'use strict';
  const browser=typeof document!=='undefined',languages=['pt-BR','en','es'];
  let locale=browser?document.documentElement.lang:'pt-BR';
  const formats={'pt-BR':'pt-BR',en:'en-US',es:'es-ES'},bindings=new Map(),attributes=new Map();
  const base=browser?new URL('../',document.currentScript.src):null;
  const keysByText=new Map(Object.entries(data.catalogs[locale]||{}).map(([k,v])=>[v,k]));
  function t(key,params={}){const template=data.catalogs[locale]?.[key]??data.catalogs['pt-BR'][key]??key;return template.replace(/\{(\w+)\}/g,(_,name)=>Object.hasOwn(params,name)?String(params[name]):'{'+name+'}');}
  const number=(v,options={})=>new Intl.NumberFormat(formats[locale],{maximumFractionDigits:2,...options}).format(v);
  const money=c=>number(c/100,{style:'currency',currency:'BRL',currencyDisplay:locale==='pt-BR'?'symbol':'code'});
  const date=(v,time=false,zone='America/Sao_Paulo')=>new Intl.DateTimeFormat(formats[locale],{dateStyle:'short',...(time?{timeStyle:'short'}:{}),timeZone:zone}).format(new Date(v))+(time?' (UTC−03:00)':'');
  const plural=(key,count)=>t(key+'.'+new Intl.PluralRules(formats[locale]).select(count),{count:number(count)});
  const days=n=>plural('days',n);
  const months=()=>Array.from({length:12},(_,m)=>new Intl.DateTimeFormat(formats[locale],{month:'short',timeZone:'UTC'}).format(new Date(Date.UTC(2020,m,1))));
  function bind(scope=document){
    keysByText.clear();for(const [k,v]of Object.entries(data.catalogs[locale]))keysByText.set(v,k);
    // Explicit bindings: never observe arbitrary mutations or rebuild user inputs.
    const walker=document.createTreeWalker(scope,NodeFilter.SHOW_COMMENT|NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){
      const node=walker.currentNode;
      if(node.nodeType===8&&node.data.startsWith('i18n:')){const text=node.nextSibling,key=data.ids[node.data.slice(5)];if(text?.nodeType===3&&key)bindings.set(text,{key,prefix:text.data.match(/^\s*/)[0],suffix:text.data.match(/\s*$/)[0]});}
      else if(node.nodeType===3&&!bindings.has(node)&&!['SCRIPT','STYLE'].includes(node.parentElement?.tagName)){
        const raw=node.data.trim(),key=Object.hasOwn(data.catalogs['pt-BR'],raw)?raw:keysByText.get(raw);
        if(key)bindings.set(node,{key,prefix:node.data.match(/^\s*/)[0],suffix:node.data.match(/\s*$/)[0]});
      }
    }
    const elements=[...(scope.nodeType===1?[scope]:[]),...scope.querySelectorAll('*')];
    for(const element of elements){for(const attr of ['aria-label','alt','placeholder','content']){const id=element.getAttribute('data-i18n-'+attr);const value=element.getAttribute(attr);const key=id?data.ids[id]:Object.hasOwn(data.catalogs['pt-BR'],value)?value:keysByText.get(value);if(key){if(!attributes.has(element))attributes.set(element,new Map());attributes.get(element).set(attr,key);}}}
    apply();
  }
  function apply(){
    for(const [node,b]of bindings){if(!node.isConnected){bindings.delete(node);continue;}node.data=b.prefix+t(b.key)+b.suffix;}
    for(const [el,attrs]of attributes){if(!el.isConnected){attributes.delete(el);continue;}for(const [attr,key]of attrs)el.setAttribute(attr,t(key));}
    document.documentElement.lang=locale;
    document.querySelectorAll('a[href$="LICENSE"]').forEach(a=>a.href=new URL('LICENSE',base).href);
    document.querySelectorAll('[data-locale]').forEach(a=>{a.setAttribute('aria-current',a.dataset.locale===locale?'true':'false');a.href=pageURL(a.dataset.locale);});
  }
  function pageURL(lang){const name=location.pathname.split('/').pop()||'index.html';return new URL((lang==='pt-BR'?'':lang+'/')+(name==='index.html'?'':name)+location.search+location.hash,base).href;}
  function setLocale(next,{historyMode='push'}={}){
    if(!languages.includes(next))return;
    if(browser)bind();
    locale=next;
    if(!browser)return;
    const nextURL=pageURL(next);
    if(historyMode==='push'&&location.href!==nextURL)history.pushState(null,'',nextURL);
    try{localStorage.setItem('paraquedas-language',next);}catch{}
    apply();
    const canonical=document.querySelector('link[rel="canonical"]');
    if(canonical){const url=new URL(canonical.href),path=url.pathname.replace(/\/(en|es)\//,'/');const name=path.split('/').pop();const prefix=path.slice(0,path.length-name.length);url.pathname=prefix+(next==='pt-BR'?'':next+'/')+name;canonical.href=url.href;const og=document.querySelector('meta[property="og:url"]');if(og)og.content=url.href;}
    const social=document.querySelector('meta[property="og:image"]');if(social){const url=new URL(social.content);url.pathname=url.pathname.replace(/og-cover(?:-en|-es)?\.png$/, 'og-cover'+(next==='pt-BR'?'':'-'+next)+'.png');social.content=url.href;}
    const ogLocale=document.querySelector('meta[property="og:locale"]');if(ogLocale)ogLocale.content=({'pt-BR':'pt_BR',en:'en_US',es:'es_ES'})[next];
    document.dispatchEvent(new CustomEvent('languagechange',{detail:{locale}}));
  }
  function validation(input){
    if(typeof input.setCustomValidity!=='function')return;
    input.setCustomValidity('');const v=input.validity;
    const message=v.badInput?t('validation.number'):v.valueMissing?t('validation.required'):v.rangeUnderflow?t('validation.min',{value:number(Number(input.min))}):v.rangeOverflow?t('validation.max',{value:number(Number(input.max))}):v.stepMismatch?t('validation.step',{value:number(Number(input.step),{maximumFractionDigits:8})}):'';
    input.setCustomValidity(message);
  }
  if(browser){
    document.addEventListener('invalid',e=>validation(e.target),true);
    for(const event of ['input','change'])document.addEventListener(event,e=>{if(e.target.validity?.customError)e.target.setCustomValidity('');},true);
    document.addEventListener('languagechange',()=>document.querySelectorAll('input,select').forEach(el=>{if(el.validity.customError)validation(el);}));
    document.addEventListener('DOMContentLoaded',()=>{
      bind();
      document.querySelectorAll('[data-locale]').forEach(a=>a.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0)return;e.preventDefault();setLocale(a.dataset.locale);}));
      window.addEventListener('popstate',()=>{const relative=location.pathname.slice(base.pathname.length),lang=relative.split('/')[0];setLocale(languages.includes(lang)?lang:'pt-BR',{historyMode:'none'});});
    });
  }
  return {t,number,money,date,plural,days,months,bind,setLocale,assetURL:p=>new URL(p,base).href,get locale(){return locale;}};
});
