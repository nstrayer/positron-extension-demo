import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';

suite('Command Tests', () => {
	let sandbox: sinon.SinonSandbox;

	setup(() => {
		sandbox = sinon.createSandbox();
	});

	teardown(() => {
		sandbox.restore();
	});

	test('Hello World command should show message when Positron API is not available', async () => {
		// Stub the showInformationMessage method
		const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage');

		// Execute the command
		await vscode.commands.executeCommand('myExtension.helloWorld');

		// Verify the message was shown
		assert.ok(showInfoStub.calledOnce);
		assert.ok(showInfoStub.calledWith('Failed to find positron api'));
	});

	test('Preview Window command should execute without errors', async () => {
		await assert.doesNotReject(async () => {
			await vscode.commands.executeCommand('demoExtension.previewWindow');
		});
	});

	test('Dialog Demo command should execute without errors', async () => {
		await assert.doesNotReject(async () => {
			await vscode.commands.executeCommand('demoExtension.dialogDemo');
		});
	});

	test('Register Driver command should execute without errors', async () => {
		await assert.doesNotReject(async () => {
			await vscode.commands.executeCommand('demoExtension.registerDriver');
		});
	});
});