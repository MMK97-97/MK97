import { useStudioStore } from '../store/useStudioStore';
import { FolderOpen, Trash2, ArrowUpRight } from 'lucide-react';
export function Projects(){
  const projects=useStudioStore(s=>s.projects),open=useStudioStore(s=>s.openProject),remove=useStudioStore(s=>s.deleteProject);
  return <div className="page"><div className="sectionHead"><div><span>YOUR WORK</span><h1>Projects</h1><p>Posters saved on this device. Export a copy before clearing browser data.</p></div></div>
    {!projects.length?<div className="emptyState"><FolderOpen/><b>No saved projects yet</b><span>Open a template, edit it, then tap Save.</span></div>:
      <div className="projectGrid">{projects.map(project=><article className="projectCard" key={project.id}>
        <div className="projectThumb" style={{background:'#101e2b'}}><strong>{project.layers.find(l=>l.id==='title')?.text||project.title}</strong></div>
        <b>{project.title}</b><span>{new Date(project.updated).toLocaleString()}</span>
        <div className="projectActions"><button onClick={()=>open(project.id)}><ArrowUpRight size={16}/> Open</button>
        <button onClick={()=>{if(window.confirm('Delete this saved project?'))remove(project.id)}} aria-label={'Delete '+project.title}><Trash2 size={16}/></button></div>
      </article>)}</div>}
  </div>;
}
