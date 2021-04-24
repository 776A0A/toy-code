export const modes = {
    adder: Symbol('ADD_MODE'),
    drawer: Symbol('DRAW_MODE'),
    editor: Symbol('EDIT_MODE'),
}

export class Switcher {
    constructor() {
        this.mode = modes.adder
    }
    get switchTo() {
        return {
            drawer: () => (this.mode = modes.drawer),
            adder: () => (this.mode = modes.adder),
            editor: () => (this.mode = modes.editor),
        }
    }
}
