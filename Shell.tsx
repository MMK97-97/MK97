import { Home, LayoutGrid, Plus, FolderOpen, Palette, Video, Send, MoreHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { useStudioStore, type Route } from '../store/useStudioStore';
const items = [
  ['home','Home',Home],['templates','Templates',LayoutGrid],['editor','Create',Plus],
  ['video','Video',Video],['projects','Projects',FolderOpen],['brand','Brand Kit',Palette],['publish','Export',Send],
] as const;
export function Shell({children}:{children:React.ReactNode}){
  const route=useStudioStore(s=>s.route), setRoute=useStudioStore(s=>s.setRoute);
  const message=useStudioStore(s=>s.message), clearMessage=useStudioStore(s=>s.clearMessage);
  const [more,setMore]=useState(false);
  const navigate=(r:Route)=>{setMore(false);setRoute(r);document.querySelector('.main')?.scrollTo(0,0);};
  return <div className="appShell">
    <aside className="sidebar"><img className="brandLogo" src="assets/mk97-logo.png" alt="MK97 logo"/><div className="brandText"><b>MK97</b><small>CREATIVE STUDIO</small></div>
      <nav aria-label="Studio navigation">{items.map(([r,label,Icon])=><button key={r} className={route===r?'active':''} onClick={()=>navigate(r)} aria-current={route===r?'page':undefined}><Icon size={19}/><span>{label}</span></button>)}</nav>
      <div className="sideFoot"><span>CREATE • EDIT • EXPORT</span><small>Cricket creator studio</small></div>
    </aside>
    <main className="main"><header className="topbar"><div><strong>MK97 Studio</strong><small>Cricket creative workspace</small></div><div className="topPill">Your work stays on this device</div></header>{children}</main>
    <nav className="mobileNav" aria-label="Mobile navigation">
      {items.slice(0,4).map(([r,label,Icon])=><button key={r} className={route===r?'active':''} onClick={()=>navigate(r)} aria-label={label} aria-current={route===r?'page':undefined}><Icon size={20}/><span>{label}</span></button>)}
      <button className={more||['projects','brand','publish'].includes(route)?'active':''} onClick={()=>setMore(v=>!v)} aria-label="More pages" aria-expanded={more}><MoreHorizontal size={20}/><span>More</span></button>
    </nav>
    {more&&<div className="moreMenu" role="menu"><button className="closeMore" onClick={()=>setMore(false)} aria-label="Close menu"><X size={18}/></button>{items.slice(4).map(([r,label,Icon])=><button role="menuitem" key={r} onClick={()=>navigate(r)}><Icon size={20}/>{label}</button>)}</div>}
    {message&&<div className="toast" role="status">{message}<button aria-label="Dismiss notice" onClick={clearMessage}><X size={16}/></button></div>}
  </div>;
}
