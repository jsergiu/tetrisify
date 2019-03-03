import { Matrix } from 'ml-matrix';
import Piece from '../classes/Piece';
import normalizeShapeMatrix from './normalizeShapeMatrix';
import { getRandomShape } from './utils';

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
			game.matrix = Matrix.add(game.matrix, normalizedShapedMatrix);

			// Set piece coordinates and add it to the sequence
			piece.setCoordinates(piecePosition.column, piecePosition.row);
			sequence.push(piece);
			game.$wrapper.append(piece.$div);

			done = game.rowIsFilled(row);
		}


		console.log('Row is filled ', done)
		row++;
	}
	
	console.log(sequence)

	//let isDone = game.matrix.sum() > game.rows * game.columns - 5;
	//while (!isDone) {
	//}
	console.log(game.matrix.sum())

}


export default generatePieceSequence