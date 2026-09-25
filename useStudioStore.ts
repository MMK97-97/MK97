import { create } from 'zustand';
import type { Layer, TemplatePreset } from '../types';
import { templates } from '../data/templates';

export type Route = 'home'|'templates'|'editor'|'video'|'brand'|'projects'|'publish';
export type Project = { id:string; title:string; templateId:string; layers:Layer[]; updated:string };
const PROJECTS_KEY = 'mk97-projects-v2', DRAFT_KEY = 'mk97-draft-v2';
const clone = (layers:Layer[]) => layers.map(layer => ({...layer}));
function read<T>(key:string, fallback:T):T {
  try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch { return fallback; }
}
const initial = read<{templateId:string;layers:Layer[]} | null>(DRAFT_KEY, null);
const firstTemplate = templates.find(t=>t.id===initial?.templateId) || templates[0];
const initialLayers = Array.isArray(initial?.layers) ? initial.layers : clone(firstTemplate.layers);

type StudioState = {
  route:Route; template:TemplatePreset; layers:Layer[]; selectedLayerId:string|null;
  projects:Project[]; past:Layer[][]; future:Layer[][]; message:string;
  setRoute:(r:Route)=>void; loadTemplate:(t:TemplatePreset)=>void; openProject:(id:string)=>void;
  deleteProject:(id:string)=>void; selectLayer:(id:string|null)=>void;
  checkpoint:()=>void; updateLayer:(id:string,p:Partial<Layer>,record?:boolean)=>void;
  addText:()=>void; addImage:(src:string)=>void; removeLayer:(id:string)=>void;
  duplicateLayer:(id:string)=>void; undo:()=>void; redo:()=>void; saveProject:()=>void;
  clearMessage:()=>void;
};

export const useStudioStore=create<StudioState>((set,get)=>({
  route:'home',template:firstTemplate,layers:initialLayers,selectedLayerId:null,
  projects:read<Project[]>(PROJECTS_KEY,[]),past:[],future:[],message:'',
  setRoute:route=>set({route}),
  loadTemplate:template=>set({template,layers:clone(template.layers),selectedLayerId:null,route:'editor',past:[],future:[]}),
  openProject:id=>{const project=get().projects.find(p=>p.id===id);if(!project)return;
    set({template:templates.find(t=>t.id===project.templateId)||templates[0],layers:clone(project.layers),selectedLayerId:null,route:'editor',past:[],future:[],message:'Project opened'});
  },
  deleteProject:id=>{const projects=get().projects.filter(p=>p.id!==id);try{localStorage.setItem(PROJECTS_KEY,JSON.stringify(projects));set({projects,message:'Project deleted'});}catch{set({message:'Could not update device storage'});}},
  selectLayer:selectedLayerId=>set({selectedLayerId}),
  checkpoint:()=>set(s=>({past:[...s.past.slice(-49),clone(s.layers)],future:[]})),
  updateLayer:(id,p,record=true)=>{if(record)get().checkpoint();set(s=>({layers:s.layers.map(l=>l.id===id?{...l,...p}:l)}));},
  addText:()=>{get().checkpoint();const id=crypto.randomUUID();set(s=>({layers:[...s.layers,{id,type:'text',name:'New text',text:'YOUR TEXT',x:120,y:700,fontSize:78,fontWeight:800,color:'#ffffff'}],selectedLayerId:id}));},
  addImage:src=>{get().checkpoint();const id=crypto.randomUUID();set(s=>({layers:[...s.layers,{id,type:'image',name:'Uploaded image',src,x:150,y:420,width:600,opacity:1}],selectedLayerId:id}));},
  removeLayer:id=>{get().checkpoint();set(s=>({layers:s.layers.filter(l=>l.id!==id),selectedLayerId:null}));},
  duplicateLayer:id=>{const layer=get().layers.find(l=>l.id===id);if(!layer)return;get().checkpoint();const copy={...layer,id:crypto.randomUUID(),name:layer.name+' copy',locked:false,x:(layer.x||0)+30,y:(layer.y||0)+30};set(s=>({layers:[...s.layers,copy],selectedLayerId:copy.id}));},
  undo:()=>set(s=>s.past.length?{layers:clone(s.past[s.past.length-1]),past:s.past.slice(0,-1),future:[clone(s.layers),...s.future].slice(0,50),selectedLayerId:null}:{}),
  redo:()=>set(s=>s.future.length?{layers:clone(s.future[0]),past:[...s.past,clone(s.layers)].slice(-50),future:s.future.slice(1),selectedLayerId:null}:{}),
  saveProject:()=>{const s=get();const project:Project={id:crypto.randomUUID(),title:s.layers.find(l=>l.id==='title')?.text||s.template.title,templateId:s.template.id,layers:clone(s.layers),updated:new Date().toISOString()};
    const projects=[project,...s.projects].slice(0,30);
    try{localStorage.setItem(PROJECTS_KEY,JSON.stringify(projects));set({projects,message:'Project saved on this device'});}catch{set({message:'Device storage is full. Export the design and remove older projects.'});}
  },
  clearMessage:()=>set({message:''}),
}));

let draftTimer:ReturnType<typeof setTimeout>;
useStudioStore.subscribe((state,previous)=>{
  if(state.layers===previous.layers && state.template===previous.template)return;
  clearTimeout(draftTimer);
  draftTimer=setTimeout(()=>{
    try{localStorage.setItem(DRAFT_KEY,JSON.stringify({templateId:state.template.id,layers:state.layers}));}
    catch{useStudioStore.setState({message:'Draft could not be saved. Device storage is full.'});}
  },500);
});
