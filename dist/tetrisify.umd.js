(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.tetrisify = factory());
}(this, function () { 'use strict';

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

	return tetrisify;

}));
