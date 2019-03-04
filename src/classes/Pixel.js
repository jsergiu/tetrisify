

/**
 * Multiple pixes compose one Piece
 * Pixel should be calculated from the number of columns that the game matrix has
 */
class Pixel {

	/**
	 * Make an instance of a transparent pixel
	 * @param {Object} data {size }
	 */
	constructor(data) {
		// Actual size of one pixel
		this.size = data.size;
		
		// Creat div and append
		this.$div = document.createElement("div");
		this.$div.setAttribute('class', 'Tetrisify-pixel');
		this.setInitialStyle()
	}
	
	setInitialStyle(data) {
		Object.assign(this.$div.style, {
			height: `${this.size}px`,
			flexBasis: `${this.size}px`,
		})
	}
}

export default Pixel