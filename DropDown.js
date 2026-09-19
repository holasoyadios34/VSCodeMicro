/*
Name: Dropdown Menus
Description: Create and manage custom dropdown menus
*/
(function(Scratch) {
    class DropdownMenus {
        constructor() {
            this.dropdowns = {};
            this.container = document.createElement('div');
            this.container.style.position = 'absolute';
            this.container.style.top = '0';
            this.container.style.left = '0';
            this.container.style.width = '100%';
            this.container.style.height = '100%';
            this.container.style.pointerEvents = 'none';
            this.container.style.overflow = 'hidden';
            this.container.style.zIndex = '999999';

            this.resizeObserver = new ResizeObserver(() => {
                for (const id in this.dropdowns) {
                    const menu = this.dropdowns[id];
                    if (menu.x !== undefined && menu.y !== undefined) {
                        this.setPos({ ID: id, X: menu.x, Y: menu.y }, null);
                    }
                }
            });
        }

        _ensureContainer() {
            if (Scratch.renderer && Scratch.renderer.canvas) {
                const parent = Scratch.renderer.canvas.parentElement;
                if (parent && this.container.parentElement !== parent) {
                    parent.appendChild(this.container);
                    this.resizeObserver.observe(parent);
                }
            }
        }

        getInfo() {
            return {
                id: 'dropdownmenus',
                name: 'Dropdown Menus',
                color1: '#4a90e2',
                color2: '#3b73b5',
                color3: '#2d588a',
                blocks: [
                    {
                        opcode: 'resetEverything',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'reset everything',
                        arguments: {}
                    },
                    {
                        opcode: 'createMenu',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'create a new dropdown menu with id [ID]',
                        arguments: {
                            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'menu1' }
                        }
                    },
                    {
                        opcode: 'showHide',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '[ACTION] dropdown menu with id [ID]',
                        arguments: {
                            ACTION: { type: Scratch.ArgumentType.STRING, menu: 'actions' },
                            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'menu1' }
                        }
                    },
                    {
                        opcode: 'getIDs',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'current dropmenus ids as array',
                        arguments: {}
                    },
                    {
                        opcode: 'setPos',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set dropmenu with id [ID] at x: [X] y: [Y]',
                        arguments: {
                            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'menu1' },
                            X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
                            Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
                        }
                    },
                    {
                        opcode: 'setPlaceholder',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set dropmenu text placeholder with id [ID] to [TEXT]',
                        arguments: {
                            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'menu1' },
                            TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'Select option...' }
                        }
                    },
                    {
                        opcode: 'addOptions',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'add options as array [OPTIONS] to dropmenu with id [ID]',
                        arguments: {
                            OPTIONS: { type: Scratch.ArgumentType.STRING, defaultValue: '["Option 1", "Option 2"]' },
                            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'menu1' }
                        }
                    },
                    {
                        opcode: 'getOptions',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'options in dropmenu with id [ID]',
                        arguments: {
                            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'menu1' }
                        }
                    },
                    {
                        opcode: 'whenClicked',
                        blockType: Scratch.BlockType.HAT,
                        text: 'when option [OPTION] clicked in dropmenu with id [ID]',
                        isEdgeActivated: false,
                        arguments: {
                            OPTION: { type: Scratch.ArgumentType.STRING, defaultValue: 'Option 1' },
                            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'menu1' }
                        }
                    },
                    {
                        opcode: 'getLastSelected',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'last option selected in dropmenu with id [ID]',
                        arguments: {
                            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'menu1' }
                        }
                    },
                    {
                        opcode: 'setBgColor',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set dropmenu color with id [ID] to [COLOR]',
                        arguments: {
                            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'menu1' },
                            COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: '#ffffff' }
                        }
                    },
                    {
                        opcode: 'setTextColor',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set dropmenu text color with id [ID] to [COLOR]',
                        arguments: {
                            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'menu1' },
                            COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: '#000000' }
                        }
                    }
                ],
                menus: {
                    actions: {
                        acceptReporters: false,
                        items: ['show', 'hide']
                    }
                }
            };
        }

        resetEverything(args, util) {
            for (const id in this.dropdowns) {
                this.dropdowns[id].element.remove();
            }
            this.dropdowns = {};
        }

        createMenu(args, util) {
            this._ensureContainer();
            const id = args.ID;
            if (this.dropdowns[id]) return;
            
            const select = document.createElement('select');
            select.style.position = 'absolute';
            select.style.pointerEvents = 'auto';
            select.style.display = 'block';
            select.style.padding = '6px 12px';
            select.style.fontSize = '14px';
            select.style.fontFamily = 'sans-serif';
            select.style.borderRadius = '6px';
            select.style.outline = 'none';
            select.style.boxSizing = 'border-box';
            
            select.addEventListener('change', () => {
                this.dropdowns[id].lastSelected = select.value;
                Scratch.vm.runtime.startHats('dropdownmenus_whenClicked', {
                    ID: id,
                    OPTION: select.value
                });
            });
            
            this.container.appendChild(select);
            this.dropdowns[id] = { element: select, lastSelected: '', x: 0, y: 0 };
            this.setPos({ ID: id, X: 0, Y: 0 }, null);
        }

        showHide(args, util) {
            this._ensureContainer();
            const id = args.ID;
            if (!this.dropdowns[id]) return;
            this.dropdowns[id].element.style.display = args.ACTION === 'show' ? 'block' : 'none';
        }

        getIDs(args, util) {
            return JSON.stringify(Object.keys(this.dropdowns));
        }

        setPos(args, util) {
            this._ensureContainer();
            const id = args.ID;
            if (!this.dropdowns[id]) return;
            
            this.dropdowns[id].x = args.X;
            this.dropdowns[id].y = args.Y;

            const stageWidth = this.container.clientWidth || 480;
            const stageHeight = this.container.clientHeight || 360;

            const xPx = (stageWidth / 2) + (args.X / 240) * (stageWidth / 2);
            const yPx = (stageHeight / 2) - (args.Y / 180) * (stageHeight / 2);

            const select = this.dropdowns[id].element;
            select.style.left = xPx + 'px';
            select.style.top = yPx + 'px';
            select.style.transform = 'translate(-50%, -50%)';
        }

        setPlaceholder(args, util) {
            this._ensureContainer();
            const id = args.ID;
            if (!this.dropdowns[id]) return;
            const select = this.dropdowns[id].element;
            
            let placeholder = select.querySelector('.pm-placeholder');
            if (!placeholder) {
                placeholder = document.createElement('option');
                placeholder.className = 'pm-placeholder';
                placeholder.disabled = true;
                placeholder.selected = true;
                placeholder.value = '';
                select.insertBefore(placeholder, select.firstChild);
            }
            placeholder.text = args.TEXT;
            select.value = '';
            this.dropdowns[id].lastSelected = '';
        }

        addOptions(args, util) {
            this._ensureContainer();
            const id = args.ID;
            if (!this.dropdowns[id]) return;
            const select = this.dropdowns[id].element;
            
            try {
                const options = JSON.parse(args.OPTIONS);
                if (Array.isArray(options)) {
                    options.forEach(opt => {
                        const option = document.createElement('option');
                        option.value = opt;
                        option.text = opt;
                        select.appendChild(option);
                    });
                }
            } catch (e) {
                const option = document.createElement('option');
                option.value = args.OPTIONS;
                option.text = args.OPTIONS;
                select.appendChild(option);
            }
        }

        getOptions(args, util) {
            const id = args.ID;
            if (!this.dropdowns[id]) return '[]';
            const select = this.dropdowns[id].element;
            const opts = Array.from(select.options)
                .filter(o => !o.classList.contains('pm-placeholder'))
                .map(o => o.value);
            return JSON.stringify(opts);
        }

        whenClicked(args, util) {
            const id = args.ID;
            if (!this.dropdowns[id]) return false;
            return this.dropdowns[id].lastSelected === args.OPTION;
        }

        getLastSelected(args, util) {
            const id = args.ID;
            if (!this.dropdowns[id]) return '';
            return this.dropdowns[id].element.value;
        }

        setBgColor(args, util) {
            this._ensureContainer();
            const id = args.ID;
            if (!this.dropdowns[id]) return;
            this.dropdowns[id].element.style.backgroundColor = args.COLOR;
        }

        setTextColor(args, util) {
            this._ensureContainer();
            const id = args.ID;
            if (!this.dropdowns[id]) return;
            this.dropdowns[id].element.style.color = args.COLOR;
        }
    }

    Scratch.extensions.register(new DropdownMenus());
})(Scratch);
