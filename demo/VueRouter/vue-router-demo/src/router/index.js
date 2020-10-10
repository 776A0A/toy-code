import Vue from 'vue'
import VueRouter from '../VueRouter'
import HelloWorld from '@/components/HelloWorld'

Vue.use(VueRouter)

const router = new VueRouter({
	routes: [
		{
			path: '/123',
			component: HelloWorld
		}
	]
})

export default router
