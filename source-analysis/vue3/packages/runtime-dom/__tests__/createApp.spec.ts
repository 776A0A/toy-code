import { createApp } from '../src'

test('basic', () => {
  const app = createApp({ props: { id: String }, setup() {} }, { id: 1 })
  const div = document.createElement('div')
  app.mount(div)
  expect(app._props!.id).toBe(1)
})
