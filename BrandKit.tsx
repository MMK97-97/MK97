import { useRef, useState } from 'react';
import { Upload, Save, Plus } from 'lucide-react';
import { readImage } from './PosterEditor';
import { useStudioStore } from '../store/useStudioStore';
const KEY='mk97-brand-v2';
const defaults={colors:['#F1C45F','#08111A','#0B1A27','#FFFFFF'],logo:''};
function load(){try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')};}catch{return defaults;}}
export function BrandKit(){
  const [brand,setBrand]=useState<{colors:string[];logo:string}>(load);
  const file=useRef<HTMLInputElement>(null),addImage=useStudioStore(s=>s.addImage),go=useStudioStore(s=>s.setRoute);
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(brand));useStudioStore.setState({message:'Brand kit saved on this device'});}catch{useStudioStore.setState({message:'Device storage is full. Try a smaller logo.'});}};
  return <div className="page"><div className="sectionHead"><div><span>YOUR BRAND</span><h1>Brand Kit</h1><p>Keep your logo and colors ready for your next cricket graphic.</p></div><button className="primary" onClick={save}><Save size={17}/> Save brand</button></div>
    <div className="brandGrid"><section className="brandPanel"><h3>Team logo</h3><div className="logoDrop"><img src={brand.logo||'assets/mk97-logo.png'} alt="Brand logo"/></div>
      <button onClick={()=>file.current?.click()}><Upload size={16}/> Upload logo</button>
      {brand.logo&&<button onClick={()=>{addImage(brand.logo);go('editor')}}><Plus size={16}/> Add to poster</button>}
      <input ref={file} type="file" accept="image/*" hidden onChange={async e=>{const f=e.target.files?.[0];if(f)try{const logo=await readImage(f);setBrand(b=>({...b,logo}));}catch(err){useStudioStore.setState({message:(err as Error).message});}e.target.value='';}}/>
    </section><section className="brandPanel"><h3>Brand colors</h3><div className="colorGrid">{brand.colors.map((color,i)=><label key={i}><input type="color" value={color} onChange={e=>setBrand(b=>({...b,colors:b.colors.map((x,j)=>j===i?e.target.value:x)}))}/><span style={{background:color}}/><b>{color}</b></label>)}</div><p>Tap a swatch to change its color.</p></section></div>
  </div>;
}
