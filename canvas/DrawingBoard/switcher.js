import * as events from './events.js'

export const modes = {
    adder: 'adder',
    editor: 'editor',
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
                this.stage.emit(events.END_EDIT)
            },
            editor: () => (this.mode = modes.editor),
        }
    }
}
