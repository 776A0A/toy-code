export default file =>
	new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.readAsDataURL(file)
		reader.onload = e => resolve(e.target.result)
		reader.onerror = reader.onabort = reject
	})
