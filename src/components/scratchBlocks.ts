import * as Blockly from 'blockly';

let blocksDefined = false;

export function defineScratchBlocks() {
  if (blocksDefined) return;
  blocksDefined = true;

  Blockly.defineBlocksWithJsonArray([
    // EVENTS
    {
      "type": "event_whenflagclicked",
      "message0": "when %1 clicked",
      "args0": [
        {
          "type": "field_image",
          "src": "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"120 50 220 250\"><path d=\"M162.625,205l5,-108c0,0 14.64715,-7 31,-7c7.45424,0 21.13681,3.34667 34.58731,9.7702c13.5124,6.45309 26.80903,15.98376 41.39535,16.23524c10.14985,0.17499 18.74115,1.1169 25.87039,-2.13566c13.16667,-6.00703 21.3464,-16.67741 25.14695,-4.86978c6.07447,18.87228 -1,93 -1,93c0,0 -20.28152,10.59003 -38.14381,11.71345c-6.28786,0.39546 -20.27684,0.79541 -32.88133,-4.65533c-16.8956,-7.30641 -33.69392,-21.14132 -48.9633,-21.52198c-26.36762,-0.65734 -42.01156,17.46386 -42.01156,17.46386z\" fill=\"%234cbf56\" stroke=\"%23389438\" stroke-width=\"7.5\" stroke-linecap=\"butt\"/><path d=\"M160.625,89l2,182\" fill=\"none\" stroke=\"%23389438\" stroke-width=\"20\" stroke-linecap=\"round\"/></svg>",
          "width": 24,
          "height": 24,
          "alt": "flag"
        }
      ],
      "nextStatement": null,
      "colour": "#FFBF00",
      "tooltip": "Starts the script when the green flag is clicked.",
      "helpUrl": ""
    },
    {
      "type": "event_whenkeypressed",
      "message0": "when %1 key pressed",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "KEY",
          "options": [
            ["space", "space"],
            ["up arrow", "up"],
            ["down arrow", "down"]
          ]
        }
      ],
      "nextStatement": null,
      "colour": "#FFBF00",
    },
    // MOTION
    {
      "type": "motion_movesteps",
      "message0": "move %1 steps",
      "args0": [
        {
          "type": "input_value",
          "name": "STEPS",
          "check": "Number"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#4C97FF",
    },
    {
      "type": "motion_turnright",
      "message0": "turn ↻ %1 degrees",
      "args0": [
        {
          "type": "input_value",
          "name": "DEGREES",
          "check": "Number"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#4C97FF",
    },
    {
      "type": "motion_turnleft",
      "message0": "turn ↺ %1 degrees",
      "args0": [
        {
          "type": "input_value",
          "name": "DEGREES",
          "check": "Number"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#4C97FF",
    },
    {
      "type": "motion_gotoxy",
      "message0": "go to x: %1 y: %2",
      "args0": [
        {
          "type": "input_value",
          "name": "X",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "Y",
          "check": "Number"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#4C97FF",
      "inputsInline": true
    },
    // LOOKS
    {
      "type": "looks_switchcostumeto",
      "message0": "switch costume to %1",
      "args0": [
        {
          "type": "input_value",
          "name": "COSTUME"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#9966FF",
    },
    {
      "type": "looks_nextcostume",
      "message0": "next costume",
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#9966FF",
    },
    {
      "type": "looks_switchbackdropto",
      "message0": "switch backdrop to %1",
      "args0": [
        {
          "type": "input_value",
          "name": "BACKDROP"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#9966FF",
    },
    {
      "type": "looks_nextbackdrop",
      "message0": "next backdrop",
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#9966FF",
    },
    {
      "type": "looks_sayforsecs",
      "message0": "say %1 for %2 seconds",
      "args0": [
        {
          "type": "input_value",
          "name": "MESSAGE",
          "check": "String"
        },
        {
          "type": "input_value",
          "name": "SECS",
          "check": "Number"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#9966FF",
      "inputsInline": true
    },
    {
      "type": "looks_say",
      "message0": "say %1",
      "args0": [
        {
          "type": "input_value",
          "name": "MESSAGE",
          "check": "String"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#9966FF",
    },
    {
      "type": "looks_thinkforsecs",
      "message0": "think %1 for %2 seconds",
      "args0": [
        {
          "type": "input_value",
          "name": "MESSAGE",
          "check": "String"
        },
        {
          "type": "input_value",
          "name": "SECS",
          "check": "Number"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#9966FF",
      "inputsInline": true
    },
    // SOUND
    {
      "type": "sound_playuntildone",
      "message0": "play sound %1 until done",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "SOUND",
          "options": [
            ["Meow", "Meow"]
          ]
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#CF63CF",
    },
    {
      "type": "sound_play",
      "message0": "start sound %1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "SOUND",
          "options": [
            ["Meow", "Meow"]
          ]
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#CF63CF",
    },
    // CONTROL
    {
      "type": "control_wait",
      "message0": "wait %1 seconds",
      "args0": [
        {
          "type": "input_value",
          "name": "DURATION",
          "check": "Number"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#FFAB19",
    },
    {
      "type": "control_repeat",
      "message0": "repeat %1 %2 %3",
      "args0": [
        {
          "type": "input_value",
          "name": "TIMES",
          "check": "Number"
        },
        {
          "type": "input_dummy"
        },
        {
          "type": "input_statement",
          "name": "SUBSTACK"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#FFAB19",
    },
    {
      "type": "control_forever",
      "message0": "forever %1 %2",
      "args0": [
        {
          "type": "input_dummy"
        },
        {
          "type": "input_statement",
          "name": "SUBSTACK"
        }
      ],
      "previousStatement": null,
      "colour": "#FFAB19",
    },
    {
      "type": "control_if",
      "message0": "if %1 then %2 %3",
      "args0": [
        {
          "type": "input_value",
          "name": "CONDITION",
          "check": "Boolean"
        },
        {
          "type": "input_dummy"
        },
        {
          "type": "input_statement",
          "name": "SUBSTACK"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#FFAB19",
    },
    {
      "type": "control_if_else",
      "message0": "if %1 then %2 %3 else %4 %5",
      "args0": [
        {
          "type": "input_value",
          "name": "CONDITION",
          "check": "Boolean"
        },
        {
          "type": "input_dummy"
        },
        {
          "type": "input_statement",
          "name": "SUBSTACK"
        },
        {
          "type": "input_dummy"
        },
        {
          "type": "input_statement",
          "name": "SUBSTACK2"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#FFAB19",
    },
    // SENSING
    {
      "type": "sensing_touchingobject",
      "message0": "touching %1 ?",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "TOUCHINGOBJECTMENU",
          "options": [
            ["mouse-pointer", "_mouse_"],
            ["edge", "_edge_"]
          ]
        }
      ],
      "output": "Boolean",
      "colour": "#5CB1D6",
      "outputShape": 1
    },
    {
      "type": "sensing_askandwait",
      "message0": "ask %1 and wait",
      "args0": [
        {
          "type": "input_value",
          "name": "QUESTION",
          "check": "String"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#5CB1D6"
    },
    {
      "type": "sensing_answer",
      "message0": "answer",
      "output": "String",
      "colour": "#5CB1D6",
      "outputShape": 2
    },
    {
      "type": "sensing_timer",
      "message0": "timer",
      "output": "Number",
      "colour": "#5CB1D6",
      "outputShape": 2
    },
    // OPERATORS
    {
      "type": "operator_add",
      "message0": "%1 + %2",
      "args0": [
        {
          "type": "input_value",
          "name": "NUM1",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "NUM2",
          "check": "Number"
        }
      ],
      "output": "Number",
      "colour": "#59C059",
      "inputsInline": true,
      "outputShape": 2 // round output
    },
    {
      "type": "operator_subtract",
      "message0": "%1 - %2",
      "args0": [
        {
          "type": "input_value",
          "name": "NUM1",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "NUM2",
          "check": "Number"
        }
      ],
      "output": "Number",
      "colour": "#59C059",
      "inputsInline": true,
      "outputShape": 2 
    },
    {
      "type": "operator_multiply",
      "message0": "%1 * %2",
      "args0": [
        {
          "type": "input_value",
          "name": "NUM1",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "NUM2",
          "check": "Number"
        }
      ],
      "output": "Number",
      "colour": "#59C059",
      "inputsInline": true,
      "outputShape": 2 
    },
    {
      "type": "operator_divide",
      "message0": "%1 / %2",
      "args0": [
        {
          "type": "input_value",
          "name": "NUM1",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "NUM2",
          "check": "Number"
        }
      ],
      "output": "Number",
      "colour": "#59C059",
      "inputsInline": true,
      "outputShape": 2 
    },
    {
      "type": "operator_random",
      "message0": "pick random %1 to %2",
      "args0": [
        {
          "type": "input_value",
          "name": "FROM",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "TO",
          "check": "Number"
        }
      ],
      "output": "Number",
      "colour": "#59C059",
      "inputsInline": true,
      "outputShape": 2 
    },
    {
      "type": "operator_gt",
      "message0": "%1 > %2",
      "args0": [
        {
          "type": "input_value",
          "name": "OPERAND1"
        },
        {
          "type": "input_value",
          "name": "OPERAND2"
        }
      ],
      "output": "Boolean",
      "colour": "#59C059",
      "inputsInline": true,
      "outputShape": 1 // hexagon output
    },
    {
      "type": "operator_lt",
      "message0": "%1 < %2",
      "args0": [
        {
          "type": "input_value",
          "name": "OPERAND1"
        },
        {
          "type": "input_value",
          "name": "OPERAND2"
        }
      ],
      "output": "Boolean",
      "colour": "#59C059",
      "inputsInline": true,
      "outputShape": 1
    },
    {
      "type": "operator_equals",
      "message0": "%1 = %2",
      "args0": [
        {
          "type": "input_value",
          "name": "OPERAND1"
        },
        {
          "type": "input_value",
          "name": "OPERAND2"
        }
      ],
      "output": "Boolean",
      "colour": "#59C059",
      "inputsInline": true,
      "outputShape": 1
    },
    {
      "type": "operator_and",
      "message0": "%1 and %2",
      "args0": [
        {
          "type": "input_value",
          "name": "OPERAND1",
          "check": "Boolean"
        },
        {
          "type": "input_value",
          "name": "OPERAND2",
          "check": "Boolean"
        }
      ],
      "output": "Boolean",
      "colour": "#59C059",
      "inputsInline": true,
      "outputShape": 1
    },
    {
      "type": "operator_or",
      "message0": "%1 or %2",
      "args0": [
        {
          "type": "input_value",
          "name": "OPERAND1",
          "check": "Boolean"
        },
        {
          "type": "input_value",
          "name": "OPERAND2",
          "check": "Boolean"
        }
      ],
      "output": "Boolean",
      "colour": "#59C059",
      "inputsInline": true,
      "outputShape": 1
    },
    {
      "type": "operator_not",
      "message0": "not %1",
      "args0": [
        {
          "type": "input_value",
          "name": "OPERAND",
          "check": "Boolean"
        }
      ],
      "output": "Boolean",
      "colour": "#59C059",
      "outputShape": 1
    }
  ]);
}
