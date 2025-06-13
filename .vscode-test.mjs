import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: 'out/test/**/*.test.js',
	version: 'stable',
	mocha: {
		timeout: 20000,
		color: true,
		ui: 'tdd'
	},
	launchArgs: [
		// Disable extensions to speed up tests
		'--disable-extensions',
		// Open in a new window
		'--new-window'
	]
});