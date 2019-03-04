import Coordinate from './Coordinate';
import Pixel from './Pixel';

/**
 * Multiple pixes compose one Piece
 * Pixel should be calculated from the number of columns that the game matrix has
 * x,y coordinates are relative to the game matrix
 */
class ImagePixel extends Pixel {

	/**
	 * Make an instance
	 * @param {Obkect} image Image attributes
	 * @param {Object} data 
	 */
	constructor(image, data) {
		super(data);

		// Initial data
		this.coordinate = new Coordinate(data.x, data.y);
		this.image = image;

		const className = `Tetrisify-pixel Tetrisify-imagePixel`;
		this.$div.setAttribute('class', className);
		this.$div.setAttribute('data-x', this.coordinate.getX());
		this.$div.setAttribute('data-y', this.coordinate.getY());
		
		//Add background image
		this.addBackgroundStyle()
	}

	addBackgroundStyle() {
		const bgX = this.image.width - this.coordinate.getX() * this.size + 'px '
		const bgY = (this.coordinate.getY() + 1) * this.size + 'px'

		Object.assign(this.$div.style, {
			background: `url(${this.image.src})`,
			backgroundPosition: bgX + bgY,
			backgroundSize: `${this.image.width}px ${this.image.height}px`,
		})
	}
}

export default ImagePixel