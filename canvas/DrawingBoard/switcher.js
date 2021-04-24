export const modes = {
    adder: Symbol('ADD_MODE'),
    editor: Symbol('EDIT_MODE'),
}

export class Switcher {
    constructor(stage) {
        this.stage = stage
        this.mode = modes.adder
    }
    get switchTo() {
        return {
            adder: () => {
                this.mode = modes.adder
                this.stage.emitter.emit('end-edit')
            },
            editor: () => (this.mode = modes.editor),
        }
    }
}
