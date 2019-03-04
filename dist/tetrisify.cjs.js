'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Matrix = require('ml-matrix');
var Matrix__default = _interopDefault(Matrix);

//import Pixel from './Pixel'

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
		this.matrix = Matrix__default.zeros(this.rows, this.columns); // 1 = pixel not used
	}

	/** Needed so Pieces can have position absolute */
	applyWrapperStyle() {
		Object.assign(this.$wrapper.style, {
			overflow: 'hidden',
			position: 'relative',
		});
	}

	/**
	 * Check if a row has unused pixes
	 * @param {Number} row Row number (bottom is zero)
	 * @returns {Boolean}
	 */
	rowIsFilled(row) {
		const rowSums = this.matrix.sum('row');
		const rowSum = rowSums[this.rows - row - 1][0];
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
			const shapeMatrix = new Matrix__default(piece.shape);
			const sum = Matrix__default.add(submatrix, shapeMatrix);
			const maxIndex = sum.maxIndex();
			
			// If 2 is the max it means that the piece overlaps an used pixel in the grid
			if (sum.get(maxIndex[0], maxIndex[1]) > 1) {
				continue;
			}

			availableSlots.push({ row: searchRow, column: col });
		}

		// If no available slots were found return false
		if (availableSlots.length === 0) {
			return false
		}

		// Return a random slot
		return availableSlots[parseInt(Math.random() * availableSlots.length)]
	}

}

class Coordinate {
	constructor(x,y) {
		this.x = parseInt(x);
		this.y = parseInt(y);
	}

	getX() { return this.x; }
	getY() { return this.y; }
	setX(value) { this.x = parseInt(value); }
	setY(value) { this.y = parseInt(value); }
}

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
		this.setInitialStyle();
	}
	
	setInitialStyle(data) {
		Object.assign(this.$div.style, {
			height: `${this.size}px`,
			flexBasis: `${this.size}px`,
		});
	}
}

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

		this.$div.setAttribute('class', 'Tetrisify-pixel Tetrisify-imagePixel');
		
		//Add background image
		this.addBackgroundStyle();
	}

	addBackgroundStyle() {
		const bgX = this.image.width - this.x * this.size + 'px ';
		const bgY = (this.y + 1) * this.size + 'px';

		Object.assign(this.$div.style, {
			//background: `url(${this.image.src})`,
			backgroundPosition: bgX + bgY,
			//backgroundSize: `${this.image.width}px ${this.image.height}px`,
		});
	}
}

/**
 * Each piece is represented as a matrix where
 * 1 = the pixes is on / selected
 * 0 = the pixes is off / not used
 */
const pieces = [
	{
		name: 'Dot',
		shape: [[1]],
	},
	{
		name: 'I-piece-vertical',
		shape: [
			[1],
			[1],
			[1],
			[1]
		],
	},
	{
		name: 'I-piece-horizontal',
		shape: [
			[1, 1, 1, 1]
		],
	},
	{
		name: 'J-piece-vertical',
		shape: [
			[0, 1],
			[0, 1],
			[1, 1],
		],
	},
	{
		name: 'J-piece-horizontal',
		shape: [
			[1, 0, 0],
			[1, 1, 1],
		],
	},
	{
		name: 'L-piece-vertical',
		shape: [
			[1, 0],
			[1, 0],
			[1, 1],
		],
	},
	{
		name: 'L-piece-horizontal',
		shape: [
			[0, 0, 1],
			[1, 1, 1],
		],
	},
	{
		name: 'O-piece',
		shape: [
			[1, 1],
			[1, 1],
		],
	},
	{
		name: 'T-piece',
		shape: [
			[0, 1, 0],
			[1, 1, 1],
		],
	},
];

const getRandomShape = () => {
	const random = parseInt(Math.random() * pieces.length);
	return pieces[random];
};

const getRandomColor = () => {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
};

class Piece {
	constructor(data) {

		// Type checking
		if (!data.shape) throw new Error('Tetrisify: shape parameter is missing')
		if (!data.pixelSize) throw new Error('Tetrisify: pixelSize parameter is missing')
		if (!data.image) throw new Error('Tetrisify: image parameter is missing')

		// Initial datas
		this.name = data.name; 				// Optional name of the piece
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
		this.setInitialStyle();
	}
	
	setInitialStyle() {
		let width = this.shape[0].length;
		let height = this.shape.length;

		Object.assign(this.$div.style, {
			width: width * this.pixelSize + 'px',
			height: height * this.pixelSize + 'px',
			position:  'absolute',
			display: 'flex',
			'flex-wrap': 'wrapp',

			// Background
			background: getRandomColor(),
		});
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
				
				let p = null;

				// Add transparent pixels for 0 values in the shape and ImagePixels for 1
				if (this.shape[col] === 0) {
					p = new Pixel({ size: this.pixelSize });
				} else {
					p = new ImagePixel(this.image, {
						size: this.pixelSize,
						x: this.finalCoordinates.getX() + col,
						y: this.finalCoordinates.getY() + row,
					});
				}

				this.$div.append(p.$div);
			}
		}
	}

}

/**
 * Extend a shape to be the same size as the game matrix so they can be added
 * @param {Matrix} shape Shape matrix used to describe a Piece
 * @param {Number} startRow start row position of the piece, 0 is at the bottom
 * @param {Number} startCol start column position of the piece, 0 is on the left
 * @param {Number} totalRows total rows in the final matrix
 * @param {Number} totalColumns total columns in the final matrix
 */
const normalizeShapeMatrix = (shape, startRow, startCol, totalRows, totalColumns) => {
	// Create empty matrix
	const m = Matrix.Matrix.zeros(totalRows, totalColumns);
	const shapeMatrix = new Matrix.Matrix(shape);

	// Add the used pixes of the shape to the matrix
	for (let row = 0; row < shapeMatrix.rows; row++) {
		for (let col = 0; col < shapeMatrix.columns; col++) {

			const rowIndex = totalRows - 0 - startRow - shapeMatrix.rows + row;
			const colIndex = startCol + col;

			// Set pixel to 1 for each shape pixel
			if (shapeMatrix.get(row, col) === 1) {
				m.set(rowIndex, colIndex, 1);
			}
		}
	}

	return m
};

/**
 * Generate a sequence of pieces with their coordinates to make up the completed puzzle
 * @param {Object} game 
 */
const generatePieceSequence = (game) => {

	// The sequence of pieces as an array in cronological order
	const sequence = [];

	// Add pieces to the sequence until each rows is filled
	for (let row = 0; row < game.rows;) {
		
		console.log(`Processing row ${row}`);

		// If the row is filled go to the next row
		let done = game.rowIsFilled(row);
		let piece = null;

		//Add pieces untill the row is filled
		while (!done) {

			let piecePosition = false;
			while (!piecePosition) {
				// Get a random shape
				let randomShape = getRandomShape();
				
				// Create a piece
				piece = new Piece({
					name: randomShape.name,
					shape: randomShape.shape,
					pixelSize: game.pixelSize,
					image: game.image,
				});
				
				piecePosition = game.getRandomSlot(row, piece);
			}

			// Normalize the shape matrix and add it to the game matrix so used pixes are set to 1
			const normalizedShapedMatrix = normalizeShapeMatrix(
				piece.shape,
				piecePosition.row,
				piecePosition.column,
				game.matrix.rows,
				game.matrix.columns
			);
			game.matrix = Matrix.Matrix.add(game.matrix, normalizedShapedMatrix);

			// Set piece coordinates and add it to the sequence
			piece.setFinalCoordinates(piecePosition.column, piecePosition.row);
			sequence.push(piece);

			done = game.rowIsFilled(row);
		}

		// Once all the pixels on one row are filled, go to the next row
		row++;
	}
	
	console.log(sequence);
	return sequence;
};

/**
 * Animate piece by piece until the entire puzzle is composed
 * @param {Game} game A game object
 * @param {Array} pieces A sequence of pieces that compose a puzzle
 * @param {number} speed Step duration in miliseconds
 */
const animatePieces = (game, pieces, speed) => {
	const interval = setInterval(() => {

		const currentPiece = pieces.find(p => p.state !== 'Done');
		// If all the pieces are done end the animation
		if (!currentPiece) {
			clearInterval(interval);
			return
		}

		const currentX = currentPiece.currentCoordinates.getX();
		const currentY = currentPiece.currentCoordinates.getY();
		const finalX = currentPiece.finalCoordinates.getX();
		const finalY = currentPiece.finalCoordinates.getY();
		let nextX = currentX;
		let nextY = currentY;


		// Check if the piece is in the final position
		if (currentX === finalX && currentY === finalY) {
			currentPiece.state = 'Done';
		}

		if (currentPiece.state === 'Falling') {
			if (nextX > finalX) { nextX--; }
			if (nextX < finalX) { nextX++; }
			if (nextY > finalY) { nextY--; }
			currentPiece.setCurrentCoordinates(nextX, nextY);
		}

		// If the piece is Idle put it in the start position in the middle or the top row
		if (currentPiece.state === 'Idle') {
			game.$wrapper.append(currentPiece.$div);
			currentPiece.setCurrentCoordinates(game.columns / 2, game.rows - 1);
			currentPiece.state = 'Falling';
		}

	}, speed);

};

function tetrisify(selector, options) {

	const $wrapper = document.querySelector(selector);
	const $image = document.querySelector(selector + ' img');

	if (!$wrapper) {
		throw new Error('Tetrisify: Wrapper element not found.')
	}

	if (!$image) {
		throw new Error('Tetrisify: Image not found inside the wrapper')
	}

	// Initialize the game
	const game = new Game($wrapper, options);

	// Generate a random sequence of pieces that form the puzzle
	const pieces = generatePieceSequence(game);
	
	//Animate piece by piece until the puzzle is completed
	animatePieces(game, pieces, 200);
}

module.exports = tetrisify;
