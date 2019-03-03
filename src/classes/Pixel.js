class Pixel {
	constructor(data) {
		// Initial data
		this.col = data.col
		this.row = data.row
		this.value = data.value || 0
		
		// Creat div and append
		this.$div = document.createElement("div");
		this.setInitialStyle(data.col, data.row)
		BOARD.appendChild(this.$div)
	}
	
	setInitialStyle() {
		const bgX = IMAGE_WIDTH - this.col * PIXEL_SIZE + 'px '
		const bgY = (this.row + 1) * PIXEL_SIZE + 'px'

		Object.assign(this.$div.style, {
			width: `${PIXEL_SIZE}px`,
			height: `${PIXEL_SIZE}px`,
			border:  `1px solid #dddddd88`,
			left: this.col * PIXEL_SIZE + 'px',
			bottom: this.row * PIXEL_SIZE + 'px',
			position:  'absolute',

			// Background
			background: `url(${IMG_SRC})`,
			backgroundPosition: bgX + bgY,
			backgroundSize: `${IMAGE_WIDTH}px ${IMAGE_HEIGHT}px`,
		})
	}
}