import { useRef, useState } from 'react';
import { Download, Copy, Trash2, Plus, Layers, Type, Image as ImageIcon, Eye, EyeOff, Lock, Unlock, Save, Undo2, Redo2, X } from 'lucide-react';
import { useStudioStore } from '../store/useStudioStore';
import type { Layer } from '../types';
import { exportNode } from '../services/export';

const backdrop = (l:Layer) => l.id==='bg'||l.id==='texture'||l.id.startsWith('overlay');
function position(l:Layer):React.CSSProperties {
  if(backdrop(l))return {inset:0};
  if(l.position?.startsWith('top-'))return {top:'4%',left:l.position==='top-left'?'4%':l.position==='top-center'?'50%':undefined,right:l.position==='top-right'?'4%':undefined,transform:l.position==='top-center'?'translateX(-50%)':undefined};
  return {left:((l.x||0)/1080*100)+'%',top:((l.y||0)/1350*100)+'%'};
}
export function PosterCanvas({layers,stageRef,selectedId,onDown}:{layers:Layer[];stageRef?:React.RefObject<HTMLDivElement|null>;selectedId?:string|null;onDown?:(e:React.PointerEvent,l:Layer)=>void}){
  return <div className="posterStage" ref={stageRef} onPointerDown={e=>{if(e.target===e.currentTarget)useStudioStore.getState().selectLayer(null)}}>
    {layers.filter(l=>!l.hidden).map(l=>l.type==='text'?
      <div key={l.id} onPointerDown={e=>onDown?.(e,l)} className={'layerNode textLayer '+(selectedId===l.id?'selected':'')}
        style={{...position(l),fontSize:((l.fontSize||48)/1080*100)+'cqw',fontWeight:l.fontWeight,color:l.color,opacity:l.opacity??1,textAlign:l.align,letterSpacing:l.letterSpacing,lineHeight:l.lineHeight||1.05,whiteSpace:'pre-wrap'}}>{l.text}</div>:
      <img key={l.id} onPointerDown={e=>onDown?.(e,l)} className={'layerNode imageLayer '+(selectedId===l.id?'selected':'')}
        src={l.src} alt={l.name} draggable={false} style={{...position(l),width:backdrop(l)?'100%':((l.width||180)/1080*100)+'%',height:backdrop(l)?'100%':'auto',objectFit:backdrop(l)?'cover':'contain',opacity:l.opacity??1,mixBlendMode:l.blend as React.CSSProperties['mixBlendMode']}}/>
    )}
  </div>;
}
export async function readImage(file:File):Promise<string>{
  if(!file.type.startsWith('image/'))throw new Error('Choose an image file');
  if(file.size>20*1024*1024)throw new Error('Choose an image under 20 MB');
  const url=URL.createObjectURL(file);
  try{
    const img=new Image();
    img.src=url;
    await img.decode();
    const scale=Math.min(1,1600/Math.max(img.width,img.height));
    const canvas=document.createElement('canvas');
    canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);
    canvas.getContext('2d')!.drawImage(img,0,0,canvas.width,canvas.height);
    return canvas.toDataURL('image/jpeg',.8);
  }finally{URL.revokeObjectURL(url);}
}
export function PosterEditor(){
  const stage=useRef<HTMLDivElement>(null), file=useRef<HTMLInputElement>(null);
  const {layers,selectedLayerId,selectLayer,checkpoint,updateLayer,addText,addImage,removeLayer,duplicateLayer,saveProject,undo,redo,past,future}=useStudioStore();
  const selected=layers.find(l=>l.id===selectedLayerId), [drag,setDrag]=useState<{id:string;x:number;y:number;ox:number;oy:number}|null>(null);
  const [inspectorOpen,setInspectorOpen]=useState(false),[busy,setBusy]=useState(false);
  const onDown=(e:React.PointerEvent,l:Layer)=>{
    e.stopPropagation();selectLayer(l.id);setInspectorOpen(true);
    if(l.locked||backdrop(l))return;
    checkpoint(); e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({id:l.id,x:e.clientX,y:e.clientY,ox:l.x||0,oy:l.y||0});
  };
  const onMove=(e:React.PointerEvent)=>{
    if(!drag||!stage.current)return;
    const r=stage.current.getBoundingClientRect();
    updateLayer(drag.id,{x:Math.max(0,Math.min(1030,drag.ox+(e.clientX-drag.x)*1080/r.width)),y:Math.max(0,Math.min(1300,drag.oy+(e.clientY-drag.y)*1350/r.height))},false);
  };
  const download=async(format:'png'|'jpg')=>{
    if(!stage.current)return;setBusy(true);
    try{await exportNode(stage.current,format,'mk97-poster');}
    catch{useStudioStore.setState({message:'Export failed. Try a smaller uploaded image.'});}
    finally{setBusy(false);}
  };
  return <div className="editorPage" onPointerMove={onMove} onPointerUp={()=>setDrag(null)} onPointerCancel={()=>setDrag(null)}>
    <div className="editorTop"><div><b>Poster Studio</b><small>Portrait • 1080 × 1350</small></div><div className="editorTopActions">
      <button onClick={undo} disabled={!past.length} aria-label="Undo"><Undo2 size={17}/></button>
      <button onClick={redo} disabled={!future.length} aria-label="Redo"><Redo2 size={17}/></button>
      <button onClick={saveProject}><Save size={17}/><span>Save</span></button>
      <button onClick={()=>download('jpg')} disabled={busy}><Download size={17}/><span>JPG</span></button>
      <button className="primary" onClick={()=>download('png')} disabled={busy}><Download size={17}/><span>PNG</span></button>
    </div></div>
    <div className="editorGrid">
      <aside className="toolRail" aria-label="Editing tools">
        <button onClick={()=>{addText();setInspectorOpen(true)}}><Type/><span>Text</span></button>
        <button onClick={()=>file.current?.click()}><ImageIcon/><span>Photo</span></button>
        <button onClick={()=>setInspectorOpen(v=>!v)}><Layers/><span>Layers</span></button>
        <button onClick={()=>{addText();setInspectorOpen(true)}}><Plus/><span>Add</span></button>
      </aside>
      <section className="canvasArea"><PosterCanvas layers={layers} stageRef={stage} selectedId={selectedLayerId} onDown={onDown}/></section>
      <aside className={'inspector '+(inspectorOpen?'open':'')} aria-label="Layer properties">
        <div className="panelTitle"><b>Layers & properties</b><button className="closeInspector" onClick={()=>setInspectorOpen(false)} aria-label="Close properties"><X size={20}/></button></div>
        {selected?<><div className="field"><label htmlFor="layer-name">Name</label><input id="layer-name" value={selected.name} onChange={e=>updateLayer(selected.id,{name:e.target.value})}/></div>
          {selected.type==='text'&&<><div className="field"><label htmlFor="layer-text">Text</label><textarea id="layer-text" value={selected.text||''} onChange={e=>updateLayer(selected.id,{text:e.target.value})}/></div>
            <div className="twoCols"><div className="field"><label htmlFor="layer-size">Size</label><input id="layer-size" type="number" min="12" max="350" value={selected.fontSize||48} onChange={e=>updateLayer(selected.id,{fontSize:Math.max(12,+e.target.value)})}/></div>
              <div className="field"><label htmlFor="layer-color">Color</label><input id="layer-color" type="color" value={selected.color||'#ffffff'} onChange={e=>updateLayer(selected.id,{color:e.target.value})}/></div></div></>}
          {!backdrop(selected)&&<div className="twoCols"><div className="field"><label htmlFor="layer-x">X</label><input id="layer-x" type="number" value={Math.round(selected.x||0)} onChange={e=>updateLayer(selected.id,{position:undefined,x:+e.target.value})}/></div><div className="field"><label htmlFor="layer-y">Y</label><input id="layer-y" type="number" value={Math.round(selected.y||0)} onChange={e=>updateLayer(selected.id,{position:undefined,y:+e.target.value})}/></div></div>}
          {selected.type==='image'&&!backdrop(selected)&&<div className="field"><label htmlFor="layer-width">Width</label><input id="layer-width" type="range" min="60" max="1080" value={selected.width||180} onChange={e=>updateLayer(selected.id,{width:+e.target.value})}/></div>}
          <div className="field"><label htmlFor="layer-opacity">Opacity</label><input id="layer-opacity" type="range" min="0" max="1" step=".05" value={selected.opacity??1} onChange={e=>updateLayer(selected.id,{opacity:+e.target.value})}/></div>
          <div className="inspectorActions"><button aria-label={selected.hidden?'Show layer':'Hide layer'} onClick={()=>updateLayer(selected.id,{hidden:!selected.hidden})}>{selected.hidden?<Eye/>:<EyeOff/>}</button>
            <button aria-label={selected.locked?'Unlock layer':'Lock layer'} onClick={()=>updateLayer(selected.id,{locked:!selected.locked})}>{selected.locked?<Unlock/>:<Lock/>}</button>
            <button aria-label="Duplicate layer" onClick={()=>duplicateLayer(selected.id)}><Copy/></button>
            <button className="danger" aria-label="Delete layer" onClick={()=>removeLayer(selected.id)}><Trash2/></button></div>
        </>:<div className="emptyPanel">Tap a layer to edit it.</div>}
        <div className="layerList">{[...layers].reverse().map(l=><button key={l.id} className={selectedLayerId===l.id?'active':''} onClick={()=>selectLayer(l.id)}><span>{l.type==='text'?'T':'▣'}</span><b>{l.name}</b>{l.locked?<Lock size={13}/>:null}</button>)}</div>
      </aside>
    </div>
    <input ref={file} type="file" accept="image/*" hidden onChange={async e=>{const f=e.target.files?.[0];if(!f)return;try{addImage(await readImage(f));setInspectorOpen(true);}catch(err){useStudioStore.setState({message:err instanceof Error?err.message:'Image could not be imported'});}e.target.value='';}}/>
  </div>;
}
