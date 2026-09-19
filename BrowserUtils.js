/*
 * Name: Browser Utils
 * Description: Interact with native browser dialogs like alerts, prompts, confirms, and unsaved changes warnings.
 */

(function (Scratch) {
  'use strict';

  class BrowserUtils {
    constructor() {
      this.userInput = '';
      this.userChoice = false;
      this.unloadHandler = (e) => {
        e.preventDefault();
        e.returnValue = '';
      };
      this.warningEnabled = false;
    }

    getInfo() {
      return {
        id: 'browserutils',
        name: 'Browser Utils',
        color1: '#4C97FF',
        color2: '#3373CC',
        color3: '#3373CC',
        blocks: [
          {
            opcode: 'showAlert',
            blockType: Scratch.BlockType.COMMAND,
            text: 'say [TEXT]',
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Hello!'
              }
            }
          },
          {
            opcode: 'showPrompt',
            blockType: Scratch.BlockType.COMMAND,
            text: 'prompt [TEXT] and wait',
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'What is your name?'
              }
            }
          },
          {
            opcode: 'showConfirm',
            blockType: Scratch.BlockType.COMMAND,
            text: 'ask yes/no [TEXT] and wait',
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Is foobar yummy?'
              }
            }
          },
          {
            opcode: 'setUnloadWarning',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set unsaved changes warning to [STATE]',
            arguments: {
              STATE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'ON_OFF',
                defaultValue: 'ON'
              }
            }
          },
          '---',
          {
            opcode: 'getUserInput',
            blockType: Scratch.BlockType.REPORTER,
            text: 'user input'
          },
          {
            opcode: 'getUserChoice',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'user choice'
          }
        ],
        menus: {
          ON_OFF: {
            acceptReporters: true,
            items: ['ON', 'OFF']
          }
        }
      };
    }

    showAlert(args) {
      window.alert(args.TEXT);
    }

    showPrompt(args) {
      const result = window.prompt(args.TEXT);
      this.userInput = result !== null ? result : '';
    }

    showConfirm(args) {
      this.userChoice = window.confirm(args.TEXT);
    }

    setUnloadWarning(args) {
      const state = args.STATE === 'ON';
      if (state && !this.warningEnabled) {
        window.addEventListener('beforeunload', this.unloadHandler);
        this.warningEnabled = true;
      } else if (!state && this.warningEnabled) {
        window.removeEventListener('beforeunload', this.unloadHandler);
        this.warningEnabled = false;
      }
    }

    getUserInput() {
      return this.userInput;
    }

    getUserChoice() {
      return this.userChoice;
    }
  }

  Scratch.extensions.register(new BrowserUtils());
})(Scratch);
