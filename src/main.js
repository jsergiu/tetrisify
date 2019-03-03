import Game from './classes/Game'
import { generatePiecesSequence } from './utils/generatePiecesSequence'

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
	generatePiecesSequence(game)
	//console.log(game)

	/**
	 * 
	*/
}
