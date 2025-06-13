import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
	suiteSetup(async () => {
		// Make sure the extension is activated
		const ext = vscode.extensions.getExtension('posit-dev.positron-extension-demo');
		if (ext && !ext.isActive) {
			await ext.activate();
		}
	});

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('posit-dev.positron-extension-demo'));
	});

	test('Extension should activate', async () => {
		const ext = vscode.extensions.getExtension('posit-dev.positron-extension-demo');
		assert.ok(ext);
		await ext!.activate();
		assert.strictEqual(ext!.isActive, true);
	});

	test('Should register all expected commands', async () => {
		const commands = await vscode.commands.getCommands(true);
		
		const expectedCommands = [
			'myExtension.helloWorld',
			'demoExtension.previewWindow',
			'demoExtension.registerDriver',
			'demoExtension.dialogDemo',
			'demoExtension.plotSettings'
		];

		expectedCommands.forEach(cmd => {
			assert.ok(
				commands.includes(cmd),
				`Command ${cmd} should be registered`
			);
		});
	});

	test('Hello World command should execute without errors', async () => {
		await assert.doesNotReject(async () => {
			await vscode.commands.executeCommand('myExtension.helloWorld');
		});
	});
});