import Coordinate from './Coordinate'

class Pixel {
	constructor(image, data) {
		// Initial data
		this.coordinate = new Coordinate(data.x, data.y);
		this.value = data.value || 0; // 0 = unocuppied
		
		// Creat div and append
		this.$div = document.createElement("div");
		this.setInitialStyle(data.col, data.row)
	}
	
	setInitialStyle(image, data) {
		const bgX = image.width - this.col * data.size + 'px '
		const bgY = (this.row + 1) * data.size + 'px'

		Object.assign(this.$div.style, {
			width: `${data.size}px`,
			height: `${data.size}px`,
			border:  `1px solid #dddddd88`,
			left: this.col * data.size + 'px',
			bottom: this.row * data.size + 'px',
			position:  'absolute',

			// Background
			background: `url(${image.src})`,
			backgroundPosition: bgX + bgY,
			backgroundSize: `${image.widthH}px ${image.height}px`,
		})
	}
}

export default Pixel