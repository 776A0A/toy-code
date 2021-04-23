export const isSupportWebp = (() => {
    let isSupport = true,
        invoked = false
    return () => {
        if (invoked) return isSupport
        let canvas = document.createElement('canvas')
        const dataURL = canvas.toDataURL('image/webp', 0.5)
        canvas = null
        return (
            (invoked = true), (isSupport = dataURL.includes('data:image/webp'))
        )
    }
})()
