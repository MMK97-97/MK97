import { useEffect, useRef, useState } from 'react';
import { Upload, Scissors, Gauge, Download, Play, Pause } from 'lucide-react';
import { useStudioStore } from '../store/useStudioStore';

function mimeType(){
  return ['video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm']
    .find(type=>MediaRecorder.isTypeSupported(type))||'';
}
export function VideoEditor(){
  const video=useRef<HTMLVideoElement>(null),url=useRef(''), file=useRef<HTMLInputElement>(null);
  const audioGraph=useRef<{context:AudioContext;source:MediaElementAudioSourceNode}|null>(null);
  const [name,setName]=useState(''),[duration,setDuration]=useState(0),[start,setStart]=useState(0),[end,setEnd]=useState(0);
  const [time,setTime]=useState(0),[speed,setSpeed]=useState(1),[busy,setBusy]=useState(false);
  useEffect(()=>()=>{if(url.current)URL.revokeObjectURL(url.current);audioGraph.current?.context.close()},[]);
  const load=(f:File)=>{
    if(!f.type.startsWith('video/')){useStudioStore.setState({message:'Choose a video file'});return;}
    if(url.current)URL.revokeObjectURL(url.current);
    url.current=URL.createObjectURL(f);setName(f.name);setDuration(0);setStart(0);setEnd(0);setTime(0);
    if(video.current){video.current.src=url.current;video.current.load();}
  };
  const seek=(seconds:number)=>{if(video.current)video.current.currentTime=seconds;setTime(seconds);};
  const split=()=>{if(time<=start||time>=end)return;setEnd(time);useStudioStore.setState({message:'Clip end set to playhead. Drag the trim handles to refine.'});};
  const exportClip=async()=>{
    const element=video.current;
    if(!element||!duration||busy)return;
    if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){useStudioStore.setState({message:'Video export is unsupported in this browser. Try Chrome or Edge.'});return;}
    const type=mimeType();if(!type){useStudioStore.setState({message:'This browser has no supported video encoder.'});return;}
    setBusy(true);let stream:MediaStream|null=null,raf=0;
    let destination:MediaStreamAudioDestinationNode|null=null;
    try{
      element.pause();element.playbackRate=1;await new Promise<void>((resolve,reject)=>{
        if(Math.abs(element.currentTime-start)<.05){resolve();return;}
        element.addEventListener('seeked',()=>resolve(),{once:true});element.addEventListener('error',()=>reject(new Error('Video seek failed')),{once:true});
        element.currentTime=start;
      });
      const canvas=document.createElement('canvas');
      const scale=Math.min(1,1080/Math.max(element.videoWidth,element.videoHeight));
      canvas.width=Math.max(2,Math.round(element.videoWidth*scale/2)*2);
      canvas.height=Math.max(2,Math.round(element.videoHeight*scale/2)*2);
      const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas is unavailable');
      const draw=()=>{ctx.drawImage(element,0,0,canvas.width,canvas.height);raf=requestAnimationFrame(draw)};draw();
      stream=canvas.captureStream(30);
      try{
        if(!audioGraph.current){const context=new AudioContext(),source=context.createMediaElementSource(element);source.connect(context.destination);audioGraph.current={context,source};}
        await audioGraph.current.context.resume();
        destination=audioGraph.current.context.createMediaStreamDestination();
        audioGraph.current.source.connect(destination);
        destination.stream.getAudioTracks().forEach(track=>stream!.addTrack(track));
      }catch{destination=null;}
      const recorder=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:6_000_000});
      const parts:BlobPart[]=[];
      const done=new Promise<Blob>((resolve,reject)=>{
        recorder.ondataavailable=e=>{if(e.data.size)parts.push(e.data)};
        recorder.onerror=()=>reject(new Error('Encoding failed'));
        recorder.onstop=()=>resolve(new Blob(parts,{type}));
      });
      recorder.start(250);
      await element.play();
      await new Promise<void>(resolve=>{
        const interval=setInterval(()=>{if(element.currentTime>=end-.04||element.ended||element.paused){clearInterval(interval);resolve()}},40);
      });
      recorder.stop();element.pause();
      const blob=await done;
      if(blob.size===0)throw new Error('Export produced no video');
      const downloadUrl=URL.createObjectURL(blob),link=document.createElement('a');
      link.href=downloadUrl;link.download='mk97-clip.'+(type.includes('mp4')?'mp4':'webm');link.click();
      setTimeout(()=>URL.revokeObjectURL(downloadUrl),60_000);
      useStudioStore.setState({message:'Video exported. Check your downloads.'});
    }catch(err){useStudioStore.setState({message:(err as Error).message||'Video export failed'});}
    finally{cancelAnimationFrame(raf);if(destination)audioGraph.current?.source.disconnect(destination);stream?.getTracks().forEach(t=>t.stop());setBusy(false);}
  };
  return <div className="page videoPage">
    <div className="sectionHead"><div><span>MOTION STUDIO</span><h1>Video Studio</h1><p>Import a clip, set in and out points, preview it, and export from your browser.</p></div>
      <button className="primary" onClick={exportClip} disabled={!duration||busy}><Download size={17}/>{busy?'Exporting…':'Export clip'}</button></div>
    <div className="videoWorkspace"><section>
      <div className="videoPreview">{name?<video ref={video} playsInline controls src={url.current} onLoadedMetadata={e=>{const d=e.currentTarget.duration;if(Number.isFinite(d)){setDuration(d);setEnd(d)}}} onTimeUpdate={e=>setTime(e.currentTarget.currentTime)} onEnded={()=>seek(start)}/>:<button className="videoEmpty" onClick={()=>file.current?.click()}><Upload/><b>Import a video</b><span>Tap to choose a clip from your device</span></button>}</div>
      <button className="uploadButton" onClick={()=>file.current?.click()}><Upload size={17}/> {name?'Replace video':'Import video'}</button>
      <input ref={file} type="file" accept="video/*" hidden onChange={e=>{const f=e.target.files?.[0];if(f)load(f);e.target.value='';}}/>
    </section><aside className="videoTools">
      <button disabled={!duration} onClick={()=>{if(video.current?.paused)video.current.play();else video.current?.pause()}}>{video.current?.paused?<Play/>:<Pause/>} Preview</button>
      <button disabled={!duration} onClick={split}><Scissors/> Set end at playhead</button>
      <button disabled={!duration} onClick={()=>{const next=speed===1?1.5:speed===1.5?2:.5;setSpeed(next);if(video.current)video.current.playbackRate=next}}><Gauge/> Preview {speed}×</button>
    </aside></div>
    {duration>0&&<div className="trimPanel"><h2>Trim clip</h2><p>{name} • {Math.round(end-start)} seconds selected</p>
      <label>In point <strong>{start.toFixed(1)}s</strong><input type="range" min="0" max={Math.max(0,end-.1)} step=".1" value={start} onChange={e=>{const v=+e.target.value;setStart(v);seek(v)}}/></label>
      <label>Out point <strong>{end.toFixed(1)}s</strong><input type="range" min={Math.min(duration,start+.1)} max={duration} step=".1" value={end} onChange={e=>{const v=+e.target.value;setEnd(v);seek(v)}}/></label>
      <label>Playhead <strong>{time.toFixed(1)}s</strong><input type="range" min={start} max={end} step=".1" value={Math.max(start,Math.min(end,time))} onChange={e=>seek(+e.target.value)}/></label>
      <small>Export uses your browser’s available MP4 or WebM encoder. Keep the tab open until it finishes.</small>
    </div>}
  </div>;
}
