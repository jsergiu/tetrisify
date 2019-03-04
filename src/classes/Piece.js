import Coordinate from './Coordinate';
import Pixel from './Pixel';
import ImagePixel from './ImagePixel';

class Piece {
	constructor(data) {

		// Type checking
		if (!data.shape) throw new Error('Tetrisify: shape parameter is missing')
		if (!data.pixelSize) throw new Error('Tetrisify: pixelSize parameter is missing')
		if (!data.image) throw new Error('Tetrisify: image parameter is missing')

		// Initial datas
		this.name = data.name 				// Optional name of the piece
		this.shape = data.shape; 			// One of the items from the shapes file
		this.pixelSize = data.pixelSize; 	// Calculated form puzzle resolution (no of columns)
		this.image = data.image; 			// Object with attributes of the image that is animated

		// Coordinates used for the falling animation
		this.currentCoordinates = new Coordinate(-1000, -1000);

		// Final coordinates when the pice is in place
		this.finalCoordinates = new Coordinate(-1000, -1000);
		
		// States: [Idle, Falling, Done]
		this.state = 'Idle';
		
		// Create div and add css
		this.$div = document.createElement("div");
		this.$div.setAttribute('class', 'Tetrisify-piece');
		this.setInitialStyle()
	}
	
	setInitialStyle() {
		let width = this.shape[0].length;
		let height = this.shape.length;

		Object.assign(this.$div.style, {
			width: width * this.pixelSize + 'px',
			height: height * this.pixelSize + 'px',
		})
	}

	setCurrentCoordinates(x,y) {
		this.currentCoordinates.setX(x);
		this.currentCoordinates.setY(y);
		this.$div.style.left = x * this.pixelSize + 'px';
		this.$div.style.bottom = y * this.pixelSize + 'px';
	}

	setFinalCoordinates(x,y) {
		this.finalCoordinates.setX(x);
		this.finalCoordinates.setY(y);
		this.generatePixels();
	}
	
	generatePixels() {
		// Remove previous children if any
		this.$div.innerHTML = '';

		for (let row = 0; row < this.shape.length; row++) {
			for (let col = 0; col < this.shape[0].length; col++) {
				
				let p = null

				// Add transparent pixels for 0 values in the shape and ImagePixels for 1
				if (this.shape[row][col] === 0) {
					p = new Pixel({ size: this.pixelSize })
				} else {
					p = new ImagePixel(this.image, {
						size: this.pixelSize,
						x: this.finalCoordinates.getX() + col,
						y: this.finalCoordinates.getY() + (this.shape.length - row - 1),
					})
				}

				this.$div.append(p.$div);
			}
		}
	}

}

export default Piece