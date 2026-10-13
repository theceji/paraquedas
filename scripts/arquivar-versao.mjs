import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const project=fileURLToPath(new URL('../',import.meta.url));
export function inventory(root){
 const files={};
 function visit(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isSymbolicLink())throw Error('Snapshot não aceita link simbólico: '+file);if(entry.isDirectory())visit(file);else files[path.relative(root,file).split(path.sep).join('/')]=createHash('sha256').update(fs.readFileSync(file)).digest('hex');}}
 visit(root);return files;
}
export function archive(root=project){
 root=fs.realpathSync(root);const source=path.join(root,'public'),versions=path.join(root,'arquivo','versoes');
 if(!fs.existsSync(source))throw Error('public/ ausente');fs.mkdirSync(versions,{recursive:true});
 const resolved=fs.realpathSync(versions);if(!resolved.startsWith(root+path.sep))throw Error('Arquivo fora do projeto');
 const numbers=fs.readdirSync(versions,{withFileTypes:true}).filter(e=>e.isDirectory()&&/^PQS#\d+$/.test(e.name)).map(e=>Number(e.name.slice(4)));
 const name='PQS#'+Math.max(17,1+Math.max(0,...numbers)),target=path.join(versions,name);
 if(fs.existsSync(target))throw Error('Snapshot já existe');
 fs.mkdirSync(target); // Falha se outra execução já reservou este número.
 const before=inventory(source);fs.cpSync(source,target,{recursive:true,force:false,errorOnExist:true});
 const copied=inventory(target),after=inventory(source);
 if(JSON.stringify(before)!==JSON.stringify(copied)||JSON.stringify(before)!==JSON.stringify(after))throw Error('Integridade não confirmada; não iniciar a versão');
 fs.writeFileSync(path.join(versions,name+'.sha256.json'),JSON.stringify({snapshot:name,createdAt:new Date().toISOString(),files:copied},null,2)+'\n');
 return {snapshot:name,path:target,files:Object.keys(copied).length};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(archive(),null,2));
