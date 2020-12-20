import { inject } from 'vue'

export const storeKey = 'store'

export function useStore (key = null) {
  // 使用这个其实就是内部注入store
  return inject(key !== null ? key : storeKey)
}
