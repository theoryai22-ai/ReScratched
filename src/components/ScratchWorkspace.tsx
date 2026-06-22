import React, { useState } from 'react';
import { Folder, Book, Code, Palette, Volume2 } from 'lucide-react';
import BlocklyEditor from './BlocklyEditor';
import Stage from './Stage';
import SpriteManager from './SpriteManager';
import CostumeEditor from './CostumeEditor';

export default function ScratchWorkspace() {
  const [activeTab, setActiveTab] = useState<'code' | 'costumes' | 'sounds'>('code');
  const [loadCount, setLoadCount] = useState(0);

  const handleSave = () => {
    import('../store').then((module) => {
      // Need to stringify projectState. But there's sayTimeoutId and askResolve which aren't fully serializable to json.
      // We will clone the projectState and remove non-serializable properties.
      const state = module.projectState;
      const serializableState = {
        ...state,
        targets: state.targets.map(t => {
          const newT = { ...t };
          delete (newT as any).sayTimeoutId;
          delete (newT as any).askResolve;
          return newT;
        }),
      };
      const json = JSON.stringify(serializableState);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'project.rsc';
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const handleLoad = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.rsc';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            import('../store').then((module) => {
              // Add back the removed fields
              data.targets.forEach((t: any) => {
                t.sayTimeoutId = null;
                t.askResolve = null;
              });
              module.updateProjectState(data);
              setLoadCount(c => c + 1);
            });
          } catch (err) {
            console.error('Failed to load project', err);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#E5F0FF] overflow-hidden font-sans">
      {/* Top Navbar */}
      <div className="h-12 bg-blue-500 flex items-center px-4 gap-6 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
          <div className="w-8 h-8 bg-orange-400 rounded-sm flex items-center justify-center rotate-3 mr-1 shadow-sm">
            <span className="text-white text-lg -rotate-3 leading-none">R</span>
          </div>
          ReScratched
        </div>
        
        <div className="flex items-center gap-1 text-sm font-semibold text-white/90">
          <button onClick={handleLoad} className="px-3 py-1.5 hover:bg-black/10 rounded flex items-center gap-1.5 transition-colors">
            <Folder size={16} />
            <span>Load Project</span>
          </button>
          <button onClick={handleSave} className="px-3 py-1.5 hover:bg-black/10 rounded flex items-center gap-1.5 transition-colors">
            <Book size={16} />
            <span>Save Project</span>
          </button>
        </div>

        <div className="mx-4 flex-1">
          <input 
            type="text" 
            defaultValue="Untitled Project" 
            className="bg-black/10 hover:bg-black/20 focus:bg-white focus:text-black text-white px-3 py-1.5 rounded-full w-64 border-2 border-transparent focus:border-blue-300 outline-none font-semibold transition-all"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex p-2 gap-2 min-h-0">
        
        {/* Left/Middle Column: Workspace Tabs & Editor */}
        <div className="flex-grow flex flex-col min-w-0 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          {/* Tabs */}
          <div className="flex h-10 bg-gray-50/50 border-b border-gray-200 shrink-0">
            <button 
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-6 font-semibold text-sm border-r border-gray-200 transition-colors ${activeTab === 'code' ? 'bg-white text-blue-500 shadow-sm border-t-2 border-t-blue-500' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
            >
              <Code size={18} />
              Code
            </button>
            <button 
              onClick={() => setActiveTab('costumes')}
              className={`flex items-center gap-2 px-6 font-semibold text-sm border-r border-gray-200 transition-colors ${activeTab === 'costumes' ? 'bg-white text-blue-500 shadow-sm border-t-2 border-t-blue-500' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
            >
              <Palette size={18} />
              Costumes
            </button>
            <button 
              onClick={() => setActiveTab('sounds')}
              className={`flex items-center gap-2 px-6 font-semibold text-sm border-r border-gray-200 transition-colors ${activeTab === 'sounds' ? 'bg-white text-blue-500 shadow-sm border-t-2 border-t-blue-500' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
            >
              <Volume2 size={18} />
              Sounds
            </button>
          </div>
          
          {/* Editor Area */}
          <div className="flex-grow relative bg-white">
            <div className={activeTab === 'code' ? 'w-full h-full' : 'hidden'}>
              <BlocklyEditor key={`blockly-${loadCount}`} />
            </div>
            {activeTab === 'costumes' && (
              <CostumeEditor key={`costume-${loadCount}`} />
            )}
            {activeTab === 'sounds' && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium">
                Sound Editor (Coming Soon)
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Stage & Sprites */}
        <div className="w-[480px] shrink-0 flex flex-col gap-2 min-h-0">
          <Stage key={`stage-${loadCount}`} />
          <SpriteManager key={`sprites-${loadCount}`} />
        </div>

      </div>
    </div>
  );
}
