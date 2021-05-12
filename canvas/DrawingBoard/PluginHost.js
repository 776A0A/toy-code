import { Plugin } from './Plugin.js'

export class PluginHost extends Plugin {
  plugins = new Set()
  use(plugin) {
    if (this.plugins.has(plugin)) return this

    this.plugins.add(plugin)
    plugin.install(this)

    return this
  }
}
