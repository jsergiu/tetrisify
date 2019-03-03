import { Matrix } from 'ml-matrix';

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
	const m = Matrix.zeros(totalRows, totalColumns);
	const shapeMatrix = new Matrix(shape);

	// Add the used pixes of the shape to the matrix
	for (let row = 0; row < shapeMatrix.rows; row++) {
		for (let col = 0; col < shapeMatrix.columns; col++) {

			const rowIndex = totalRows - 0 - startRow - shapeMatrix.rows + row;
			const colIndex = startCol + col

			// Set pixel to 1 for each shape pixel
			if (shapeMatrix.get(row, col) === 1) {
				m.set(rowIndex, colIndex, 1);
			}
		}
	}

	return m
}

export default normalizeShapeMatrix;