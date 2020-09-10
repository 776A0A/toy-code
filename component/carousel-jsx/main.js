import createElement from './createElement'
import Carousel from './Carousel'

const carousel = (
	<Carousel
		data={[
			'https://tse1-mm.cn.bing.net/th/id/OIP.z2Q5yDKbQakzgCcUrKBJkAHaJz?pid=Api&rs=1',
			'https://tse4-mm.cn.bing.net/th/id/OIP.ZFVnyvQrDwUFrKd4a55VFAHaJ4?pid=Api&rs=1',
			'https://tse4-mm.cn.bing.net/th/id/OIP.2Fxq5vDKSaEYuTXzKuw_gwHaJ4?pid=Api&rs=1',
			'https://tse1-mm.cn.bing.net/th/id/OIP.diD6kXAYPVQN1I3YviPYJgHaFj?pid=Api&rs=1',
			'https://ranking.xgoo.jp/tool/images/column/2020/01/0128_9.jpg'
		]}
	/>
)

carousel.mountTo(document.body)
