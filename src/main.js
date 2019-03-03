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

	const game = new Game($wrapper, options)
	generatePieceSequence(game)


	//console.log(game)

	/**
	 * 
	*/
}
