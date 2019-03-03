import Pixel from './Pixel'

export default class Game {
	constructor($wrapper, options) {
		this.$wrapper = $wrapper
		this.$image = $wrapper.querySelector('img')

		// Get image attributes
		this.image = {
			width: $wrapper.querySelector('img').offsetWidth,
			height: $wrapper.querySelector('img').offsetHeight,
			src: $wrapper.querySelector('img').getAttribute('src')
		}

		// Set the number of columns and rows
		this.columns = options.columns || 10
		this.pixelSize = this.image.width / this.columns
		this.rows = options.rows || parseInt(this.image.height / this.pixelSize)

		this.applyWrapperStyle()
		this.matrix = this.initializeMatrix(this.rows, this.columns)
	}

	/** Needed so Pieces can have position absolute */
	applyWrapperStyle() {
		Object.assign(this.$wrapper.style, {
			overflow: 'hidden',
			position: 'relative',
		})
	}

	initializeMatrix(rows, columns) {
		var matrix = []
		for  (let i = 0; i < rows; i++) {
			for  (let j = 0; j < columns ; j++) {
				if (!matrix[i]) matrix[i] = []
				
				let p = new Pixel(this.image, {
					row: rows - i - 1,
					col: j,
					value: 0,
					size: this.pixelSize,
				})

				matrix[i][j] = p
			}
		}
		return matrix
	}


	/**
	 * Print a matrix with only the values for each pixel
	 */
	debug() {
		let m = []
		for (let i = 0; i < this.columns; i++) {
			for (let j = 0; j < this.rows; j++) {
				if (!m[this.columns - j - 1]) m[this.columns - j - 1] = []
				m[this.columns - j - 1][i] = this.getPixel(i,j).value
			}
		}
		console.table(m)
	}

}
	