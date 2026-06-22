import * as Blockly from 'blockly';
import { updateTarget, projectState, isRunning, globalVariables, timerStart } from './store';
import { defineScratchBlocks } from './components/scratchBlocks';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const evaluateInput = (block: Blockly.Block, name: string, targetId: string): any => {
  const targetBlock = block.getInputTargetBlock(name);
  if (targetBlock) {
    return evaluateBlock(targetBlock, targetId);
  }
  const field = block.getInput(name)?.fieldRow.find(f => f.name === 'NUM' || f.name === 'TEXT' || f.name === 'COSTUME' || f.name === 'BACKDROP');
  if (field) {
    const val = field.getValue();
    const num = Number(val);
    return isNaN(num) ? val : num;
  }
  return 0;
};

const evaluateBlock = (block: Blockly.Block, targetId: string): any => {
  if (!block) return null;
  const targetState = projectState.targets.find(t => t.id === targetId);
  if (!targetState) return null;

  switch (block.type) {
    case 'math_number':
      return Number(block.getFieldValue('NUM'));
    case 'text':
      return block.getFieldValue('TEXT');
    case 'variables_get': {
      const varId = block.getFieldValue('VAR');
      if (!varId) return 0;
      const variable = block.workspace.getVariableMap()?.getVariableById(varId) as any;
      const name = variable ? variable.name : varId;
      return globalVariables[name] ?? 0;
    }
    case 'operator_add':
      return Number(evaluateInput(block, 'NUM1', targetId)) + Number(evaluateInput(block, 'NUM2', targetId));
    case 'operator_subtract':
      return Number(evaluateInput(block, 'NUM1', targetId)) - Number(evaluateInput(block, 'NUM2', targetId));
    case 'operator_multiply':
      return Number(evaluateInput(block, 'NUM1', targetId)) * Number(evaluateInput(block, 'NUM2', targetId));
    case 'operator_divide':
      return Number(evaluateInput(block, 'NUM1', targetId)) / Number(evaluateInput(block, 'NUM2', targetId));
    case 'operator_random': {
      let min = Number(evaluateInput(block, 'FROM', targetId));
      let max = Number(evaluateInput(block, 'TO', targetId));
      if (min > max) { const temp = min; min = max; max = temp; }
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    case 'operator_gt':
      return Number(evaluateInput(block, 'OPERAND1', targetId)) > Number(evaluateInput(block, 'OPERAND2', targetId));
    case 'operator_lt':
      return Number(evaluateInput(block, 'OPERAND1', targetId)) < Number(evaluateInput(block, 'OPERAND2', targetId));
    case 'operator_equals':
      return String(evaluateInput(block, 'OPERAND1', targetId)) === String(evaluateInput(block, 'OPERAND2', targetId));
    case 'operator_and':
      return evaluateInput(block, 'OPERAND1', targetId) && evaluateInput(block, 'OPERAND2', targetId);
    case 'operator_or':
      return evaluateInput(block, 'OPERAND1', targetId) || evaluateInput(block, 'OPERAND2', targetId);
    case 'operator_not':
      return !evaluateInput(block, 'OPERAND', targetId);
    case 'sensing_touchingobject': {
      const obj = block.getFieldValue('TOUCHINGOBJECTMENU');
      if (obj === '_edge_') {
         const hw = (100 * targetState.size / 100) / 2;
         const hh = (105 * targetState.size / 100) / 2;
         return targetState.x - hw <= -240 || targetState.x + hw >= 240 || 
                targetState.y - hh <= -180 || targetState.y + hh >= 180;
      } else if (obj === '_mouse_') {
         const hw = (100 * targetState.size / 100) / 2;
         const hh = (105 * targetState.size / 100) / 2;
         return projectState.mouseX >= targetState.x - hw && projectState.mouseX <= targetState.x + hw &&
                projectState.mouseY >= targetState.y - hh && projectState.mouseY <= targetState.y + hh;
      }
      return false;
    }
    case 'sensing_answer': {
      return projectState.answer;
    }
    case 'sensing_timer': {
      return (Date.now() - timerStart) / 1000;
    }
    default:
      return null;
  }
};

export const executeBlockSeq = async (block: Blockly.Block | null, targetId: string) => {
  let currentBlock = block;
  let executions = 0;
  while (currentBlock && isRunning) {
    await executeBlock(currentBlock, targetId);
    if (!isRunning) break;
    currentBlock = currentBlock.getNextBlock();
    
    executions++;
    if (executions % 10 === 0) {
      // Yield slightly to prevent blocking the UI or stack overflow
      await new Promise(r => setTimeout(r, 0));
    }
  }
};

const executeBlock = async (block: Blockly.Block, targetId: string) => {
  const targetState = projectState.targets.find(t => t.id === targetId);
  if (!targetState) return;
  const update = (updates: Partial<typeof targetState>) => updateTarget(targetId, updates);

  switch (block.type) {
    case 'motion_movesteps': {
      const steps = evaluateInput(block, 'STEPS', targetId);
      const rad = (90 - targetState.direction) * Math.PI / 180;
      update({
        x: targetState.x + steps * Math.cos(rad),
        y: targetState.y + steps * Math.sin(rad),
      });
      break;
    }
    case 'motion_turnright': {
      const deg = evaluateInput(block, 'DEGREES', targetId);
      update({ direction: (targetState.direction + deg) % 360 });
      break;
    }
    case 'motion_turnleft': {
      const deg = evaluateInput(block, 'DEGREES', targetId);
      update({ direction: (targetState.direction - deg) % 360 });
      break;
    }
    case 'motion_gotoxy': {
      const x = evaluateInput(block, 'X', targetId);
      const y = evaluateInput(block, 'Y', targetId);
      update({ x, y });
      break;
    }
    case 'looks_say': {
      const msg = evaluateInput(block, 'MESSAGE', targetId);
      if (targetState.sayTimeoutId) clearTimeout(targetState.sayTimeoutId);
      update({ sayText: String(msg), think: false, sayTimeoutId: null });
      break;
    }
    case 'looks_sayforsecs': {
      const msg = evaluateInput(block, 'MESSAGE', targetId);
      const secs = evaluateInput(block, 'SECS', targetId);
      if (targetState.sayTimeoutId) clearTimeout(targetState.sayTimeoutId);
      update({ sayText: String(msg), think: false });
      await delay(secs * 1000);
      if (!isRunning) return;
      update({ sayText: '' });
      break;
    }
    case 'looks_thinkforsecs': {
      const msg = evaluateInput(block, 'MESSAGE', targetId);
      const secs = evaluateInput(block, 'SECS', targetId);
      if (targetState.sayTimeoutId) clearTimeout(targetState.sayTimeoutId);
      update({ sayText: String(msg), think: true });
      await delay(secs * 1000);
      if (!isRunning) return;
      update({ sayText: '', think: false });
      break;
    }
    case 'looks_show': {
      update({ show: true });
      break;
    }
    case 'looks_hide': {
      update({ show: false });
      break;
    }
    case 'looks_switchcostumeto': {
      const costumeName = evaluateInput(block, 'COSTUME', targetId);
      const idx = targetState.costumes.findIndex(c => c.name === costumeName);
      if (idx !== -1) update({ activeCostumeIndex: idx });
      break;
    }
    case 'looks_nextcostume': {
      update({ activeCostumeIndex: (targetState.activeCostumeIndex + 1) % Math.max(1, targetState.costumes.length) });
      break;
    }
    case 'looks_switchbackdropto': {
      const stage = projectState.targets.find(t => t.isStage);
      if (stage) {
         const backdropName = evaluateInput(block, 'BACKDROP', targetId);
         const idx = stage.costumes.findIndex(c => c.name === backdropName);
         if (idx !== -1) updateTarget(stage.id, { activeCostumeIndex: idx });
      }
      break;
    }
    case 'looks_nextbackdrop': {
       const stage = projectState.targets.find(t => t.isStage);
       if (stage) {
          updateTarget(stage.id, { activeCostumeIndex: (stage.activeCostumeIndex + 1) % Math.max(1, stage.costumes.length) });
       }
       break;
    }
    case 'control_wait': {
      const secs = evaluateInput(block, 'DURATION', targetId);
      await delay(secs * 1000);
      break;
    }
    case 'control_repeat': {
      const times = evaluateInput(block, 'TIMES', targetId);
      const substack = block.getInputTargetBlock('SUBSTACK');
      for (let i = 0; i < times && isRunning; i++) {
        await executeBlockSeq(substack, targetId);
        await new Promise(r => requestAnimationFrame(r));
      }
      break;
    }
    case 'control_forever': {
      const substack = block.getInputTargetBlock('SUBSTACK');
      while (isRunning) {
        await executeBlockSeq(substack, targetId);
        await new Promise(r => requestAnimationFrame(r));
      }
      break;
    }
    case 'control_if': {
      const condition = evaluateInput(block, 'CONDITION', targetId);
      if (condition) {
        const substack = block.getInputTargetBlock('SUBSTACK');
        await executeBlockSeq(substack, targetId);
      }
      break;
    }
    case 'control_if_else': {
      const condition = evaluateInput(block, 'CONDITION', targetId);
      if (condition) {
        const substack = block.getInputTargetBlock('SUBSTACK');
        await executeBlockSeq(substack, targetId);
      } else {
        const substack2 = block.getInputTargetBlock('SUBSTACK2');
        await executeBlockSeq(substack2, targetId);
      }
      break;
    }
    case 'variables_set': {
      const varId = block.getFieldValue('VAR');
      if (varId) {
        const variable = block.workspace.getVariableMap()?.getVariableById(varId) as any;
        const name = variable ? variable.name : varId;
        const value = evaluateInput(block, 'VALUE', targetId);
        globalVariables[name] = value;
      }
      break;
    }
    case 'math_change': {
      const varId = block.getFieldValue('VAR');
      if (varId) {
        const variable = block.workspace.getVariableMap()?.getVariableById(varId) as any;
        const name = variable ? variable.name : varId;
        const delta = evaluateInput(block, 'DELTA', targetId);
        const current = globalVariables[name] ?? 0;
        globalVariables[name] = Number(current) + Number(delta);
      }
      break;
    }
    case 'sensing_askandwait': {
      const question = evaluateInput(block, 'QUESTION', targetId);
      update({ asking: true, askText: String(question) });
      const answer = await new Promise<string>(resolve => {
        update({ askResolve: resolve });
      });
      if (!isRunning) return;
      // We set the global answer via projectState which requires custom treatment or updating active object?
      // updateTarget doesn't handle global 'answer' except if we map it. We mapped answer to project state in updateSprite
      // Let's import updateProjectState and use it
      const { updateProjectState } = await import('./store');
      updateProjectState({ answer });
      update({ asking: false, askText: '', askResolve: null });
      break;
    }
    case 'sound_playuntildone':
    case 'sound_play': {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
        }
      } catch (e) {}
      if (block.type === 'sound_playuntildone') {
        await delay(200);
      }
      break;
    }
    case 'procedures_callnoreturn': {
      const name = block.getFieldValue('NAME');
      const topBlocks = block.workspace.getTopBlocks(false);
      const defBlock = topBlocks.find(b => b.type === 'procedures_defnoreturn' && b.getFieldValue('NAME') === name);
      if (defBlock) {
        const nextBlock = defBlock.getNextBlock();
        if (nextBlock) {
          await executeBlockSeq(nextBlock, targetId);
        }
      }
      break;
    }
  }
};

const _workspaces: Record<string, Blockly.Workspace> = {};

export const loadWorkspaces = () => {
    defineScratchBlocks();
    projectState.targets.forEach(t => {
        if (!_workspaces[t.id]) {
           _workspaces[t.id] = new Blockly.Workspace();
        }
        _workspaces[t.id].clear();
        if (t.workspaceXml) {
           try {
             const dom = Blockly.utils.xml.textToDom(t.workspaceXml);
             Blockly.Xml.domToWorkspace(dom, _workspaces[t.id]);
           } catch (e) {
             console.error("Failed to parse workspace:", e);
           }
        }
    });
};

export const runAllGreenFlags = () => {
    loadWorkspaces();
    projectState.targets.forEach(t => {
        const ws = _workspaces[t.id];
        const scripts = ws.getTopBlocks(false).filter(b => b.type === 'event_whenflagclicked');
        scripts.forEach(script => {
          const nextBlock = script.getNextBlock();
          if (nextBlock) {
            executeBlockSeq(nextBlock, t.id);
          }
        });
    });
};

export const runAllKeyPresses = (key: string) => {
    loadWorkspaces();
    projectState.targets.forEach(t => {
        const ws = _workspaces[t.id];
        const scripts = ws.getTopBlocks(false).filter(b => 
          b.type === 'event_whenkeypressed' && 
          (b.getFieldValue('KEY').toLowerCase() === key || b.getFieldValue('KEY') === 'any')
        );
        scripts.forEach(script => {
          const nextBlock = script.getNextBlock();
          if (nextBlock) {
            executeBlockSeq(nextBlock, t.id);
          }
        });
    });
};
