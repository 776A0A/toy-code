/* done */

import { TrackOpTypes, TriggerOpTypes } from './operations'
import { EMPTY_OBJ, isArray, isIntegerKey, isMap } from '@vue/shared'

// The main WeakMap that stores {target -> key -> dep} connections.
// Conceptually, it's easier to think of a dependency as a Dep class
// which maintains a Set of subscribers, but we simply store them as
// raw Sets to reduce memory overhead.
type Dep = Set<ReactiveEffect> // 使用一个set来存放，而不是用一个类来存放，这样能减少内存消耗
type KeyToDepMap = Map<any, Dep>
/**
 * key就是target，target就是对象
 * value就是一个map（valueMap）
 * valueMap的key是每一个属性，value是一个用于存放reactiveEffect的set集合
 */
const targetMap = new WeakMap<any, KeyToDepMap>()

export interface ReactiveEffect<T = any> {
  (): T
  _isEffect: true
  id: number
  active: boolean
  raw: () => T // 即传入effect的那个函数
  deps: Array<Dep> // 保存了该reactiveEffect的dep数组，没有去重，主要是为了方便后续的cleanup操作
  options: ReactiveEffectOptions
  allowRecurse: boolean
}

export interface ReactiveEffectOptions {
  /**
   *  是否是立即触发
   * 普通的effect调用会立即触发，而像computed的调用则不会，如果没有地方用到computedRef，那么就不会触发调用
   */
  lazy?: boolean
  scheduler?: (job: ReactiveEffect) => void // 更新computedRef的_dirty，并trigger
  onTrack?: (event: DebuggerEvent) => void
  onTrigger?: (event: DebuggerEvent) => void
  onStop?: () => void
  allowRecurse?: boolean
}

export type DebuggerEvent = {
  effect: ReactiveEffect
  target: object
  type: TrackOpTypes | TriggerOpTypes
  key: any
} & DebuggerEventExtraInfo

export interface DebuggerEventExtraInfo {
  newValue?: any
  oldValue?: any
  oldTarget?: Map<any, any> | Set<any>
}

const effectStack: ReactiveEffect[] = []
let activeEffect: ReactiveEffect | undefined // 依赖

// 需要遍历的方法，就会使用这个key，然后在这个key上存放effect，当调用遍历方法时就会触发这些effect
export const ITERATE_KEY = Symbol(__DEV__ ? 'iterate' : '')
export const MAP_KEY_ITERATE_KEY = Symbol(__DEV__ ? 'Map key iterate' : '')

export function isEffect(fn: any): fn is ReactiveEffect {
  return fn && fn._isEffect === true
}

export function effect<T = any>(
  fn: () => T,
  options: ReactiveEffectOptions = EMPTY_OBJ
): ReactiveEffect<T> {
  if (isEffect(fn)) {
    fn = fn.raw
  }
  // 对fn做包装
  const effect = createReactiveEffect(fn, options)
  // watchEffect
  if (!options.lazy) {
    effect()
  }
  return effect
}

// 这个就是watchEffect返回的stop
export function stop(effect: ReactiveEffect) {
  if (effect.active) {
    cleanup(effect)
    if (effect.options.onStop) {
      effect.options.onStop()
    }
    effect.active = false
  }
}

let uid = 0

function createReactiveEffect<T = any>(
  fn: () => T,
  options: ReactiveEffectOptions
): ReactiveEffect<T> {
  // 真正被执行的effect函数，当这个被调用，那么就会有activeEffect
  const effect = function reactiveEffect(): unknown {
    if (!effect.active) {
      return options.scheduler ? undefined : fn()
    }
    // 避免同一effect被推入effectStack中
    if (!effectStack.includes(effect)) {
      cleanup(effect)
      try {
        enableTracking()
        effectStack.push(effect)
        activeEffect = effect // 相当于是2.x中的Dep.target，更新当前正在执行的effect
        return fn() // 调用，调用的时候会触发getter，getter内部会收集activeEffect
      } finally {
        effectStack.pop() // fn执行完后立即pop
        resetTracking()
        activeEffect = effectStack[effectStack.length - 1]
      }
    }
  } as ReactiveEffect
  effect.id = uid++
  effect.allowRecurse = !!options.allowRecurse
  effect._isEffect = true
  effect.active = true // 用来标记是否要继续监听的，也就是如果调用了watchEffect返回的stop，则active为false
  effect.raw = fn
  /**
   * 用于保存保存了这个effect的依赖，每一个dep都是一个对象属性的dep
   * 该dep里面存放了effect，也就是依赖了该属性的effect
   */
  effect.deps = []
  effect.options = options
  return effect
}

function cleanup(effect: ReactiveEffect) {
  const { deps } = effect
  // 每一个dep都是包含了很多effect的set集合
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      // deps[i]是一个set
      deps[i].delete(effect)
    }
    deps.length = 0
  }
}

let shouldTrack = true // 用来标记是否应该track，在track内会进行判断
const trackStack: boolean[] = [] // QUE 作用是？

export function pauseTracking() {
  trackStack.push(shouldTrack)
  shouldTrack = false
}

export function enableTracking() {
  trackStack.push(shouldTrack)
  shouldTrack = true
}

// 重置追踪状态，重置为之前的一个状态
export function resetTracking() {
  const last = trackStack.pop()
  shouldTrack = last === undefined ? true : last
}

export function track(target: object, type: TrackOpTypes, key: unknown) {
  if (!shouldTrack || activeEffect === undefined) {
    return
  }
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    // 根据该对象来创建一个map
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    // 这个map对象又根据每个key来创建一个set
    depsMap.set(key, (dep = new Set()))
  }
  /**
   * 调用effect而触发的track实际不会只在初始阶段进行
   * 实际每次调用effect都会触发track
   * 在调用effect的时候，也就是在触发track之前，会有一个cleanup操作
   * 会将该effect从依赖中删除
   * 所以每次这里检查都会通过，然后再把effect重新加入依赖中
   */
  if (!dep.has(activeEffect)) {
    // 推入当前正活跃的effect函数，这个函数是经过包装的
    dep.add(activeEffect)
    // 这个effect函数又会保存下包含了该effect的依赖dep
    // 注意这里没有对推入的dep做去重
    activeEffect.deps.push(dep)
    // 如果调用watchEffect时传入了onTrackc来debugger
    if (__DEV__ && activeEffect.options.onTrack) {
      activeEffect.options.onTrack({
        effect: activeEffect,
        target,
        type,
        key
      })
    }
  }
}

export function trigger(
  target: object,
  type: TriggerOpTypes,
  key?: unknown,
  newValue?: unknown,
  oldValue?: unknown,
  oldTarget?: Map<unknown, unknown> | Set<unknown>
) {
  const depsMap = targetMap.get(target) // 该对象的deps，是一个map
  if (!depsMap) {
    // never been tracked
    return
  }

  const effects = new Set<ReactiveEffect>()
  // 添加effect到effects中
  const add = (effectsToAdd: Set<ReactiveEffect> | undefined) => {
    if (effectsToAdd) {
      effectsToAdd.forEach(effect => {
        if (effect !== activeEffect || effect.allowRecurse) {
          effects.add(effect)
        }
      })
    }
  }

  // 如果是清空的话，那么触发所有的effect
  if (type === TriggerOpTypes.CLEAR) {
    // collection being cleared
    // trigger all effects for target
    depsMap.forEach(add)
  } else if (key === 'length' && isArray(target)) {
    depsMap.forEach((dep, key) => {
      if (key === 'length' || key >= (newValue as number)) {
        add(dep)
      }
    })
  } else {
    // schedule runs for SET | ADD | DELETE
    if (key !== void 0) {
      add(depsMap.get(key)) // 获取所有该属性的依赖
    }

    // also run for iteration key on ADD | DELETE | Map.SET
    switch (type) {
      case TriggerOpTypes.ADD:
        if (!isArray(target)) {
          add(depsMap.get(ITERATE_KEY))
          if (isMap(target)) {
            add(depsMap.get(MAP_KEY_ITERATE_KEY))
          }
        } else if (isIntegerKey(key)) {
          // new index added to array -> length changes
          add(depsMap.get('length'))
        }
        break
      case TriggerOpTypes.DELETE:
        if (!isArray(target)) {
          add(depsMap.get(ITERATE_KEY))
          if (isMap(target)) {
            add(depsMap.get(MAP_KEY_ITERATE_KEY))
          }
        }
        break
      case TriggerOpTypes.SET:
        if (isMap(target)) {
          add(depsMap.get(ITERATE_KEY))
        }
        break
    }
  }

  const run = (effect: ReactiveEffect) => {
    // 如果传入了debugger用的onTrigger属性
    if (__DEV__ && effect.options.onTrigger) {
      effect.options.onTrigger({
        effect,
        target,
        key,
        type,
        newValue,
        oldValue,
        oldTarget
      })
    }
    /**
     * 使用computed的时候会传入scheduler，不直接触发effect，而是由scheduler来决定是是否触发
     * 更准确地说，是scheduler触发trigger，trigger触发依赖于computedRef的reactiveEffect
     * reactiveEffect又会取获取computedRef的value，在获取value的时候才触发effect来更新值
     */
    if (effect.options.scheduler) {
      effect.options.scheduler(effect)
    } else {
      effect()
    }
  }

  effects.forEach(run)
}
