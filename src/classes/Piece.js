import  { getRandomColor } from '../utils/utils'

class Piece {
	constructor(data) {

		// Type checking
		if (!data.shape) throw new Error('Tetrisify: shape parameter is missing')
		if (!data.pixelSize) throw new Error('Tetrisify: pixelSize parameter is missing')

		// Initial datas
		this.name = data.name
		this.shape = data.shape;
		this.pixelSize = data.pixelSize;
		this.coordinates = { x: -1000, y: -1000 };
		
		// Create div and add css
		this.$div = document.createElement("div");
		this.setInitialStyle()
	}
	
	setInitialStyle() {
		let width = this.shape[0].length;
		let height = this.shape.length;

		Object.assign(this.$div.style, {
			width: width * this.pixelSize + 'px',
			height: height * this.pixelSize + 'px',
			left: this.coordinates.x * this.pixelSize,
			bottom: this.coordinates.y * this.pixelSize,
			position:  'absolute',

			// Background
			background: getRandomColor(),
		})
	}

	setCoordinates(x,y) {
		this.coordinates.x = x,
		this.coordinates.y = y;
		this.$div.style.left = x * this.pixelSize + 'px';
		this.$div.style.bottom = y * this.pixelSize + 'px';
	}

}

export default Piece