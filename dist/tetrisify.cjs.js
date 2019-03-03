'use strict';

function tetrisify(selector, options) {

	const wrapper = document.querySelector(selector);
	const image = document.querySelector(selector + ' img');

	if (!wrapper) {
		throw new Error('Tetrisify: Wrapper element not found.')
	}

	if (!image) {
		throw new Error('Tetrisify: Image not found inside the wrapper')
	}

	console.log('success', options);
}

module.exports = tetrisify;
