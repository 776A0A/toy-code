const REFRESH_SCREEN = Symbol('refresh-screen')
const ADD_GRAPH = Symbol('add-graph')
const END_EDIT = Symbol('end-edit')
const SIZE_CHANGED = Symbol('size-changed')
const REMOVED_FROM_PARENT = Symbol('removed-from-parent')
const DELETE_GRAPH = Symbol('delete-graph')
const CHANGE_CURSOR = Symbol('change-cursor')

export const events = {
    REFRESH_SCREEN,
    ADD_GRAPH,
    END_EDIT,
    SIZE_CHANGED,
    REMOVED_FROM_PARENT,
    DELETE_GRAPH,
    CHANGE_CURSOR,
}

export const cursors = {
    default: 'default',
    crosshair: 'crosshair',
    grab: 'grab',
    grabbing: 'grabbing',
    move: 'move',
}
