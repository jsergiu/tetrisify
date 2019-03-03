const assert = require('assert');
const Matrix = require('ml-matrix').Matrix;
const normalizeShapeMatrix = require('../src/utils/normalizeShapeMatrix');

const totalRows = 10;
const totalColumns = 10;
const shape =  new Matrix([[1, 1], [1, 1]])


function test(shape, startRow, startCol) {
	const normalizedMatrix = normalizeShapeMatrix(
		shape,
		startRow,
		startCol,
		totalRows,
		totalColumns
	)
	
	console.log(normalizedMatrix.sum('rows'));
	assert.equal(1, 2);
}

test(shape, 5, 5);