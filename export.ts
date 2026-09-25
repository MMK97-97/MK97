import { toJpeg, toPng } from 'html-to-image';
export async function renderNode(node:HTMLElement,format:'png'|'jpg'='png'){
  const selected=node.querySelectorAll<HTMLElement>('.selected');
  selected.forEach(element=>element.classList.remove('selected'));
  let dataUrl:string;
  try {
    const options={quality:.95,pixelRatio:1080/node.getBoundingClientRect().width,cacheBust:true};
    dataUrl = format==='jpg' ? await toJpeg(node,options) : await toPng(node,options);
  } finally { selected.forEach(element=>element.classList.add('selected')); }
  return dataUrl;
}
export async function exportNode(node:HTMLElement, format:'png'|'jpg'='png', name='mk97-design'){
  const dataUrl=await renderNode(node,format);
  const a=document.createElement('a'); a.href=dataUrl; a.download=`${name}.${format==='jpg'?'jpg':'png'}`; a.click(); return dataUrl;
}
export async function shareFile(dataUrl:string,name='mk97-design.png'){
  const res=await fetch(dataUrl); const blob=await res.blob(); const file=new File([blob],name,{type:blob.type});
  if(navigator.share && navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:'MK97 Creative Studio'}); return true;} return false;
}
