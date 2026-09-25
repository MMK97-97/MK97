import './styles.css';
import { Shell } from './components/Shell';
import { Home } from './components/Home';
import { Templates } from './components/Templates';
import { PosterEditor } from './components/PosterEditor';
import { VideoEditor } from './components/VideoEditor';
import { BrandKit } from './components/BrandKit';
import { Projects } from './components/Projects';
import { PublishPanel } from './components/PublishPanel';
import { useStudioStore } from './store/useStudioStore';
export default function App(){
  const route=useStudioStore(s=>s.route);
  const C={home:Home,templates:Templates,editor:PosterEditor,video:VideoEditor,brand:BrandKit,projects:Projects,publish:PublishPanel}[route];
  return <Shell><C/></Shell>;
}
