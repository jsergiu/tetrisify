/**
 * Animate piece by piece until the entire puzzle is composed
 * @param {Game} game A game object
 * @param {Array} pieces A sequence of pieces that compose a puzzle
 * @param {number} speed Step duration in miliseconds
 */
const animatePieces = (game, pieces, speed) => {
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

	}, speed)

}

export default animatePieces;