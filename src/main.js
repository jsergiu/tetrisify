import Game from './classes/Game';
import generatePieceSequence from './utils/generatePieceSequence';
import animatePieces from './utils/animatePieces';

export default function tetrisify(selector, options) {

	const $wrapper = document.querySelector(selector)
	const $image = document.querySelector(selector + ' img')

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
