import { useRef, useState } from 'react';
import { Download, Share2, Instagram, Facebook } from 'lucide-react';
import { useStudioStore } from '../store/useStudioStore';
import { PosterCanvas } from './PosterEditor';
import { exportNode, renderNode, shareFile } from '../services/export';
export function PublishPanel(){
  const stage=useRef<HTMLDivElement>(null),layers=useStudioStore(s=>s.layers);
  const [busy,setBusy]=useState(false);
  const run=async(action:'png'|'jpg'|'share')=>{
    if(!stage.current)return;setBusy(true);
    try{
      if(action==='share'){
        const data=await renderNode(stage.current);
        if(!await shareFile(data))useStudioStore.setState({message:'Device sharing is unavailable here. Download the PNG instead.'});
      }else await exportNode(stage.current,action);
    }catch(e){if((e as Error).name!=='AbortError')useStudioStore.setState({message:'Could not prepare the file. Try again with a smaller image.'});}
    finally{setBusy(false);}
  };
  return <div className="page"><div className="sectionHead"><div><span>EXPORT CENTER</span><h1>Ready to share</h1><p>Download your current poster or open your phone’s share sheet.</p></div></div>
    <div className="publishGrid"><section className="publishPreview"><PosterCanvas layers={layers}/></section>
      <section className="publishActions"><h2>Your poster</h2><p>1080 × 1350 pixels • Instagram portrait</p>
        <button className="social" disabled={busy} onClick={()=>run('png')}><Download/> Save PNG <span>High quality</span></button>
        <button className="social" disabled={busy} onClick={()=>run('jpg')}><Download/> Save JPG <span>Smaller file</span></button>
        <button className="social" disabled={busy} onClick={()=>run('share')}><Share2/> Share with device <span>Where available</span></button>
        <div className="securityNote"><Instagram size={20}/><Facebook size={20}/><div><b>Post to social apps</b><small>Save or share the file, then choose Instagram or Facebook from your device. Direct account publishing needs a secure backend.</small></div></div>
      </section></div>
  </div>;
}
