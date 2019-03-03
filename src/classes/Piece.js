import Coordinate from './Coordinate';
import  { getRandomColor } from '../utils/utils';


class Piece {
	constructor(data) {

		// Type checking
		if (!data.shape) throw new Error('Tetrisify: shape parameter is missing')
		if (!data.pixelSize) throw new Error('Tetrisify: pixelSize parameter is missing')

		// Initial datas
		this.name = data.name
		this.shape = data.shape;
		this.pixelSize = data.pixelSize;

		// Coordinates used for the falling animation
		this.currentCoordinates = new Coordinate(-1000, -1000);

		// Final coordinates when the pice is in place
		this.finalCoordinates = new Coordinate(-1000, -1000);
		
		// States: [Idle, Falling, Done]
		this.state = 'Idle';
		
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
			position:  'absolute',

			// Background
			background: getRandomColor(),
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
	}

}

export default Piece