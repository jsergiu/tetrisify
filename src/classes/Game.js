import Matrix from 'ml-matrix';
//import Pixel from './Pixel'

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
		this.matrix = Matrix.zeros(this.rows, this.columns) // 1 = pixel not used
	}

	/** Needed so Pieces can have position absolute */
	applyWrapperStyle() {
		Object.assign(this.$wrapper.style, {
			overflow: 'hidden',
			position: 'relative',
		})
	}

	/**
	 * Check if a row has unused pixes
	 * @param {Number} row Row number (bottom is zero)
	 * @returns {Boolean}
	 */
	rowIsFilled(row) {
		const rowSums = this.matrix.sum('row');
		const rowSum = rowSums[this.rows - row - 1][0]
		return  rowSum === this.columns
	}

	/**
	 * Find a random position for a piece on a specific row
	 * @param {Number} row Row to search on
	 * @param {Piece} piece Piece to be fitted
	 */
	getRandomSlot(searchRow, piece) {
		const availableSlots = [];
		let pieceWidth = piece.shape[0].length;
		let pieceHeight = piece.shape.length;

		for (let col = 0; col <= this.columns - pieceWidth; col++) {

			// Get submatrix for the current coordinates
			const startRow = this.rows - searchRow - pieceHeight;
			const endRow = this.rows - searchRow - 1;
			const startColumn = col;
			const endColumn = col + pieceWidth -1;

			// Check for out of bounds
			if (startRow < 0 || startColumn < 0) {
				continue;
			}

			// Test if the piece fits in the current position by adding the submatrix with the shape
			const submatrix = this.matrix.subMatrix(startRow, endRow, startColumn, endColumn);
			const shapeMatrix = new Matrix(piece.shape);
			const sum = Matrix.add(submatrix, shapeMatrix);
			const maxIndex = sum.maxIndex();
			
			// If 2 is the max it means that the piece overlaps an used pixel in the grid
			if (sum.get(maxIndex[0], maxIndex[1]) > 1) {
				continue;
			}

			availableSlots.push({ row: searchRow, column: col })
		}
		console.log('available', availableSlots)
	}
}
	