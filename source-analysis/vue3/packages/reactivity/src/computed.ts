/* done */

import { effect, ReactiveEffect, trigger, track } from './effect'
import { TriggerOpTypes, TrackOpTypes } from './operations'
import { Ref } from './ref'
import { isFunction, NOOP } from '@vue/shared'
import { ReactiveFlags, toRaw } from './reactive'

export interface ComputedRef<T = any> extends WritableComputedRef<T> {
  readonly value: T
}

export interface WritableComputedRef<T> extends Ref<T> {
  readonly effect: ReactiveEffect<T>
}

export type ComputedGetter<T> = (ctx?: any) => T
export type ComputedSetter<T> = (v: T) => void

export interface WritableComputedOptions<T> {
  get: ComputedGetter<T>
  set: ComputedSetter<T>
}

class ComputedRefImpl<T> {
  private _value!: T
  private _dirty = true

  public readonly effect: ReactiveEffect<T>

  public readonly __v_isRef = true; // 这里标记为了ref
  public readonly [ReactiveFlags.IS_READONLY]: boolean

  constructor(
    getter: ComputedGetter<T>,
    private readonly _setter: ComputedSetter<T>,
    isReadonly: boolean
  ) {
    /**
     * 这里有个非常不同的点就是，当依赖的值改变时，不会直接触发reactiveEffect即这个的effect
     * 而是会触发scheduler，然后由scheduler来触发一个trigger
     * 该trigger又会触发依赖了该computedRef的reactiveEffect
     * 如果没有依赖于此的reactiveEffect，那么就相当于不会走下面获取value的逻辑
     * 也就相当于节省了执行资源
     */
    this.effect = effect(getter, {
      lazy: true, // 不会立即调用这个getter
      // scheduler的作用主要还是重置_dirty，并trigger其他依赖于this的地方
      scheduler: () => {
        if (!this._dirty) {
          this._dirty = true
          // 这里是触发如果有其他依赖了this，就会触发其他的更新，道理同下
          trigger(toRaw(this), TriggerOpTypes.SET, 'value')
        }
      }
    })

    // 当只提供了getter时就是只读
    this[ReactiveFlags.IS_READONLY] = isReadonly
  }

  get value() {
    /**
     * _dirty的意思是，该computedRef依赖的属性是否有发生过变化
     * 而一旦发生过改变，就会触发上面的scheduler，从而将_dirty变为true
     * 也就是说，如果依赖的属性没有改变过，那么就不会触发重新计算，从而达到了缓存的目的
     * 而不是每一次取value的都要重新计算
     */
    if (this._dirty) {
      /**
       * 执行了effect，这个activeEffect就会变成该effect
       * 另外因为这里执行了getter，所以也就触发了用到的reactive对象的getter
       * reactive对象的getter又会触发track，对effect进行收集
       * 当依赖属性改变时，就会触发上面的scheduler
       */
      this._value = this.effect()
      this._dirty = false
    }
    /**
     * 这里的track是为了对应如果有其他的属性依赖了这个计算属性返回的ref，也就是this
     * 所以如果没有其他对this依赖，那么此时的activeEffect就为undefined
     */
    track(toRaw(this), TrackOpTypes.GET, 'value')
    return this._value
  }

  set value(newValue: T) {
    this._setter(newValue)
  }
}

export function computed<T>(getter: ComputedGetter<T>): ComputedRef<T>
export function computed<T>(
  options: WritableComputedOptions<T>
): WritableComputedRef<T>
export function computed<T>(
  getterOrOptions: ComputedGetter<T> | WritableComputedOptions<T>
) {
  let getter: ComputedGetter<T>
  let setter: ComputedSetter<T>

  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions
    setter = __DEV__
      ? () => {
          console.warn('Write operation failed: computed value is readonly')
        }
      : NOOP
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }

  return new ComputedRefImpl(
    getter,
    setter,
    isFunction(getterOrOptions) || !getterOrOptions.set /* isReadonly */
  ) as any
}
