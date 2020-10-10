let _Vue

export default class VueRouter {
	static install(Vue) {
		// 1. 避免重复装载
		if (VueRouter.install.installed) return
		VueRouter.install.installed = true
		// 2. 缓存Vue
		_Vue = Vue
		// 3. 在Vue实例中注册$router属性
		Vue.mixin({
			beforeCreate() {
				const router = this.$options.router
				if (router) {
					Vue.prototype.$router = router
					router.init()
				}
			}
		})
	}

	constructor(options) {
		this.options = options
		this.routeMap = {}
		this.data = _Vue.observable({
			current: location.pathname
		})
	}

	init() {
		this.createRouteMap()
		this.initComponents()
		this.initEvent()
	}

	createRouteMap() {
		const { routes } = this.options
		const routeMap = this.routeMap
		routes.forEach(route => (routeMap[route.path] = route.component))
	}

	initComponents() {
		_Vue.component('router-link', {
			props: { to: String },
			methods: {
				onClick(e) {
					e.preventDefault()
					history.pushState({}, '', this.to)
					this.$router.data.current = this.to
				}
			},
			render(h) {
				return h(
					'a',
					{ attrs: { href: this.to }, on: { click: this.onClick } },
					this.$slots.default
				)
			}
		})

		// 相当于一个占位符，根据当前路由拿到组件，然后传入h
		_Vue.component('router-view', {
			render: h => {
				const component = this.routeMap[this.data.current]
				return h(component)
			}
		})
	}

	initEvent() {
		window.addEventListener('popstate', e => {
			this.data.current = location.pathname
		})
	}
}
