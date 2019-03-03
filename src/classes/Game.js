class MainGrid {
	constructor(rows, columns) {
		this.matrix = this.initializeMatrix(rows, columns)
		this.rows = rows
		this.columns = columns
	}

	initializeMatrix(rows, columns) {
		var matrix = []
		for  (let i = 0; i < rows; i++) {
			for  (let j = 0; j < columns ; j++) {
				if (!matrix[i]) matrix[i] = []
				
				let p = new Pixel({
					row: rows - i - 1,
					col: j,
					value: 0,
				})

				matrix[i][j] = p
			}
		}
		return matrix
	}

	/**
	 * Get the Pixel object on the x,y position with 0,0 being in the bottom-left corner
	 * @param {Number} x 
	 * @param {Number} y 
	 */
	getPixel (x,y) {
		return this.matrix[this.columns - y - 1][x] || null
	}

	/**
	 * Set the Pixel value on the x,y position with 0,0 being in the bottom-left corner
	 * @param {Number} x 
	 * @param {Number} y 
	 */
	setPixel = (x,y, value) => {
		this.matrix[this.columns - y - 1][x].value = value
	}

	/**
	 * Get a random position for a block on a given row
	 * @param {Number} row: On which row to search for empty slots
	 * @param {Object} blockShape: A block matrix
	 * @returns {Object}: An x,y object
	 */
	getRandomSlot(row, blockShape) {
		// Array of available slots
		const availableSlots = [];

		for (let col = row; col <= this.columns; col++) {
			if (this.testBlockPosition(blockShape, col, row)) {
				availableSlots.push({ x: col, y: 0})
			}	
		}
		const randomPosition = availableSlots[parseInt(Math.random() * (availableSlots.length - 1))]
		return randomPosition
	}

	/**
	 * Test if a block fits on a given bottom-left coordinate
	 * @param {Object} blockShape A block shape m
	 * @param {Number}} x 
	 * @param {Number} y 
	 */
	testBlockPosition(blockShape, x, y) {
		const shapeWidth = blockShape[0].length
		const shapeHeight = blockShape.length

		// Check if the row bellow has unused pixels
		for (let i = 0; i < shapeWidth; i++) {
			const matrixPixel = this.getPixel(x + i, y)
			if (!matrixPixel) {
				console.log('Out of bounds')
				return false
			}

			if (y - 1 > -1 && matrixPixel.value === 0) {
				console.log('Base not solid')
				return false
			}
		}

		// Check if the block fits in the selected coordinates
		for (let i = 0; i < shapeHeight; i++) {
			for (let j = 0; j < shapeWidth; j++) {
				const matrixPixel = this.getPixel(x + i, y + j)
				const shapePixelValue = this.getShapePixel(blockShape, i, j)

				if (!matrixPixel) return false

				if (shapePixelValue + matrixPixel.value > 1) {
					console.log('Block doesnt fit')
					return false;
				}
			}
		}

		return true
	}

	saveBlockPosition(x, y, blockShape) {
		const shapeWidth = blockShape[0].length
		const shapeHeight = blockShape.length
	
		for (let i = 0; i < shapeHeight; i++) {
			for (let j = 0; j < shapeWidth; j++) {
				const shapePixelValue = this.getShapePixel(blockShape, i, j)
	
				if (shapePixelValue > 0) {
					this.setPixel(x + i, y + j, 1)
				}
			}
		}
	}

	getShapePixel(shape, x, y) {
		const cols = shape[0].length
		return shape[cols - y - 1][x]
	}

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
	