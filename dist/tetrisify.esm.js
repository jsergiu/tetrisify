import Matrix from 'ml-matrix';

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
		this.matrix = Matrix.zeros(this.rows, this.columns); // 1 = pixel not used
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

	/*
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
	}*/


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
		name: 'I-piece',
		shape: [
			[1],
			[1],
			[1],
			[1]
		],
	},
	{
		name: 'J-piece',
		shape: [
			[0, 1],
			[0, 1],
			[1, 1],
		],
	},
	{
		name: 'L-piece',
		shape: [
			[1, 0],
			[1, 0],
			[1, 1],
		],
	},
	{
		name: 'O-piece',
		shape: [
			[1, 1],
			[1, 1],
		],
	},
	/*{
		name: 'S-piece',
		shape: [
			[1, 0],
			[1, 1],
			[0, 1],
		],
	},*/
	{
		name: 'T-piece',
		shape: [
			[0, 1, 0],
			[1, 1, 1],
		],
	},
];

class Piece {
	constructor(data) {

		// Type checking
		if (!data.shape) throw new Error('Tetrisify: shape parameter is missing')
		if (!data.pixelSize) throw new Error('Tetrisify: pixelSize parameter is missing')

		// Initial datas
		this.name = data.name;
		this.shape = data.shape;
		this.pixelSize = data.pixelSize;
		this.coordinates = { x: -1000, y: -1000 };
		
		// Create div and add css
		this.$div = document.createElement("div");
		this.setInitialStyle();
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
		});
	}

	setCoordinates(x,y) {
		this.coordinates.x = x,
		this.coordinates.y = y;
		this.$div.style.left = x * this.pixelSize + 'px';
		this.$div.style.bottom = y * this.pixelSize + 'px';
	}

}

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

const generatePiecesSequence = (game) => {

	// Add pieces to the sequence until each rows is filled
	for (let row = 0; row < game.rows - 1;) {
		console.log(`Processing row ${row}`);
		let done = game.rowIsFilled(0);

		//Add pieces untill the row is filled
		while (!done) {

			// Get a random shape
			let randomShape = getRandomShape();

			// Create a piece
			let piece = new Piece({
				name: randomShape.name,
				shape: randomShape.shape,
				pixelSize: game.pixelSize,
			});

			//let slot = getRandomSlot(row, piece)
			console.log(piece);
			done = true;
		}


		console.log('Row is filled ', done);
		row++;
	}
	
	//console.log(sequence)

	//let isDone = game.matrix.sum() > game.rows * game.columns - 5;
	//while (!isDone) {
	//}
	console.log(game.matrix.sum());

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

	const game = new Game($wrapper, options);
	generatePiecesSequence(game);
	//console.log(game)

	/**
	 * 
	*/
}

export default tetrisify;
