import React, { useEffect, useState } from 'react';
import CatSprite from './CatSprite';
import { projectState, subscribeSpriteState, updateTarget, updateProjectState, getActiveTarget } from '../store';
import { Plus } from 'lucide-react';

export default function SpriteManager() {
  const [state, setState] = useState({ ...projectState });

  useEffect(() => {
    return subscribeSpriteState(() => {
      setState({ ...projectState });
    });
  }, []);

  const activeTarget = getActiveTarget();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, prop: keyof typeof activeTarget, isNum: boolean = true) => {
    let val: any = e.target.value;
    if (isNum) val = Number(val);
    if (isNum && isNaN(val)) return;
    updateTarget(activeTarget.id, { [prop]: val });
  };

  const handleAddSprite = () => {
    const id = `sprite${state.targets.length + 1}`;
    const newSprite = {
      id,
      name: `Sprite${state.targets.length}`,
      isStage: false,
      x: 0, y: 0, direction: 90, size: 100, show: true,
      sayText: '', think: false, sayTimeoutId: null,
      asking: false, askText: '', askResolve: null,
      costumes: [{ id: `costume1_${id}`, name: 'costume1', dataUrl: '' }],
      activeCostumeIndex: 0,
      workspaceXml: '<xml xmlns="https://developers.google.com/blockly/xml"></xml>',
    };
    const newTargets = [...state.targets, newSprite];
    updateProjectState({ targets: newTargets, activeTargetId: id });
  };

  const stage = state.targets.find(t => t.isStage);
  const sprites = state.targets.filter(t => !t.isStage);

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden flex-grow shadow-sm min-h-0">
      {/* Sprite Info Header */}
      {!activeTarget.isStage ? (
        <div className="p-3 border-b border-gray-200 grid grid-cols-6 gap-2 text-xs text-gray-600 font-medium">
          <div className="col-span-2">
            <span>Sprite</span>
            <input type="text" value={activeTarget.name} onChange={(e) => handleChange(e, 'name', false)} className="w-full mt-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-normal" />
          </div>
          <div>
            <span>X</span>
            <input type="text" value={activeTarget.x} onChange={(e) => handleChange(e, 'x')} className="w-full mt-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-normal text-center" />
          </div>
          <div>
            <span>Y</span>
            <input type="text" value={activeTarget.y} onChange={(e) => handleChange(e, 'y')} className="w-full mt-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-normal text-center" />
          </div>
          <div>
            <span>Show</span>
            <div className="flex items-center gap-1 mt-1">
              <button onClick={() => updateTarget(activeTarget.id, {show: true})} className={`flex-1 py-1 border rounded flex items-center justify-center transition-colors ${activeTarget.show ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 hover:bg-gray-50' }`}>
                <span className={`w-4 h-4 rounded-full block ${activeTarget.show ? 'bg-blue-500' : 'border-2 border-gray-400'}`}></span>
              </button>
              <button onClick={() => updateTarget(activeTarget.id, {show: false})} className={`flex-1 py-1 border rounded flex items-center justify-center transition-colors ${!activeTarget.show ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 hover:bg-gray-50' }`}>
                <span className={`w-4 h-4 rounded-full block ${!activeTarget.show ? 'bg-blue-500' : 'border-2 border-gray-400'}`}></span>
              </button>
            </div>
          </div>
          <div>
            <span>Size</span>
            <input type="text" value={activeTarget.size} onChange={(e) => handleChange(e, 'size')} className="w-full mt-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-normal text-center" />
          </div>
          <div>
            <span>Direction</span>
            <input type="text" value={activeTarget.direction} onChange={(e) => handleChange(e, 'direction')} className="w-full mt-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-normal text-center" />
          </div>
        </div>
      ) : (
        <div className="p-3 border-b border-gray-200 flex items-center gap-4 text-sm text-gray-600 font-medium">
          <div>Stage selected: no motion blocks available.</div>
        </div>
      )}

      {/* Sprites List */}
      <div className="flex-grow flex p-3 overflow-hidden bg-gray-50/30 gap-6">
        {/* Sprites Grid */}
        <div className="flex-1 flex flex-wrap gap-2 overflow-y-auto content-start">
          {sprites.map(sprite => (
            <div 
              key={sprite.id}
              onClick={() => updateProjectState({ activeTargetId: sprite.id })}
              className={`w-16 h-20 bg-white border-2 rounded-lg flex flex-col items-center p-1 relative shadow-sm cursor-pointer transition-colors ${state.activeTargetId === sprite.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
            >
              <div className="flex-grow flex items-center justify-center w-full mt-2">
                {sprite.costumes[sprite.activeCostumeIndex]?.dataUrl ? (
                  <img src={sprite.costumes[sprite.activeCostumeIndex].dataUrl} className="w-10 h-10 object-contain drop-shadow" />
                ) : (
                  <CatSprite width={40} height={40} />
                )}
              </div>
              <span className="text-[10px] font-semibold text-gray-700 truncate w-full text-center mt-1 pb-1">{sprite.name}</span>
            </div>
          ))}
          
          {/* Add Sprite Button */}
          <div 
            onClick={handleAddSprite}
            className="w-16 h-20 bg-white border border-gray-200 border-dashed rounded-lg flex flex-col items-center justify-center relative shadow-sm cursor-pointer hover:border-blue-400 hover:bg-white transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
              <Plus size={20} className="stroke-[3px]" />
            </div>
            <span className="text-[10px] text-gray-500 font-medium mt-2">Add</span>
          </div>
        </div>
        
        {/* Stage Backdrop Info */}
        {stage && (
          <div className="flex-shrink-0 w-16 ml-auto flex flex-col items-center">
            <div className="text-[10px] font-bold text-gray-400 mb-1 leading-none uppercase tracking-wide">Stage</div>
            <div 
              onClick={() => updateProjectState({ activeTargetId: stage.id })}
              className={`w-full aspect-[4/3] bg-white border-2 rounded flex items-center justify-center relative shadow-sm cursor-pointer transition-colors ${state.activeTargetId === stage.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
            >
              {stage.costumes[stage.activeCostumeIndex]?.dataUrl && (
                  <img src={stage.costumes[stage.activeCostumeIndex].dataUrl} className="w-full h-full object-cover" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
