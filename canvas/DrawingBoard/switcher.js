export const modes = {
    addMode: Symbol('ADD_MODE'),
    drawMode: Symbol('DRAW_MODE'),
    editMode: Symbol('EDIT_MODE'),
}

export class Switcher {
    constructor() {
        this.mode = modes.addMode
    }
    get switchTo() {
        return {
            drawer: () => (this.mode = modes.drawMode),
            adder: () => (this.mode = modes.addMode),
            editor: () => (this.mode = modes.editMode),
        }
    }
}
