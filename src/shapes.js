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
]

export default pieces