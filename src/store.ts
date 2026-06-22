export type Costume = {
  id: string;
  name: string;
  dataUrl: string; // base64 image data
};

export type TargetState = {
  id: string;
  name: string;
  isStage: boolean;
  
  x: number;
  y: number;
  direction: number;
  size: number;
  show: boolean;
  
  sayText: string;
  think: boolean;
  sayTimeoutId: NodeJS.Timeout | null;
  
  asking: boolean;
  askText: string;
  askResolve: ((val: string) => void) | null;
  
  costumes: Costume[];
  activeCostumeIndex: number;
  
  workspaceXml: string;
};

export const projectState = {
  targets: [
    {
      id: 'stage',
      name: 'Stage',
      isStage: true,
      x: 0, y: 0, direction: 90, size: 100, show: true,
      sayText: '', think: false, sayTimeoutId: null,
      asking: false, askText: '', askResolve: null,
      costumes: [{ id: 'backdrop1', name: 'backdrop1', dataUrl: '' }],
      activeCostumeIndex: 0,
      workspaceXml: '<xml xmlns="https://developers.google.com/blockly/xml"></xml>',
    },
    {
      id: 'sprite1',
      name: 'Sprite1',
      isStage: false,
      x: 0, y: 0, direction: 90, size: 100, show: true,
      sayText: '', think: false, sayTimeoutId: null,
      asking: false, askText: '', askResolve: null,
      costumes: [{ id: 'costume1', name: 'costume1', dataUrl: '' }],
      activeCostumeIndex: 0,
      workspaceXml: '<xml xmlns="https://developers.google.com/blockly/xml"></xml>',
    }
  ] as TargetState[],
  activeTargetId: 'sprite1',
  answer: '',
  mouseX: 0,
  mouseY: 0,
};

// Aliases for compatibility (maps to active target)
export const getActiveTarget = () => projectState.targets.find(t => t.id === projectState.activeTargetId)!;
export const getSpriteState = () => getActiveTarget();
// Proxy spriteState conceptually
export const spriteState = new Proxy({} as TargetState, {
  get: (_, prop) => {
    if (prop === 'answer') return projectState.answer;
    if (prop === 'mouseX') return projectState.mouseX;
    if (prop === 'mouseY') return projectState.mouseY;
    if (prop === 'costumes') return getActiveTarget().costumes;
    if (prop === 'activeCostumeIndex') return getActiveTarget().activeCostumeIndex;
    return (getActiveTarget() as any)[prop];
  },
  set: (_, prop, value) => {
     // fallback mutation
     if (prop === 'answer') projectState.answer = value;
     else if (prop === 'mouseX') projectState.mouseX = value;
     else if (prop === 'mouseY') projectState.mouseY = value;
     else (getActiveTarget() as any)[prop] = value;
     return true;
  }
});

export const updateProjectState = (updates: Partial<typeof projectState>) => {
  Object.assign(projectState, updates);
  listeners.forEach((l) => l());
};

export const updateTarget = (targetId: string, updates: Partial<TargetState>) => {
  const target = projectState.targets.find(t => t.id === targetId);
  if (target) {
    Object.assign(target, updates);
    listeners.forEach((l) => l());
  }
};

export const updateSprite = (updates: Partial<TargetState & { answer: string, mouseX: number, mouseY: number }>) => {
  let changed = false;
  const target = getActiveTarget();
  for (const [key, value] of Object.entries(updates)) {
    if (key === 'answer') {
      if (projectState.answer !== value) { projectState.answer = value as string; changed = true; }
    } else if (key === 'mouseX') {
      if (projectState.mouseX !== value) { projectState.mouseX = value as number; changed = true; }
    } else if (key === 'mouseY') {
      if (projectState.mouseY !== value) { projectState.mouseY = value as number; changed = true; }
    } else {
      if ((target as any)[key] !== value) {
        (target as any)[key] = value;
        changed = true;
      }
    }
  }
  if (changed) {
    listeners.forEach((l) => l());
  }
};

export const globalVariables: Record<string, any> = {};
export const keysPressed = new Set<string>();

export let timerStart = Date.now();
export const resetTimer = () => { timerStart = Date.now(); };

type Listener = () => void;
const listeners = new Set<Listener>();

export const subscribeSpriteState = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export let isRunning = false;
export const setRunning = (val: boolean) => {
  isRunning = val;
};
