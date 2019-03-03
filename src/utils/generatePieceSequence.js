import { getRandomShape } from './utils'

/**
 * Generate a sequence of pieces with their coordinates to make up the completed puzzle
 * @param {Object} game 
 */
const generatePiecesSequence = (game) => {

	// The sequence of pieces as an array in cronological order
	const sequence = [];

	// Add pieces to the sequence until each rows is filled
	for (let row = 0; row < game.rows - 1;) {
		
		console.log(`Processing row ${row}`);

		// If the row is filled go to the next row
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
			})

			//let slot = getRandomSlot(row, piece)
			console.log(piece)
			done = true
		}


		console.log('Row is filled ', done)
		row++;
	}
	
	//console.log(sequence)

	//let isDone = game.matrix.sum() > game.rows * game.columns - 5;
	//while (!isDone) {
	//}
	console.log(game.matrix.sum())

}


export default generatePiecesSequence