'use strict';

class Coordinate {
	constructor(x,y) {
		this.x = parseInt(x);
		this.y = parseInt(y);
	}

	getX() {
		return this.x;
	}

	getY() {
		return this.y;
	}
}

class Pixel {
	constructor(image, data) {
		// Initial data
		this.coordinate = new Coordinate(data.x, data.y);
		this.value = data.value || 0; // 0 = unocuppied
		
		// Creat div and append
		this.$div = document.createElement("div");
		this.setInitialStyle(data.col, data.row);
	}
	
	setInitialStyle(image, data) {
		const bgX = image.width - this.col * data.size + 'px ';
		const bgY = (this.row + 1) * data.size + 'px';

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
		});
	}
}

class Game {
	constructor($wrapper, options) {
		this.$wrapper = $wrapper;
		this.$image = $wrapper.querySelector('img');

		// Get image attributes
		this.image = {
			width: $wrapper.querySelector('img').offsetWidth,
			height: $wrapper.querySelector('img').offsetHeight,
			src: $wrapper.querySelector('img').getAttribute('src')
		};

		// Set the number of columns and rows
		this.columns = options.columns || 10;
		this.pixelSize = this.image.width / this.columns;
		this.rows = options.rows || parseInt(this.image.height / this.pixelSize);

		this.applyWrapperStyle();
		this.matrix = this.initializeMatrix(this.rows, this.columns);
	}

	/** Needed so Pieces can have position absolute */
	applyWrapperStyle() {
		Object.assign(this.$wrapper.style, {
			overflow: 'hidden',
			position: 'relative',
		});
	}

	initializeMatrix(rows, columns) {
		var matrix = [];
		for  (let i = 0; i < rows; i++) {
			for  (let j = 0; j < columns ; j++) {
				if (!matrix[i]) matrix[i] = [];
				
				let p = new Pixel(this.image, {
					row: rows - i - 1,
					col: j,
					value: 0,
					size: this.pixelSize,
				});

				matrix[i][j] = p;
			}
		}
		return matrix
	}


	/**
	 * Print a matrix with only the values for each pixel
	 */
	debug() {
		let m = [];
		for (let i = 0; i < this.columns; i++) {
			for (let j = 0; j < this.rows; j++) {
				if (!m[this.columns - j - 1]) m[this.columns - j - 1] = [];
				m[this.columns - j - 1][i] = this.getPixel(i,j).value;
			}
		}
		console.table(m);
	}

}

function tetrisify(selector, options) {

	const $wrapper = document.querySelector(selector);
	const $image = document.querySelector(selector + ' img');

	if (!$wrapper) {
		throw new Error('Tetrisify: Wrapper element not found.')
	}

	if (!$image) {
		throw new Error('Tetrisify: Image not found inside the wrapper')
	}

	const game = new Game($wrapper, options);
	console.log(game);

	/**
	 * 
	*/
}

module.exports = tetrisify;
