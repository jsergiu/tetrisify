import Matrix from 'ml-matrix';
import shapes from '../shapes';
import Piece from '../classes/Piece';

export const getRandomShape = () => {
	const random = parseInt(Math.random() * shapes.length);
	return shapes[random];
}

/**
 * Get a random position for a block on a given row
 * @param {Number} row: On which row to search for empty slots
 * @param {Object} blockShape: A block matrix
 * @returns {Object}: An x,y object
 */
export const getRandomSlot = (game, row, blockShape) => {
	// Array of available slots
	const availableSlots = [];

	for (let col = row; col <= game.columns; col++) {
		if (game.testBlockPosition(blockShape, col, row)) {
			availableSlots.push({ x: col, y: 0})
		}	
	}
	const randomPosition = availableSlots[parseInt(Math.random() * (availableSlots.length - 1))]
	return randomPosition
}


