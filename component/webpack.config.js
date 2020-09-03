module.exports = {
	entry: './main.js',
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env'],
						plugins: [
							['@babel/plugin-transform-react-jsx', { pragma: 'create' }]
						]
					}
				}
			}
		]
	},
	mode: 'development',
	optimization: {
		minimize: false
	}
}
