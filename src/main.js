import Game from './classes/Game'
import generatePieceSequence from './utils/generatePieceSequence'

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

		
	
	// Current piece that is animated
	let currentPiece = null;
	const interval = setInterval(() => {

		const currentPiece = pieces.find(p => p.state !== 'Done');
		// If all the pieces are done end the animation
		if (!currentPiece) {
			clearInterval(interval)
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


		
	}, 500)


	//console.log(game)

	/**
	 * 
	*/
}
