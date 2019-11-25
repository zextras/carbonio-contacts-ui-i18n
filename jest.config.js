module.exports = {
	moduleDirectories: [
		'node_modules',
		// add the directory with the test-utils.js file:
		'test/utils' // a utility folder
	],
	globals: {
		'ts-jest': {
			diagnostics: {
				warnOnly: true
			}
		}
	},
	// The root of your source code, typically /src
	// `<rootDir>` is a token Jest substitutes
	// roots: ["<rootDir>/src"],

	// Jest transformations -- this adds support for TypeScript
	// using ts-jest
	transform: {
		"^.+\\.tsx?$": "babel-jest"
	},

	// Runs special logic, such as cleaning up components
	// when using React Testing Library and adds special
	// extended assertions to Jest
	setupFilesAfterEnv: [
		"@testing-library/jest-dom/extend-expect"
	],
	collectCoverage: true,
	collectCoverageFrom: ['src/**/*.ts', 'src/**/*.tsx'],
	coverageReporters: ['text'],
	
	// Test spec file resolution pattern
	// Matches parent folder `__tests__` and filename
	// should contain `test` or `spec`.
	testMatch: [ "**/test/unit/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)" ],

	// Module file extensions for importing
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"]
};