module.exports = {
	transform: {
		"^.+\\.[t|j]sx?$": ['babel-jest', { configFile: './babel.config.app.js' }]
	},
	moduleDirectories: [
		'node_modules',
		// add the directory with the test-utils.js file:
		'test/utils' // a utility folder
	],
	collectCoverage: true,
	collectCoverageFrom: ['src/**/*.js', 'src/**/*.jsx', 'src/**/*.ts', 'src/**/*.tsx'],
	// coverageDirectory: 'test/coverage',
	coverageReporters: ['text'],
	// testMatch: ['/test/**/*.js?(x)'],
	moduleNameMapper: {
		"^@zextras/zapp-shell$": "<rootDir>/node_modules/@zextras/zapp-shell/build/jest-mocks.js"
	},
	setupFilesAfterEnv: [
		"<rootDir>/src/jest-env-setup.js"
	],
	setupFiles: [
		"<rootDir>/src/jest-polyfills.js"
	]
};
