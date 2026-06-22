import React, { useEffect, useState, useRef } from 'react';
import { Octagon, Maximize2 } from 'lucide-react';
import * as Blockly from 'blockly';
import CatSprite from './CatSprite';
import { projectState, subscribeSpriteState, setRunning, isRunning, keysPressed, updateTarget, updateSprite, updateProjectState } from '../store';
import { executeBlockSeq } from '../interpreter';

const GreenFlagIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="120 50 220 250" {...props}>
    <path d="M162.625,205l5,-108c0,0 14.64715,-7 31,-7c7.45424,0 21.13681,3.34667 34.58731,9.7702c13.5124,6.45309 26.80903,15.98376 41.39535,16.23524c10.14985,0.17499 18.74115,1.1169 25.87039,-2.13566c13.16667,-6.00703 21.3464,-16.67741 25.14695,-4.86978c6.07447,18.87228 -1,93 -1,93c0,0 -20.28152,10.59003 -38.14381,11.71345c-6.28786,0.39546 -20.27684,0.79541 -32.88133,-4.65533c-16.8956,-7.30641 -33.69392,-21.14132 -48.9633,-21.52198c-26.36762,-0.65734 -42.01156,17.46386 -42.01156,17.46386z" fill="#4cbf56" stroke="#389438" strokeWidth="7.5" strokeLinecap="butt"/>
    <path d="M160.625,89l2,182" fill="none" stroke="#389438" strokeWidth="20" strokeLinecap="round"/>
  </svg>
);

export default function Stage() {
  const [state, setState] = useState({ ...projectState });
  const [draggingTarget, setDraggingTarget] = useState<{ id: string, offsetX: number, offsetY: number } | null>(null);

  useEffect(() => {
    return subscribeSpriteState(() => {
      setState({ ...projectState });
    });
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setDraggingTarget(null);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input (like Ask box)
      if (document.activeElement?.tagName === 'INPUT') return;
      
      let key = e.key.toLowerCase();
      if (key === ' ') key = 'space';
      if (key === 'arrowup') key = 'up';
      if (key === 'arrowdown') key = 'down';
      if (key === 'arrowleft') key = 'left';
      if (key === 'arrowright') key = 'right';

      if (!keysPressed.has(key)) {
        keysPressed.add(key);
        const workspace = Blockly.getMainWorkspace();
        if (workspace) {
          const dom = Blockly.Xml.workspaceToDom(workspace);
          const xml = Blockly.Xml.domToText(dom);
          updateSprite({ workspaceXml: xml });
        }
        import('../interpreter').then(module => module.runAllKeyPresses(key));
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      let key = e.key.toLowerCase();
      if (key === ' ') key = 'space';
      if (key === 'arrowup') key = 'up';
      if (key === 'arrowdown') key = 'down';
      if (key === 'arrowleft') key = 'left';
      if (key === 'arrowright') key = 'right';
      keysPressed.delete(key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const runScripts = async () => {
    setRunning(false); // stop any previous
    await new Promise(r => setTimeout(r, 10)); // tiny gap
    setRunning(true);
    
    const workspace = Blockly.getMainWorkspace();
    if (workspace) {
      // Sync active before run
      const dom = Blockly.Xml.workspaceToDom(workspace);
      const xml = Blockly.Xml.domToText(dom);
      updateSprite({ workspaceXml: xml });
    }
    
    // Instead of using main workspace, we let interpreter load everything
    import('../interpreter').then(module => module.runAllGreenFlags());
  };

  const stopScripts = () => {
    setRunning(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let mx = (e.clientX - rect.left) - rect.width / 2;
    let my = rect.height / 2 - (e.clientY - rect.top);
    updateSprite({ mouseX: mx, mouseY: my });

    if (draggingTarget && !isRunning) {
      updateTarget(draggingTarget.id, { 
        x: Math.round(mx - draggingTarget.offsetX), 
        y: Math.round(my - draggingTarget.offsetY) 
      });
    }
  };

  const handleSpriteMouseDown = (e: React.MouseEvent<HTMLDivElement>, sprite: any) => {
    if (isRunning) return;
    
    // Select this sprite when clicked
    updateProjectState({ activeTargetId: sprite.id });

    const rect = e.currentTarget.parentElement!.getBoundingClientRect();
    let mx = (e.clientX - rect.left) - rect.width / 2;
    let my = rect.height / 2 - (e.clientY - rect.top);
    
    // Find offset
    const offsetX = mx - sprite.x;
    const offsetY = my - sprite.y;
    
    setDraggingTarget({ id: sprite.id, offsetX, offsetY });
    e.stopPropagation();
  };

  const stageData = state.targets.find(t => t.isStage)!;
  const sprites = state.targets.filter(t => !t.isStage);

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden h-[360px] shadow-sm relative">
      {/* Stage Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50/50 absolute top-0 left-0 right-0 z-30">
        <div className="flex items-center gap-4">
          <button onClick={runScripts} className="hover:opacity-80 transition-opacity">
            <GreenFlagIcon width={24} height={24} />
          </button>
          <button onClick={stopScripts} className="text-red-500 hover:text-red-600 transition-colors">
            <Octagon size={24} fill="currentColor" />
          </button>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <Maximize2 size={18} />
        </button>
      </div>
      
      {/* Stage Canvas (480x360 coordinates) */}
      <div className="flex-grow bg-white relative overflow-hidden mt-10 z-10" 
           onMouseMove={handleMouseMove}>
        {/* Backdrop Rendering */}
        <div className="absolute inset-0 z-0">
           {stageData.costumes[stageData.activeCostumeIndex]?.dataUrl && (
             <img src={stageData.costumes[stageData.activeCostumeIndex].dataUrl} className="w-full h-full object-cover" />
           )}
        </div>

        {/* Sprites Rendering */}
        {sprites.map(sprite => sprite.show && (
          <div
            key={sprite.id}
            className={`absolute transition-transform duration-75 z-10 ${!isRunning ? 'cursor-move' : ''}`}
            onMouseDown={(e) => handleSpriteMouseDown(e, sprite)}
            style={{
              left: `calc(50% + ${sprite.x}px)`,
              top: `calc(50% - ${sprite.y}px)`,
              transform: `translate(-50%, -50%) rotate(${sprite.direction - 90}deg) scale(${sprite.size / 100})`,
              transformOrigin: 'center center',
            }}
          >
            {sprite.sayText && (
              <div 
                className={`absolute left-[80%] bottom-[80%] bg-white border-2 border-gray-300 rounded-2xl px-4 py-2 text-sm text-gray-800 shadow-sm whitespace-nowrap z-20`}
                style={{
                  transform: `scale(${100 / sprite.size}) rotate(${-(sprite.direction - 90)}deg)`,
                  transformOrigin: 'bottom left',
                }}
              >
                {sprite.sayText}
                {sprite.think ? (
                  <>
                    <div className="absolute top-[calc(100%+4px)] left-4 w-3 h-3 rounded-full border-2 border-gray-300 bg-white"></div>
                    <div className="absolute top-[calc(100%+20px)] left-2 w-1.5 h-1.5 rounded-full border-2 border-gray-300 bg-white"></div>
                  </>
                ) : (
                  <div className="absolute top-full left-4 w-3 h-3 bg-white border-b-2 border-r-2 border-gray-300 transform -translate-y-[1.5px] rotate-45"></div>
                )}
              </div>
            )}
            {sprite.costumes[sprite.activeCostumeIndex]?.dataUrl ? (
              <img 
                src={sprite.costumes[sprite.activeCostumeIndex].dataUrl} 
                alt={sprite.name} 
                style={{ width: 100, height: 105, objectFit: 'contain' }} 
                draggable={false}
              />
            ) : (
              <CatSprite width={100} height={105} />
            )}
            
            {/* Ask input overlay per sprite (if active) */}
            {sprite.asking && (
              <div 
                className="absolute left-[80%] bottom-[40%] bg-white/90 p-2 rounded-lg border border-blue-200 shadow-md flex flex-col gap-2 z-30"
                style={{
                  transform: `scale(${100 / sprite.size}) rotate(${-(sprite.direction - 90)}deg)`,
                  transformOrigin: 'bottom left',
                }}
              >
                {sprite.askText && <span className="text-sm font-semibold text-blue-800 whitespace-nowrap">{sprite.askText}</span>}
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    className="flex-grow border border-blue-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 bg-white w-32" 
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        sprite.askResolve?.(e.currentTarget.value);
                      }
                    }}
                  />
                  <button 
                    className="bg-blue-500 text-white rounded w-6 h-6 flex items-center justify-center font-bold text-xs"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      sprite.askResolve?.(input.value);
                    }}
                  >
                    ✓
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
