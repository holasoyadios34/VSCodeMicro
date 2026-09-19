//Name: HTML
//Description: Adds the hability of run your own HTML or JS code!
(function(Scratch) {
    'use strict';
    class HTMLExtension {
        constructor() {
            this.iframe = null;
            this.consoleArray = [];
            this.iframeX = 0;
            this.iframeY = 0;
            this.iframeW = 480;
            this.iframeH = 360;
            this.iframeBg = 0;
            this.iframeHidden = false;
            this.iframeInteractable = true;
            this.htmlContent = '';
            this._messageListener = this._messageListener.bind(this);
            window.addEventListener('message', this._messageListener);
        }
        _messageListener(e) {
            if (e.data && e.data.type === 'html_ext_console') {
                this.consoleArray.push(e.data.msg);
            }
        }
        updateStyle() {
            if (!this.iframe) return;
            this.iframe.style.position = 'absolute';
            this.iframe.style.left = `calc(50% + ${this.iframeX}px)`;
            this.iframe.style.top = `calc(50% - ${this.iframeY}px)`;
            this.iframe.style.transform = 'translate(-50%, -50%)';
            this.iframe.style.width = `${this.iframeW}px`;
            this.iframe.style.height = `${this.iframeH}px`;
            this.iframe.style.backgroundColor = `rgba(255, 255, 255, ${1 - (this.iframeBg / 100)})`;
            this.iframe.style.display = this.iframeHidden ? 'none' : 'block';
            this.iframe.style.pointerEvents = this.iframeInteractable ? 'auto' : 'none';
            this.iframe.style.border = 'none';
            this.iframe.style.zIndex = '99999';
        }
        getInfo() {
            return {
                id: 'html',
                name: 'HTML',
                blocks: [
                    {
                        opcode: 'runHtml',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Run html [CODE] in new [TARGET] with devtools [DEVTOOLS]',
                        arguments: {
                            CODE: { type: Scratch.ArgumentType.STRING, defaultValue: '<h1>Hello World</h1>' },
                            TARGET: { type: Scratch.ArgumentType.STRING, menu: 'targetMenu' },
                            DEVTOOLS: { type: Scratch.ArgumentType.STRING, menu: 'devtoolsMenu' }
                        }
                    },
                    {
                        opcode: 'runJs',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Run js [JSCODE] with data [JSON]',
                        arguments: {
                            JSCODE: { type: Scratch.ArgumentType.STRING, defaultValue: 'console.log(data);' },
                            JSON: { type: Scratch.ArgumentType.STRING, defaultValue: '{"test": 123}' }
                        }
                    },
                    {
                        opcode: 'closeIframe',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'close iframe'
                    },
                    {
                        opcode: 'hideIframe',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'hide iframe'
                    },
                    {
                        opcode: 'showIframe',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'show iframe'
                    },
                    {
                        opcode: 'setIframeXY',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set iframe x: [X] y: [Y]',
                        arguments: {
                            X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
                            Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
                        }
                    },
                    {
                        opcode: 'setIframeWH',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set iframe width: [W] height: [H]',
                        arguments: {
                            W: { type: Scratch.ArgumentType.NUMBER, defaultValue: 480 },
                            H: { type: Scratch.ArgumentType.NUMBER, defaultValue: 360 }
                        }
                    },
                    {
                        opcode: 'setIframeBg',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set iframe background transperency to [T] %',
                        arguments: {
                            T: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
                        }
                    },
                    {
                        opcode: 'toggleInteractable',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'toggle iframe to be [STATE]',
                        arguments: {
                            STATE: { type: Scratch.ArgumentType.STRING, menu: 'interactableMenu' }
                        }
                    },
                    {
                        opcode: 'getIframeProp',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'iframe [PROP]',
                        arguments: {
                            PROP: { type: Scratch.ArgumentType.STRING, menu: 'propMenu' }
                        }
                    },
                    {
                        opcode: 'isIframeState',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'is iframe [STATE] ?',
                        arguments: {
                            STATE: { type: Scratch.ArgumentType.STRING, menu: 'stateMenu' }
                        }
                    },
                    {
                        opcode: 'getConsole',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'console as array'
                    },
                    {
                        opcode: 'clearConsole',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'clear console'
                    },
                    {
                        opcode: 'isCodeType',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'is [CODE] an [TYPE] ?',
                        arguments: {
                            CODE: { type: Scratch.ArgumentType.STRING, defaultValue: '{}' },
                            TYPE: { type: Scratch.ArgumentType.STRING, menu: 'typeMenu' }
                        }
                    }
                ],
                menus: {
                    targetMenu: { acceptReporters: false, items: ['tab', 'window', 'HTML iframe'] },
                    devtoolsMenu: { acceptReporters: false, items: ['open', 'closed'] },
                    interactableMenu: { acceptReporters: false, items: ['interactable', 'noninteractable'] },
                    propMenu: { acceptReporters: false, items: ['html', 'x', 'y', 'width', 'height', 'bg transparency'] },
                    stateMenu: { acceptReporters: false, items: ['hidden', 'interactable'] },
                    typeMenu: { acceptReporters: false, items: ['html', 'js', 'ts', 'json'] }
                }
            };
        }
        runHtml(args) {
            const target = args.TARGET;
            this.htmlContent = args.CODE;
            const injectedCode = `<script>const _cl=console.log;console.log=function(...a){window.parent.postMessage({type:'html_ext_console',msg:a.join(' ')},'*');_cl.apply(console,a);};</script>` + this.htmlContent;
            if (target === 'HTML iframe') {
                if (!this.iframe) {
                    this.iframe = document.createElement('iframe');
                    document.body.appendChild(this.iframe);
                }
                this.iframe.srcdoc = injectedCode;
                this.updateStyle();
            } else if (target === 'tab' || target === 'window') {
                const blob = new Blob([this.htmlContent], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const features = target === 'window' ? 'width=800,height=600' : '';
                window.open(url, '_blank', features);
            }
        }
        runJs(args) {
            try {
                const data = JSON.parse(args.JSON || '{}');
                const func = new Function('data', args.JSCODE);
                func(data);
            } catch (e) {
            }
        }
        closeIframe() {
            if (this.iframe) {
                this.iframe.remove();
                this.iframe = null;
            }
        }
        hideIframe() {
            this.iframeHidden = true;
            this.updateStyle();
        }
        showIframe() {
            this.iframeHidden = false;
            this.updateStyle();
        }
        setIframeXY(args) {
            this.iframeX = Scratch.Cast.toNumber(args.X);
            this.iframeY = Scratch.Cast.toNumber(args.Y);
            this.updateStyle();
        }
        setIframeWH(args) {
            this.iframeW = Scratch.Cast.toNumber(args.W);
            this.iframeH = Scratch.Cast.toNumber(args.H);
            this.updateStyle();
        }
        setIframeBg(args) {
            this.iframeBg = Scratch.Cast.toNumber(args.T);
            this.updateStyle();
        }
        toggleInteractable(args) {
            this.iframeInteractable = (args.STATE === 'interactable');
            this.updateStyle();
        }
        getIframeProp(args) {
            const prop = args.PROP;
            if (prop === 'html') return this.htmlContent;
            if (prop === 'x') return this.iframeX;
            if (prop === 'y') return this.iframeY;
            if (prop === 'width') return this.iframeW;
            if (prop === 'height') return this.iframeH;
            if (prop === 'bg transparency') return this.iframeBg;
            return '';
        }
        isIframeState(args) {
            const state = args.STATE;
            if (state === 'hidden') return this.iframeHidden;
            if (state === 'interactable') return this.iframeInteractable;
            return false;
        }
        getConsole() {
            return JSON.stringify(this.consoleArray);
        }
        clearConsole() {
            this.consoleArray = [];
        }
        isCodeType(args) {
            const code = args.CODE;
            const type = args.TYPE;
            if (type === 'json') {
                try {
                    JSON.parse(code);
                    return true;
                } catch (e) {
                    return false;
                }
            }
            if (type === 'html') {
                return /<\/?[a-z][\s\S]*>/i.test(code);
            }
            if (type === 'js' || type === 'ts') {
                try {
                    new Function(code);
                    return true;
                } catch (e) {
                    return false;
                }
            }
            return false;
        }
    }
    Scratch.extensions.register(new HTMLExtension());
})(Scratch);
