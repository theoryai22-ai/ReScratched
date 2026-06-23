import React, { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly';
import { defineScratchBlocks } from './scratchBlocks';
import { projectState, subscribeSpriteState, updateTarget, getActiveTarget } from '../store';

// This will be called inside useEffect
const forceTextBlockWhite = () => {
  if (Blockly && Blockly.Blocks && Blockly.Blocks['text']) {
    const originalInit = Blockly.Blocks['text'].init;
    // Only patch once
    if (!(originalInit as any).__patched) {
      Blockly.Blocks['text'].init = function(this: Blockly.Block) {
        if (originalInit) originalInit.call(this);
        this.setColour('#FFFFFF');
      };
      (Blockly.Blocks['text'].init as any).__patched = true;
    }
  }
};

const toolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Motion',
      colour: '#4C97FF',
      cssConfig: { container: 'scratch-category-motion' },
      contents: [
        { kind: 'block', type: 'motion_movesteps', inputs: { STEPS: { shadow: { type: 'math_number', fields: { NUM: 10 }}}} },
        { kind: 'block', type: 'motion_turnright', inputs: { DEGREES: { shadow: { type: 'math_number', fields: { NUM: 15 }}}} },
        { kind: 'block', type: 'motion_turnleft', inputs: { DEGREES: { shadow: { type: 'math_number', fields: { NUM: 15 }}}} },
        { kind: 'block', type: 'motion_gotoxy', inputs: { X: { shadow: { type: 'math_number', fields: { NUM: 0 }}}, Y: { shadow: { type: 'math_number', fields: { NUM: 0 }}}} },
      ],
    },
    {
      kind: 'category',
      name: 'Looks',
      colour: '#9966FF',
      cssConfig: { container: 'scratch-category-looks' },
      contents: [
        { kind: 'block', type: 'looks_sayforsecs', inputs: { MESSAGE: { shadow: { type: 'text', fields: { TEXT: 'Hello!' }}}, SECS: { shadow: { type: 'math_number', fields: { NUM: 2 }}}} },
        { kind: 'block', type: 'looks_say', inputs: { MESSAGE: { shadow: { type: 'text', fields: { TEXT: 'Hello!' }}}} },
        { kind: 'block', type: 'looks_thinkforsecs', inputs: { MESSAGE: { shadow: { type: 'text', fields: { TEXT: 'Hmm...' }}}, SECS: { shadow: { type: 'math_number', fields: { NUM: 2 }}}} },
        { kind: 'block', type: 'looks_switchcostumeto', inputs: { COSTUME: { shadow: { type: 'text', fields: { TEXT: 'costume1' }}}} },
        { kind: 'block', type: 'looks_nextcostume' },
        { kind: 'block', type: 'looks_switchbackdropto', inputs: { BACKDROP: { shadow: { type: 'text', fields: { TEXT: 'backdrop1' }}}} },
        { kind: 'block', type: 'looks_nextbackdrop' },
      ],
    },
    {
      kind: 'category',
      name: 'Sound',
      colour: '#CF63CF',
      cssConfig: { container: 'scratch-category-sound' },
      contents: [
        { kind: 'block', type: 'sound_playuntildone' },
        { kind: 'block', type: 'sound_play' },
      ],
    },
    {
      kind: 'category',
      name: 'Events',
      colour: '#FFBF00',
      cssConfig: { container: 'scratch-category-events' },
      contents: [
        { kind: 'block', type: 'event_whenflagclicked' },
        { kind: 'block', type: 'event_whenkeypressed' },
      ],
    },
    {
      kind: 'category',
      name: 'Control',
      colour: '#FFAB19',
      cssConfig: { container: 'scratch-category-control' },
      contents: [
        { kind: 'block', type: 'control_wait', inputs: { DURATION: { shadow: { type: 'math_number', fields: { NUM: 1 }}}} },
        { kind: 'block', type: 'control_repeat', inputs: { TIMES: { shadow: { type: 'math_number', fields: { NUM: 10 }}}} },
        { kind: 'block', type: 'control_forever' },
        { kind: 'block', type: 'control_if' },
        { kind: 'block', type: 'control_if_else' },
      ],
    },
    {
      kind: 'category',
      name: 'Sensing',
      colour: '#5CB1D6',
      cssConfig: { container: 'scratch-category-sensing' },
      contents: [
        { kind: 'block', type: 'sensing_touchingobject' },
        { kind: 'block', type: 'sensing_askandwait', inputs: { QUESTION: { shadow: { type: 'text', fields: { TEXT: "What's your name?" }}}} },
        { kind: 'block', type: 'sensing_answer' },
        { kind: 'block', type: 'sensing_timer' },
      ],
    },
    {
      kind: 'category',
      name: 'Operators',
      colour: '#59C059',
      cssConfig: { container: 'scratch-category-operators' },
      contents: [
        { kind: 'block', type: 'operator_add', inputs: { NUM1: { shadow: { type: 'math_number', fields: { NUM: 0 }}}, NUM2: { shadow: { type: 'math_number', fields: { NUM: 0 }}}} },
        { kind: 'block', type: 'operator_subtract', inputs: { NUM1: { shadow: { type: 'math_number', fields: { NUM: 0 }}}, NUM2: { shadow: { type: 'math_number', fields: { NUM: 0 }}}} },
        { kind: 'block', type: 'operator_multiply', inputs: { NUM1: { shadow: { type: 'math_number', fields: { NUM: 0 }}}, NUM2: { shadow: { type: 'math_number', fields: { NUM: 0 }}}} },
        { kind: 'block', type: 'operator_divide', inputs: { NUM1: { shadow: { type: 'math_number', fields: { NUM: 0 }}}, NUM2: { shadow: { type: 'math_number', fields: { NUM: 0 }}}} },
        { kind: 'block', type: 'operator_random', inputs: { FROM: { shadow: { type: 'math_number', fields: { NUM: 1 }}}, TO: { shadow: { type: 'math_number', fields: { NUM: 10 }}}} },
        { kind: 'block', type: 'operator_gt', inputs: { OPERAND1: { shadow: { type: 'text', fields: { TEXT: "" }}}, OPERAND2: { shadow: { type: 'text', fields: { TEXT: "50" }}}} },
        { kind: 'block', type: 'operator_lt', inputs: { OPERAND1: { shadow: { type: 'text', fields: { TEXT: "" }}}, OPERAND2: { shadow: { type: 'text', fields: { TEXT: "50" }}}} },
        { kind: 'block', type: 'operator_equals', inputs: { OPERAND1: { shadow: { type: 'text', fields: { TEXT: "" }}}, OPERAND2: { shadow: { type: 'text', fields: { TEXT: "50" }}}} },
        { kind: 'block', type: 'operator_and' },
        { kind: 'block', type: 'operator_or' },
        { kind: 'block', type: 'operator_not' },
      ],
    },
    {
      kind: 'category',
      name: 'Variables',
      categorystyle: 'variable_category',
      cssConfig: { container: 'scratch-category-variables' },
      custom: 'VARIABLE',
    },
    {
      kind: 'category',
      name: 'My Blocks',
      categorystyle: 'procedure_category',
      cssConfig: { container: 'scratch-category-myblocks' },
      custom: 'PROCEDURE',
    },
  ],
};

let customTheme: Blockly.Theme;

export default function BlocklyEditor() {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);
  const activeTargetIdRef = useRef<string>(projectState.activeTargetId);

  useEffect(() => {
    return subscribeSpriteState(() => {
      if (activeTargetIdRef.current !== projectState.activeTargetId && workspace.current) {
        const prevTargetId = activeTargetIdRef.current;
        activeTargetIdRef.current = projectState.activeTargetId;
        
        // Save current XML
        const domToSave = Blockly.Xml.workspaceToDom(workspace.current);
        const xmlToSave = Blockly.Xml.domToText(domToSave);
        updateTarget(prevTargetId, { workspaceXml: xmlToSave });
        
        // Load new XML
        workspace.current.clear();
        const activeTarget = getActiveTarget();
        if (activeTarget.workspaceXml) {
          try {
             const domToLoad = Blockly.utils.xml.textToDom(activeTarget.workspaceXml);
             Blockly.Xml.domToWorkspace(domToLoad, workspace.current);
          } catch(e) {}
        }
      }
    });
  }, []);

  useEffect(() => {
    defineScratchBlocks();
    forceTextBlockWhite();

    if (blocklyDiv.current && !workspace.current) {
      
      // Override standard Blockly constants to make blocks thinner, less bulky, more like old Scratch or exact 3.0 sizes
      if (!customTheme) {
        customTheme = Blockly.Theme.defineTheme('scratch', {
          name: 'scratch',
          base: Blockly.Themes.Zelos,
        categoryStyles: {
          procedure_category: {
            colour: '#FF6680',
          },
          variable_category: {
            colour: '#FF8C1A',
          },
        },
        blockStyles: {
          text_blocks: {
            colourPrimary: '#FFFFFF',
            colourSecondary: '#FFFFFF',
            colourTertiary: '#FFFFFF',
          },
          procedure_blocks: {
            colourPrimary: '#FF6680',
            colourSecondary: '#FF4D6A',
            colourTertiary: '#FF3355',
          },
          variable_blocks: {
            colourPrimary: '#FF8C1A',
            colourSecondary: '#FF8000',
            colourTertiary: '#DB6E00',
          },
        },
        componentStyles: {
          workspaceBackgroundColour: '#F9F9F9',
          toolboxBackgroundColour: '#FFFFFF',
          toolboxForegroundColour: '#575E75',
          flyoutBackgroundColour: '#F9F9F9',
          flyoutForegroundColour: '#575E75',
          flyoutOpacity: 1,
          scrollbarColour: '#CECDCE',
          scrollbarOpacity: 0.5,
          insertionMarkerColour: '#000000',
          insertionMarkerOpacity: 0.2,
        },
        fontStyle: {
          family: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          weight: 'normal',
          size: 13,
        },
        startHats: true,
      });
      }

      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolbox,
        renderer: 'zelos',
        media: 'https://unpkg.com/blockly/media/',
        move: {
          scrollbars: true,
          drag: true,
          wheel: true,
        },
        zoom: {
          controls: true,
          wheel: true,
          startScale: 0.8, // Slightly zoom out to make it feel less thick overall
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2,
        },
        trashcan: false,
        theme: customTheme,
      });

      // Load initial XML
      const activeTarget = getActiveTarget();
      if (activeTarget && activeTarget.workspaceXml && workspace.current) {
         try {
           const domToLoad = Blockly.utils.xml.textToDom(activeTarget.workspaceXml);
           Blockly.Xml.domToWorkspace(domToLoad, workspace.current);
         } catch(e) {}
      }

      workspace.current.addChangeListener((e) => {
        if (e.isUiEvent || e.type === Blockly.Events.FINISHED_LOADING) return;
        if (workspace.current) {
          const active = getActiveTarget();
          if (active) {
            const dom = Blockly.Xml.workspaceToDom(workspace.current);
            active.workspaceXml = Blockly.Xml.domToText(dom);
          }
        }
      });

      const observer = new ResizeObserver(() => {
        if (workspace.current) {
          Blockly.svgResize(workspace.current);
        }
      });
      observer.observe(blocklyDiv.current);
      return () => observer.disconnect();
    }
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full" ref={blocklyDiv} />
  );
}
