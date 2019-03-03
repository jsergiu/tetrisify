/**
 * Each piece is represented as a matrix where
 * 1 = the pixes is on / selected
 * 0 = the pixes is off / not used
 */
const pieces = [
	{
		name: 'I-piece',
		width: 1,
		height: 4,
		shape: [
			[1],
			[1],
			[1],
			[1]
		],
	},
	{
		name: 'J-piece',
		width: 2,
		height: 3,
		shape: [
			[0, 1],
			[0, 1],
			[1, 1],
		],
	},
	{
		name: 'L-piece',
		width: 2,
		height: 3,
		shape: [
			[1, 0],
			[1, 0],
			[1, 1],
		],
	},
	{
		name: 'O-piece',
		width: 2,
		height: 2,
		shape: [
			[1, 1],
			[1, 1],
		],
	},
	{
		name: 'S-piece',
		width: 2,
		height: 3,
		shape: [
			[1, 0],
			[1, 1],
			[0, 1],
		],
	},
	{
		name: 'T-piece',
		width: 3,
		height: 2,
		shape: [
			[0, 1, 0],
			[1, 1, 1],
		],
	},
]