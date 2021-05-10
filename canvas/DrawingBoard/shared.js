export const events = {
  REFRESH_SCREEN: Symbol('refresh-screen'),
  ADD_GRAPH: Symbol('add-graph'),
  END_EDIT: Symbol('end-edit'),
  SIZE_CHANGED: Symbol('size-changed'),
  REMOVED_FROM_PARENT: Symbol('removed-from-parent'),
  DELETE_GRAPH: Symbol('delete-graph'),
  CHANGE_CURSOR: Symbol('change-cursor'),
  EXPORT: Symbol('export'),
  IMPORT: Symbol('import'),
}

export const cursors = {
  default: 'default',
  crosshair: 'crosshair',
  grab: 'grab',
  grabbing: 'grabbing',
  move: 'move',
}
