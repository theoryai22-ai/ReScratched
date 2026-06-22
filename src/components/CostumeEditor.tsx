import React, { useState, useEffect, useRef } from 'react';
import { Undo2, Redo2, Copy, ClipboardPaste, Trash2, FlipHorizontal, FlipVertical, ZoomIn, ZoomOut, MousePointer2, Type, Circle, Square, Minus, PaintBucket, Eraser, Plus } from 'lucide-react';
import { updateSprite, subscribeSpriteState, projectState, getActiveTarget, TargetState, updateTarget } from '../store';
import CatSprite from './CatSprite';

function floodFill(ctx: CanvasRenderingContext2D, x: number, y: number, fillColor: string) {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const data = imageData.data;
  
  const startPos = (y * ctx.canvas.width + x) * 4;
  const startR = data[startPos];
  const startG = data[startPos + 1];
  const startB = data[startPos + 2];
  const startA = data[startPos + 3];

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = 1; tempCanvas.height = 1;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.fillStyle = fillColor;
  tempCtx.fillRect(0,0,1,1);
  const fillData = tempCtx.getImageData(0,0,1,1).data;
  const [fR, fG, fB, fA] = fillData;

  if (startR === fR && startG === fG && startB === fB && startA === fA) return;

  const stack = [[x, y]];
  const matchStartColor = (pos: number) => {
    return data[pos] === startR && data[pos + 1] === startG && data[pos + 2] === startB && data[pos + 3] === startA;
  };
  const colorPixel = (pos: number) => {
    data[pos] = fR;
    data[pos + 1] = fG;
    data[pos + 2] = fB;
    data[pos + 3] = fA;
  };

  while (stack.length) {
    const [cx, cy] = stack.pop()!;
    let currentX = cx;
    let pos = (cy * ctx.canvas.width + cx) * 4;
    while (currentX >= 0 && matchStartColor(pos)) {
      currentX--;
      pos -= 4;
    }
    currentX++;
    pos += 4;
    let expandUp = false;
    let expandDown = false;
    while (currentX < ctx.canvas.width && matchStartColor(pos)) {
      colorPixel(pos);
      if (cy > 0) {
        if (matchStartColor(pos - ctx.canvas.width * 4)) {
          if (!expandUp) { stack.push([currentX, cy - 1]); expandUp = true; }
        } else { expandUp = false; }
      }
      if (cy < ctx.canvas.height - 1) {
        if (matchStartColor(pos + ctx.canvas.width * 4)) {
          if (!expandDown) { stack.push([currentX, cy + 1]); expandDown = true; }
        } else { expandDown = false; }
      }
      currentX++;
      pos += 4;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

export default function CostumeEditor() {
  const [state, setState] = useState(getActiveTarget());
  const [activeTargetId, setActiveTargetId] = useState(projectState.activeTargetId);
  const [activeTool, setActiveTool] = useState('brush');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('#9966FF');
  const [lineWidth, setLineWidth] = useState(4);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    return subscribeSpriteState(() => {
      setState({ ...getActiveTarget() });
      setActiveTargetId(projectState.activeTargetId);
    });
  }, []);

  // Sync canvas with store costumes active
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const activeCostume = state.costumes[state.activeCostumeIndex];
    if (activeCostume && activeCostume.dataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = activeCostume.dataUrl;
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [state.activeCostumeIndex]);

  const saveCanvasToStore = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    
    // Create new array to trigger update
    const newCostumes = [...state.costumes];
    if (newCostumes[state.activeCostumeIndex]) {
      newCostumes[state.activeCostumeIndex] = {
        ...newCostumes[state.activeCostumeIndex],
        dataUrl
      };
      updateTarget(state.id, { costumes: newCostumes });
    }
  };

  const getCanvasCoords = (e: React.MouseEvent) => {
    const canvas = previewCanvasRef.current; // use top overlay canvas
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
  };

  const handlePointerDown = (e: React.MouseEvent) => {
    const { x, y } = getCanvasCoords(e);
    setIsDrawing(true);
    setStartPos({ x, y });

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    if (activeTool === 'fill') {
      floodFill(ctx, Math.floor(x), Math.floor(y), fillColor);
      saveCanvasToStore();
      setIsDrawing(false);
      return;
    }

    if (activeTool === 'brush' || activeTool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const handlePointerMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const { x, y } = getCanvasCoords(e);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const prevCanvas = previewCanvasRef.current;
    const prevCtx = prevCanvas?.getContext('2d');
    if (!ctx || !prevCtx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    prevCtx.lineCap = 'round';
    prevCtx.lineJoin = 'round';

    if (activeTool === 'brush') {
      ctx.lineTo(x, y);
      ctx.strokeStyle = fillColor; // commonly brush uses fill color in these simple apps
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    } else if (activeTool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = lineWidth * 2;
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    } else {
      // Shape preview
      prevCtx.clearRect(0, 0, prevCanvas.width, prevCanvas.height);
      prevCtx.beginPath();
      
      if (activeTool === 'line') {
        prevCtx.moveTo(startPos.x, startPos.y);
        prevCtx.lineTo(x, y);
        prevCtx.strokeStyle = strokeColor;
        prevCtx.lineWidth = lineWidth;
        prevCtx.stroke();
      } else if (activeTool === 'rect') {
        prevCtx.rect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
        prevCtx.fillStyle = fillColor;
        prevCtx.fill();
        prevCtx.strokeStyle = strokeColor;
        prevCtx.lineWidth = lineWidth;
        prevCtx.stroke();
      } else if (activeTool === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
        prevCtx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
        prevCtx.fillStyle = fillColor;
        prevCtx.fill();
        prevCtx.strokeStyle = strokeColor;
        prevCtx.lineWidth = lineWidth;
        prevCtx.stroke();
      }
    }
  };

  const handlePointerUp = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const prevCanvas = previewCanvasRef.current;
    const prevCtx = prevCanvas?.getContext('2d');
    
    if (activeTool === 'brush' || activeTool === 'eraser' || activeTool === 'fill') {
      saveCanvasToStore();
      return;
    }

    if (ctx && prevCanvas && prevCtx) {
      ctx.drawImage(prevCanvas, 0, 0);
      prevCtx.clearRect(0, 0, prevCanvas.width, prevCanvas.height);
      saveCanvasToStore();
    }
  };

  const addCostume = () => {
    const newCostumes = [...state.costumes];
    newCostumes.push({
      id: `costume${Date.now()}`,
      name: `costume${newCostumes.length + 1}`,
      dataUrl: ''
    });
    updateTarget(state.id, { costumes: newCostumes, activeCostumeIndex: newCostumes.length - 1 });
  };

  const deleteCostume = (index: number) => {
    if (state.costumes.length <= 1) return;
    const newCostumes = [...state.costumes];
    newCostumes.splice(index, 1);
    const newActiveIndex = Math.min(state.activeCostumeIndex, newCostumes.length - 1);
    updateTarget(state.id, { costumes: newCostumes, activeCostumeIndex: newActiveIndex });
  };

  return (
    <div className="absolute inset-0 flex bg-white font-sans text-xs text-gray-500 font-semibold select-none flex-grow">
      
      {/* Left Sidebar - Costume List */}
      <div className="w-[120px] bg-[#f9f9f9] border-r border-gray-200 flex flex-col relative shrink-0">
        <div className="flex-grow overflow-y-auto p-2 space-y-2">
          {state.costumes.map((c, i) => (
            <div key={c.id} className="relative group">
              {state.costumes.length > 1 && (
                <div 
                  onClick={() => deleteCostume(i)}
                  className="absolute -top-2 -right-2 bg-purple-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 cursor-pointer shadow-sm z-20"
                >
                  <Trash2 size={12} />
                </div>
              )}
              <div 
                onClick={() => updateTarget(state.id, { activeCostumeIndex: i })}
                className={`border rounded-lg p-2 flex flex-col items-center gap-1 cursor-pointer relative overflow-hidden transition-colors ${state.activeCostumeIndex === i ? 'border-purple-500 bg-purple-100' : 'border-gray-300 bg-white hover:border-blue-400'}`}
              >
                <span className={`absolute top-1 left-1.5 text-[10px] font-bold z-10 ${state.activeCostumeIndex === i ? 'text-purple-700' : 'text-gray-400'}`}>{i + 1}</span>
                <div className="w-16 h-16 flex items-center justify-center p-1 bg-white border border-gray-100 rounded">
                  {c.dataUrl ? (
                    <img src={c.dataUrl} className="max-w-full max-h-full object-contain pointer-events-none" />
                  ) : (
                    <CatSprite width={48} height={48} className="pointer-events-none opacity-50 grayscale" />
                  )}
                </div>
              </div>
              <div className={`text-center py-1 mt-[-4px] rounded-b-lg relative z-0 ${state.activeCostumeIndex === i ? 'bg-purple-500 text-white shadow-sm' : 'text-gray-500'}`}>
                <div className="truncate">{c.name}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Costume Button */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <button onClick={addCostume} className="w-12 h-12 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors relative group">
            <Plus size={24} />
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-grow flex flex-col min-w-0 bg-white">
        
        {/* Top Toolbar */}
        <div className="h-[100px] border-b border-dashed border-gray-200 flex flex-col justify-center px-4 py-2 shrink-0">
          <div className="flex items-center gap-6 mb-3">
            {/* Name Input */}
            <div className="flex items-center gap-2">
              <span className="text-black font-semibold">Costume</span>
              <input 
                type="text" 
                value={state.costumes[state.activeCostumeIndex]?.name || ''}
                onChange={(e) => {
                  const newCostumes = [...state.costumes];
                  newCostumes[state.activeCostumeIndex].name = e.target.value;
                  updateTarget(state.id, { costumes: newCostumes });
                }}
                className="border border-gray-300 rounded-full px-3 py-1 w-32 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-black font-semibold">Fill</span>
                <input 
                  type="color" 
                  value={fillColor}
                  onChange={e => setFillColor(e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-black font-semibold">Outline</span>
                <input 
                  type="color" 
                  value={strokeColor}
                  onChange={e => setStrokeColor(e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-black font-semibold">Stroke</span>
                <input 
                  type="number" 
                  value={lineWidth}
                  onChange={e => setLineWidth(Number(e.target.value))}
                  className="w-12 h-8 border border-gray-300 rounded-full text-center focus:outline-none focus:border-blue-400 font-sans"
                  min="1" max="50"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4 border-l border-dashed border-gray-200 pl-6 text-[#575E75]">
              <button 
                className="flex flex-col items-center gap-0.5 hover:text-purple-500 transition-colors"
                onClick={() => {
                  const ctx = canvasRef.current?.getContext('2d');
                  if (ctx) {
                    ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
                    saveCanvasToStore();
                  }
                }}
              >
                <Trash2 size={16} />
                <span className="text-[10px]">Clear Image</span>
              </button>
            </div>
          </div>
        </div>

        {/* Workspace Area */}
        <div className="flex-grow flex relative">
          
          {/* Tools Panel */}
          <div className="w-16 flex flex-col items-center gap-3 py-4 border-r border-dashed border-gray-200 text-gray-600 bg-white z-10 shrink-0">
            {[
              { id: 'brush', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.71 5.63l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-3.12 3.12-1.93-1.91-1.41 1.41 1.42 1.42L3 16.25V21h4.75l8.92-8.92 1.42 1.42 1.41-1.41-1.92-1.92 3.12-3.12c.4-.4.4-1.03.01-1.42zM6.92 19L5 17.08l8.06-8.06 1.92 1.92L6.92 19z"/></svg> },
              { id: 'eraser', icon: <Eraser size={20} className="transform rotate-180" /> },
              { id: 'fill', icon: <PaintBucket size={20} /> },
              { id: 'line', icon: <Minus size={20} strokeWidth={3} className="transform -rotate-45" /> },
              { id: 'circle', icon: <Circle size={20} className="transform -rotate-45" /> },
              { id: 'rect', icon: <Square size={20} /> },
            ].map(tool => (
              <button 
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${activeTool === tool.id ? 'bg-[#7E57C2] text-white' : 'hover:bg-purple-100 hover:text-purple-600'}`}
              >
                {tool.icon}
              </button>
            ))}
          </div>

          {/* Canvas Wrapper */}
          <div className="flex-grow relative overflow-auto bg-gray-50 flex items-center justify-center p-8 select-none">
            <div 
              className="relative shadow-sm border border-gray-200 bg-white" 
              style={{
                width: 480, 
                height: 360, 
                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\'%3E%3Crect width=\'10\' height=\'10\' fill=\'%23f0f0f0\'/%3E%3Crect x=\'10\' y=\'10\' width=\'10\' height=\'10\' fill=\'%23f0f0f0\'/%3E%3Crect x=\'10\' width=\'10\' height=\'10\' fill=\'%23fff\'/%3E%3Crect y=\'10\' width=\'10\' height=\'10\' fill=\'%23fff\'/%3E%3C/svg%3E")',
              }}
            >
              <canvas
                ref={canvasRef}
                width={480}
                height={360}
                className="absolute inset-0 pointer-events-none"
              />
              <canvas
                ref={previewCanvasRef}
                width={480}
                height={360}
                className="absolute inset-0 touch-none"
                style={{ cursor: 'crosshair' }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
