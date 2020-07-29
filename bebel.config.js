module.exports = {
	presets: [ [ '@babel/preset-env', { target: { node: 'current' } } ], '@babel/preset-typescript' ],
	plugins: [ 'transform-es2015-modules-commonjs' ]
};
