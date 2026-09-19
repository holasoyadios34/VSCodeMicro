// Name: Python
// Description: Essential Python integration for PenguinMod

class PythonExtension {
    constructor(runtime) {
        this.runtime = runtime;
        this.consoleOutput = [];
        this.printBuffer = "";
        this.skulptLoaded = false;
        this.inputQueue = [];
        this.resolveInput = null;
        this.loadSkulpt();
    }

    loadSkulpt() {
        if (window.Sk) {
            this.skulptLoaded = true;
            return;
        }
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js";
        script.onload = () => {
            const stdlib = document.createElement('script');
            stdlib.src = "https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js";
            stdlib.onload = () => { this.skulptLoaded = true; };
            document.head.appendChild(stdlib);
        };
        document.head.appendChild(script);
    }

    getInfo() {
        return {
            id: 'pythonExt',
            name: 'Python',
            color1: '#3572A5',
            color2: '#2b5b84',
            blocks: [
                {
                    opcode: 'runCode',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'run [CODE]',
                    arguments: {
                        CODE: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'name = input("Name: ")\nprint("Hi " + name)'
                        }
                    }
                },
                {
                    opcode: 'sendInput',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'send to program [TEXT]',
                    arguments: {
                        TEXT: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'Penguin'
                        }
                    }
                },
                {
                    opcode: 'isWaiting',
                    blockType: Scratch.BlockType.BOOLEAN,
                    text: 'is waiting for input?'
                },
                {
                    opcode: 'consoleAsArray',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'console as array'
                },
                {
                    opcode: 'clearConsole',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'clear console'
                },
                {
                    opcode: 'evalCode',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'evaluate [CODE]',
                    arguments: {
                        CODE: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '2 + 2'
                        }
                    }
                }
            ]
        };
    }

    _handleOutput(text) {
        this.printBuffer += text;
        let lines = this.printBuffer.split('\n');
        this.printBuffer = lines.pop(); 
        for (let line of lines) {
            this.consoleOutput.push(line);
        }
    }

    _flushOutput() {
        if (this.printBuffer.length > 0) {
            this.consoleOutput.push(this.printBuffer);
            this.printBuffer = "";
        }
    }

    runCode(args) {
        if (!this.skulptLoaded) return;
        
        this.inputQueue = [];
        this.resolveInput = null;

        Sk.configure({
            output: (text) => this._handleOutput(text),
            read: (x) => {
                if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) {
                    throw "File not found: '" + x + "'";
                }
                return Sk.builtinFiles["files"][x];
            },
            inputfun: (prompt) => {
                return new Promise((resolve) => {
                    if (prompt) {
                        this._handleOutput(prompt);
                        this._flushOutput();
                    }
                    if (this.inputQueue.length > 0) {
                        resolve(this.inputQueue.shift());
                    } else {
                        this.resolveInput = resolve;
                    }
                });
            }
        });
        
        try {
            return Sk.misceval.asyncToPromise(() => {
                return Sk.importMainWithBody("<stdin>", false, args.CODE, true);
            }).then(() => {
                this._flushOutput();
                this.resolveInput = null;
            }).catch((e) => {
                this._flushOutput();
                this.consoleOutput.push(e.toString());
                this.resolveInput = null;
            });
        } catch (e) {
            this.consoleOutput.push(e.toString());
            this.resolveInput = null;
        }
    }

    sendInput(args) {
        const text = String(args.TEXT);
        if (this.resolveInput) {
            this.resolveInput(text);
            this.resolveInput = null;
        } else {
            this.inputQueue.push(text);
        }
    }

    isWaiting() {
        return this.resolveInput !== null;
    }

    consoleAsArray() {
        return JSON.stringify(this.consoleOutput);
    }

    clearConsole() {
        this.consoleOutput = [];
        this.printBuffer = "";
        this.inputQueue = [];
        this.resolveInput = null;
    }

    evalCode(args) {
        if (!this.skulptLoaded) return "";
        Sk.configure({
            output: () => {},
            read: (x) => {
                if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) {
                    throw "File not found: '" + x + "'";
                }
                return Sk.builtinFiles["files"][x];
            }
        });

        const evalLogic = `__ans__ = ${args.CODE}`;
        
        try {
            return Sk.misceval.asyncToPromise(() => {
                return Sk.importMainWithBody("<stdin>", false, evalLogic, true);
            }).then(() => {
                return Sk.globals["__ans__"] ? Sk.globals["__ans__"].v : "";
            }).catch((e) => {
                return "Error: " + e.toString();
            });
        } catch (e) {
            return "Error: " + e.toString();
        }
    }
}

Scratch.extensions.register(new PythonExtension());
