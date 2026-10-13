import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{valid}=require('../public/assets/cotacao.js');
const destination=new URL('../public/cotacao.json',import.meta.url);
export function fromYahoo(data,now=Date.now()){
  const m=data?.chart?.result?.[0]?.meta;
  const q={version:1,points:m?.regularMarketPrice,kind:'spot',symbol:m?.symbol,source:'Yahoo Finance',asOf:new Date((m?.regularMarketTime||0)*1000).toISOString()};
  if(!valid(q,now)||m?.instrumentType!=='INDEX')throw Error('Resposta Yahoo inválida');return q;
}
export function fromBrapi(data,now=Date.now()){
  const today=new Date(now).toISOString().slice(0,10);
  const rows=(Array.isArray(data?.contracts)?data.contracts:[]).filter(c=>c.underlyingAsset==='WIN'&&c.quotationType==='price'&&c.contractMultiplier===.2&&c.expirationDate>=today&&c.settlement>0).sort((a,b)=>a.expirationDate.localeCompare(b.expirationDate));
  for(const c of rows){const q={version:1,points:c.settlement,kind:'future',symbol:c.symbol,source:'brapi',asOf:new Date((c.date||0)*1000).toISOString()};if(valid(q,now))return q;}throw Error('Resposta brapi inválida');
}
async function request(url,headers={}){const r=await fetch(url,{headers:{'User-Agent':'Paraquedas-Educacional/1.0',...headers},signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('HTTP '+r.status);return r.json();}
export async function refresh({output=destination,fetchQuote=request,now=Date.now()}={}){
  let previous=null;try{previous=JSON.parse(await fs.readFile(output,'utf8'));}catch{}
  let candidate=null;
  const providers=[['Yahoo Finance','https://query1.finance.yahoo.com/v8/finance/chart/%5EBVSP?interval=1d&range=5d',fromYahoo,{}],['brapi','https://brapi.dev/api/v2/futures/term-structure?asset=WIN',fromBrapi,process.env.BRAPI_TOKEN?{Authorization:'Bearer '+process.env.BRAPI_TOKEN}:{}]];
  for(const [name,url,parse,headers] of providers){try{candidate=parse(await fetchQuote(url,headers),now);break;}catch{console.warn(name+': não foi possível obter uma referência válida.');}}
  if(!candidate){if(valid(previous,now)){console.warn('Mantida a última referência e sua data original.');return {updated:false,cached:true};}throw Error('Sem cotação válida. Campo manual permanece disponível.');}
  if(valid(previous,now)&&Date.parse(previous.asOf)>Date.parse(candidate.asOf)){console.log('Mantida referência anterior mais recente.');return {updated:false,cached:true};}
  if(previous&&candidate.points===previous.points&&candidate.asOf===previous.asOf&&candidate.symbol===previous.symbol){console.log('Referência sem alteração.');return {updated:false,cached:true};}
  candidate.fetchedAt=new Date(now).toISOString();await fs.writeFile(output,JSON.stringify(candidate,null,2)+'\n');
  console.log(candidate.source+' · '+candidate.symbol+' · '+candidate.points+' pts · '+candidate.asOf);return {updated:true,quote:candidate};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){refresh().catch(e=>{console.error(e.message);process.exitCode=1;});}
