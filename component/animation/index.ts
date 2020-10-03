enum ANIMATION_STATE {
	INITIAL,
	START,
	STOP
}

class _Animation {
	private taskQueue: Array<object> = []
	private index: number = 0
	private state: ANIMATION_STATE = ANIMATION_STATE.INITIAL
}
