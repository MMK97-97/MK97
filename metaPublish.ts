const API=import.meta.env.VITE_API_BASE||'';
export type PublishTarget='instagram'|'facebook';
export async function publishToMeta(target:PublishTarget,payload:{assetUrl:string;caption:string;mediaType:'IMAGE'|'REELS'}){
 const r=await fetch(`${API}/api/meta/publish`,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({target,...payload})});
 if(!r.ok) throw new Error((await r.json().catch(()=>({}))).message||'Publishing failed'); return r.json();
}
export async function getMetaConnections(){const r=await fetch(`${API}/api/meta/connections`,{credentials:'include'});if(!r.ok)return {instagram:false,facebook:false};return r.json();}
