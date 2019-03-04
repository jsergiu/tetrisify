import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';
import postcss from 'rollup-plugin-postcss';
import pkg from './package.json';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/main.js',
	output: {
		name: 'tetrisify',
		file: pkg.browser,
		format: 'umd'
	},
	plugins: [
		postcss({
			extensions: [ '.css' ],
			extract: true,
		}),
		resolve({
			browser: true,
		}),
		commonjs(), // converts date-fns to ES modules
		production && uglify() // minify, but only in production
	],
	watch: {
		exclude: 'node_modules/**'
	}
};
