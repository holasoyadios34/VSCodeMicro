/*
  Name: Text utilities
  Description: A simple extension providing utilities for text analysis and keyboard input detection.
*/
(function(Scratch) {
  'use strict';
  
  if (!Scratch.extensions.unsandboxed) {
    throw new Error('Text utilities must run unsandboxed');
  }

  class TextUtilities {
    constructor() {
      this.lastAll = '';
      this.lastLetter = '';
      this.lastSymbol = '';
      this.lastSpecial = '';

      document.addEventListener('keydown', (e) => {
        this.lastAll = e.key;
        if (e.key.length === 1) {
          if (/[a-zA-Z]/.test(e.key)) {
            this.lastLetter = e.key;
          } else if (/[^a-zA-Z0-9\s]/.test(e.key)) {
            this.lastSymbol = e.key;
          }
        } else {
          this.lastSpecial = e.key;
        }
      });
    }

    getInfo() {
      return {
        id: 'textutilities',
        name: 'Text utilities',
        color1: '#4a90e2',
        blocks: [
          {
            opcode: 'linesOf',
            blockType: Scratch.BlockType.REPORTER,
            text: 'lines of [INPUT]',
            arguments: {
              INPUT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Hello\nWorld'
              }
            }
          },
          {
            opcode: 'charactersOf',
            blockType: Scratch.BlockType.REPORTER,
            text: 'characters of [INPUT] including [MODE]',
            arguments: {
              INPUT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Hello World'
              },
              MODE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'CHAR_MODES'
              }
            }
          },
          {
            opcode: 'containsType',
            blockType: Scratch.BlockType.BOOLEAN,
            text: '[INPUT] contains [TYPE]',
            arguments: {
              INPUT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Hello 123!'
              },
              TYPE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'CONTAINS_MODES'
              }
            }
          },
          {
            opcode: 'lastKeyPressed',
            blockType: Scratch.BlockType.REPORTER,
            text: 'last key pressed including [MODE]',
            arguments: {
              MODE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'KEY_MODES'
              }
            }
          }
        ],
        menus: {
          CHAR_MODES: {
            acceptReporters: true,
            items: ['all', 'exclude spaces']
          },
          CONTAINS_MODES: {
            acceptReporters: true,
            items: ['numbers', 'letters', 'special characters']
          },
          KEY_MODES: {
            acceptReporters: true,
            items: ['letters', 'all', 'symbols', 'special keys']
          }
        }
      };
    }

    linesOf(args) {
      return String(args.INPUT).split(/\r\n|\r|\n/).length;
    }

    charactersOf(args) {
      const text = String(args.INPUT);
      if (args.MODE === 'exclude spaces') {
        return text.replace(/\s/g, '').length;
      }
      return text.length;
    }

    containsType(args) {
      const text = String(args.INPUT);
      if (args.TYPE === 'numbers') {
        return /\d/.test(text);
      }
      if (args.TYPE === 'letters') {
        return /[a-zA-Z]/.test(text);
      }
      if (args.TYPE === 'special characters') {
        return /[^a-zA-Z0-9\s]/.test(text);
      }
      return false;
    }

    lastKeyPressed(args) {
      if (args.MODE === 'letters') return this.lastLetter;
      if (args.MODE === 'symbols') return this.lastSymbol;
      if (args.MODE === 'special keys') return this.lastSpecial;
      return this.lastAll;
    }
  }

  Scratch.extensions.register(new TextUtilities());
})(Scratch);
