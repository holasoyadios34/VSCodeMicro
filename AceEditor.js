/* Ace Editor Extension for PenguinMod with Autocomplete, Error Detection, Full Syntax & Responsive Scaling */
(function (Scratch) {
  'use strict';

  let aceLoaded = false;
  let editor = null;
  let container = null;
  let currentSyntax = 'plain txt';
  let codeChanged = false;

  let editorX = 0;
  let editorY = 0;
  let editorW = 300;
  let editorH = 200;
  let animFrameId = null;

  function loadScript(url) {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = resolve;
      document.head.appendChild(script);
    });
  }

  async function loadAceLibrary() {
    if (window.ace && window.ace.require('ace/ext/language_tools')) {
      aceLoaded = true;
      return;
    }
    if (!window.ace) {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.7/ace.js');
    }
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.7/ext-language_tools.js');
    aceLoaded = true;
  }

  function updateLayout() {
    if (!container) return;

    const canvas = Scratch.renderer ? Scratch.renderer.canvas : document.querySelector('canvas');
    if (!canvas || !container.parentElement) return;

    const stageWidth = (Scratch.vm && Scratch.vm.runtime && Scratch.vm.runtime.stageWidth) || 480;
    const stageHeight = (Scratch.vm && Scratch.vm.runtime && Scratch.vm.runtime.stageHeight) || 360;

    const rect = canvas.getBoundingClientRect();
    const parentRect = container.parentElement.getBoundingClientRect();

    const scaleX = rect.width / stageWidth;
    const scaleY = rect.height / stageHeight;

    const canvasLeft = rect.left - parentRect.left;
    const canvasTop = rect.top - parentRect.top;

    const left = canvasLeft + (stageWidth / 2 + editorX - editorW / 2) * scaleX;
    const top = canvasTop + (stageHeight / 2 - editorY - editorH / 2) * scaleY;
    const w = editorW * scaleX;
    const h = editorH * scaleY;

    container.style.left = `${left}px`;
    container.style.top = `${top}px`;
    container.style.width = `${w}px`;
    container.style.height = `${h}px`;

    if (editor) {
      editor.setFontSize(`${Math.max(8, 12 * scaleY)}px`);
      editor.resize();
    }
  }

  function startSyncLoop() {
    if (animFrameId) return;
    const loop = () => {
      updateLayout();
      animFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  function stopSyncLoop() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  class AceEditorExtension {
    getInfo() {
      return {
        id: 'aceEditor',
        name: 'Ace Editor',
        color1: '#2572b4',
        color2: '#1e5b90',
        blocks: [
          {
            opcode: 'embedEditor',
            blockType: Scratch.BlockType.COMMAND,
            text: 'embed Ace editor in the stage'
          },
          {
            opcode: 'setPos',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set editor x: [X] y: [Y]',
            arguments: {
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          },
          {
            opcode: 'setSize',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set editor width: [W] height: [H]',
            arguments: {
              W: { type: Scratch.ArgumentType.NUMBER, defaultValue: 300 },
              H: { type: Scratch.ArgumentType.NUMBER, defaultValue: 200 }
            }
          },
          {
            opcode: 'setThemeMode',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set editor in [MODE] mode',
            arguments: {
              MODE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'themeModeMenu',
                defaultValue: 'dark'
              }
            }
          },
          {
            opcode: 'hideEditor',
            blockType: Scratch.BlockType.COMMAND,
            text: 'hide editor'
          },
          {
            opcode: 'showEditor',
            blockType: Scratch.BlockType.COMMAND,
            text: 'show editor'
          },
          {
            opcode: 'closeEditor',
            blockType: Scratch.BlockType.COMMAND,
            text: 'close editor'
          },
          {
            opcode: 'setSyntax',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set type syntax to [SYNTAX]',
            arguments: {
              SYNTAX: {
                type: Scratch.ArgumentType.STRING,
                menu: 'syntaxMenu',
                defaultValue: 'javascript'
              }
            }
          },
          {
            opcode: 'autodetectSyntax',
            blockType: Scratch.BlockType.COMMAND,
            text: 'autodetect syntax'
          },
          {
            opcode: 'setAutocomplete',
            blockType: Scratch.BlockType.COMMAND,
            text: '[STATE] autocomplete',
            arguments: {
              STATE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'stateMenu',
                defaultValue: 'enable'
              }
            }
          },
          {
            opcode: 'setCode',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set editor code to [CODE]',
            arguments: {
              CODE: { type: Scratch.ArgumentType.STRING, defaultValue: 'console.log("Hello World!");' }
            }
          },
          {
            opcode: 'getCode',
            blockType: Scratch.BlockType.REPORTER,
            text: 'code written in editor'
          },
          {
            opcode: 'getSyntax',
            blockType: Scratch.BlockType.REPORTER,
            text: 'type syntax'
          },
          {
            opcode: 'getErrorsAndWarnings',
            blockType: Scratch.BlockType.REPORTER,
            text: 'get errors and warnings in code as array'
          },
          {
            opcode: 'hasErrorsOrWarnings',
            blockType: Scratch.BlockType.BOOLEAN,
            text: '[TYPE] in code?',
            arguments: {
              TYPE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'errorWarningMenu',
                defaultValue: 'errors'
              }
            }
          },
          {
            opcode: 'whenCodeChanges',
            blockType: Scratch.BlockType.HAT,
            text: 'when the editor code changes',
            isEdgeActivated: false
          }
        ],
        menus: {
          syntaxMenu: {
            acceptReporters: true,
            items: [
              'javascript', 'html', 'typescript', 'json', 'array', 'plain txt',
              'lua', 'c#', 'c++', 'c', 'go', 'ruby', 'css', 'php', 'xml', 'markdown', 'python'
            ]
          },
          themeModeMenu: {
            acceptReporters: true,
            items: ['light', 'dark']
          },
          stateMenu: {
            acceptReporters: true,
            items: ['enable', 'disable']
          },
          errorWarningMenu: {
            acceptReporters: true,
            items: ['errors', 'warnings', 'errors or warnings']
          }
        }
      };
    }

    async embedEditor() {
      if (container) return;
      await loadAceLibrary();

      const stage = Scratch.renderer ? Scratch.renderer.canvas.parentElement : document.body;
      container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.zIndex = '100';

      stage.appendChild(container);

      editor = window.ace.edit(container);
      
      window.ace.require('ace/ext/language_tools');
      
      editor.setTheme('ace/theme/monokai');
      editor.session.setMode('ace/mode/javascript');
      currentSyntax = 'javascript';

      editor.on('change', () => {
        codeChanged = true;
      });

      startSyncLoop();
    }

    setPos(args) {
      editorX = Number(args.X) || 0;
      editorY = Number(args.Y) || 0;
      updateLayout();
    }

    setSize(args) {
      editorW = Math.max(10, Number(args.W) || 300);
      editorH = Math.max(10, Number(args.H) || 200);
      updateLayout();
    }

    setThemeMode(args) {
      if (!editor) return;
      const mode = String(args.MODE).toLowerCase();
      if (mode === 'light') {
        editor.setTheme('ace/theme/textmate');
      } else {
        editor.setTheme('ace/theme/monokai');
      }
    }

    hideEditor() {
      if (container) container.style.display = 'none';
    }

    showEditor() {
      if (container) container.style.display = 'block';
    }

    closeEditor() {
      stopSyncLoop();
      if (editor) {
        editor.destroy();
        editor = null;
      }
      if (container) {
        container.remove();
        container = null;
      }
    }

    setSyntax(args) {
      if (!editor) return;
      const syntax = String(args.SYNTAX).toLowerCase();
      let mode = 'text';

      if (syntax === 'javascript') mode = 'javascript';
      else if (syntax === 'html') mode = 'html';
      else if (syntax === 'typescript') mode = 'typescript';
      else if (syntax === 'json' || syntax === 'array') mode = 'json';
      else if (syntax === 'lua') mode = 'lua';
      else if (syntax === 'c#') mode = 'csharp';
      else if (syntax === 'c++' || syntax === 'c') mode = 'c_cpp';
      else if (syntax === 'go') mode = 'golang';
      else if (syntax === 'ruby') mode = 'ruby';
      else if (syntax === 'css') mode = 'css';
      else if (syntax === 'php') mode = 'php';
      else if (syntax === 'xml') mode = 'xml';
      else if (syntax === 'markdown') mode = 'markdown';
      else if (syntax === 'python') mode = 'python';
      else if (syntax === 'plain txt') mode = 'text';

      editor.session.setMode(`ace/mode/${mode}`);
      currentSyntax = args.SYNTAX;
    }

    autodetectSyntax() {
      if (!editor) return;
      const code = editor.getValue().trim();
      let detected = 'plain txt';

      if (code.startsWith('<') && code.endsWith('>')) {
        if (code.toLowerCase().includes('<?php')) detected = 'php';
        else if (code.toLowerCase().includes('<?xml')) detected = 'xml';
        else detected = 'html';
      } else if (code.startsWith('[') && code.endsWith(']')) {
        detected = 'array';
      } else if (code.startsWith('{') && code.endsWith('}')) {
        if (code.includes(':') && code.includes('"')) detected = 'json';
        else detected = 'css';
      } else if (code.includes('def ') || code.includes('import ') && code.includes(':')) {
        detected = 'python';
      } else if (code.includes('function') || code.includes('const') || code.includes('let') || code.includes('var') || code.includes('=>')) {
        detected = 'javascript';
      } else if (code.includes('#include')) {
        detected = 'c++';
      } else if (code.includes('using System;')) {
        detected = 'c#';
      } else if (code.includes('local ')) {
        detected = 'lua';
      }

      this.setSyntax({ SYNTAX: detected });
    }

    setAutocomplete(args) {
      if (!editor) return;
      const isEnabled = String(args.STATE).toLowerCase() === 'enable';
      editor.setOptions({
        enableBasicAutocompletion: isEnabled,
        enableLiveAutocompletion: isEnabled
      });
    }

    setCode(args) {
      if (!editor) return;
      editor.setValue(String(args.CODE), -1);
    }

    getCode() {
      if (!editor) return '';
      return editor.getValue();
    }

    getSyntax() {
      return currentSyntax;
    }

    getErrorsAndWarnings() {
      if (!editor) return '[]';
      const annotations = editor.getSession().getAnnotations() || [];
      return JSON.stringify(annotations);
    }

    hasErrorsOrWarnings(args) {
      if (!editor) return false;
      const annotations = editor.getSession().getAnnotations() || [];
      const type = String(args.TYPE).toLowerCase();

      if (type === 'errors') {
        return annotations.some((a) => a.type === 'error');
      } else if (type === 'warnings') {
        return annotations.some((a) => a.type === 'warning');
      } else if (type === 'errors or warnings') {
        return annotations.some((a) => a.type === 'error' || a.type === 'warning');
      }
      return false;
    }

    whenCodeChanges() {
      if (codeChanged) {
        codeChanged = false;
        return true;
      }
      return false;
    }
  }

  Scratch.extensions.register(new AceEditorExtension());
})(Scratch);
