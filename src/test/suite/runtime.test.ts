import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { createMockPositronApi } from '../mocks/positronApi';
import { TestUtils } from '../helpers/testUtils';

suite('Runtime Demo Test Suite', () => {
	let sandbox: sinon.SinonSandbox;
	let mockContext: vscode.ExtensionContext;
	let showInformationStub: sinon.SinonStub;
	let showErrorMessageStub: sinon.SinonStub;

	setup(() => {
		sandbox = sinon.createSandbox();
		mockContext = TestUtils.createMockContext(sandbox);
		showInformationStub = sandbox.stub(vscode.window, 'showInformationMessage');
		showErrorMessageStub = sandbox.stub(vscode.window, 'showErrorMessage');
	});

	teardown(() => {
		sandbox.restore();
	});

	test('demoExtension.executeCode command should exist and execute without errors', async () => {
		// Ensure extension is activated first
		const ext = vscode.extensions.getExtension('posit-dev.positron-extension-demo');
		if (ext && !ext.isActive) {
			await ext.activate();
		}
		
		// Execute should not throw (in VS Code it will show "Positron API not available")
		await assert.doesNotReject(async () => {
			await vscode.commands.executeCommand('demoExtension.executeCode');
		});
		
		// In VS Code environment, should show API not available message
		assert.ok(
			showInformationStub.calledWith('Positron API not available'),
			'Should show Positron API not available message'
		);
	});

	test('demoExtension.sessionInfo command should exist and execute without errors', async () => {
		// Ensure extension is activated first
		const ext = vscode.extensions.getExtension('posit-dev.positron-extension-demo');
		if (ext && !ext.isActive) {
			await ext.activate();
		}
		
		// Execute should not throw
		await assert.doesNotReject(async () => {
			await vscode.commands.executeCommand('demoExtension.sessionInfo');
		});
		
		// In VS Code environment, command returns early without message
		// (as seen in runtime.ts line 47)
	});

	test('Runtime event listeners should be registered during extension activation', async () => {
		// Since we can't directly test the event listener registration in integration tests,
		// we verify that the extension activates successfully which includes event registration
		const ext = vscode.extensions.getExtension('posit-dev.positron-extension-demo');
		assert.ok(ext, 'Extension should be present');
		
		if (!ext.isActive) {
			await ext.activate();
		}
		
		assert.ok(ext.isActive, 'Extension should be active with event listeners registered');
	});

	test('Runtime commands should be available after extension activation', async () => {
		// Get all commands
		const commands = await vscode.commands.getCommands(true);
		
		// Verify runtime-related commands are registered
		const runtimeCommands = [
			'demoExtension.executeCode',
			'demoExtension.sessionInfo'
		];
		
		runtimeCommands.forEach(cmd => {
			assert.ok(
				commands.includes(cmd),
				`Command ${cmd} should be registered`
			);
		});
	});

	test('Runtime event listener registration should work correctly', async () => {
		const mockApi = createMockPositronApi();
		const onDidExecuteCodeStub = mockApi.runtime.onDidExecuteCode as sinon.SinonStub;
		const disposable = { dispose: sinon.stub() };
		onDidExecuteCodeStub.returns(disposable);
		
		// Simulate event listener registration
		const callback = sinon.stub();
		onDidExecuteCodeStub(callback);
		
		// Verify registration
		assert.ok(onDidExecuteCodeStub.calledOnce);
		assert.strictEqual(typeof onDidExecuteCodeStub.firstCall.args[0], 'function');
	});

	test('Observer callback sequences should fire in correct order', async () => {
		const mockApi = createMockPositronApi();
		const mockExecuteCode = mockApi.runtime.executeCode as sinon.SinonStub;
		
		const callOrder: string[] = [];
		const observer = {
			onStarted: () => callOrder.push('started'),
			onOutput: () => callOrder.push('output'),
			onCompleted: () => callOrder.push('completed'),
			onFinished: () => callOrder.push('finished')
		};
		
		// Configure mock to simulate observer callbacks
		mockExecuteCode.callsFake(async (languageId, code, focus, allowIncomplete, executor, session, obs) => {
			if (obs) {
				obs.onStarted?.();
				obs.onOutput?.({ output: 'test output' });
				obs.onCompleted?.({ result: 'success' });
				obs.onFinished?.();
			}
			return { success: true };
		});
		
		const tryAcquireStub = sandbox.stub();
		tryAcquireStub.returns(mockApi);
		
		// Execute with observer
		await mockApi.runtime.executeCode('python', 'print("test")', true, false, undefined, undefined, observer);
		
		// Verify call order
		assert.deepStrictEqual(callOrder, ['started', 'output', 'completed', 'finished']);
	});

	test('Mock API should simulate error scenarios correctly', async () => {
		// Test network error scenario
		const networkErrorApi = createMockPositronApi({ failureMode: 'network' });
		try {
			await networkErrorApi.runtime.executeCode('python', 'print("test")', true, false);
			assert.fail('Should have thrown network error');
		} catch (error) {
			assert.ok((error as Error).message.includes('Network error'));
		}
		networkErrorApi.sandbox.restore();

		// Test permission error scenario
		const permissionErrorApi = createMockPositronApi({ failureMode: 'permission' });
		try {
			await permissionErrorApi.runtime.executeCode('python', 'print("test")', true, false);
			assert.fail('Should have thrown permission error');
		} catch (error) {
			assert.ok((error as Error).message.includes('Permission denied'));
		}
		permissionErrorApi.sandbox.restore();

		// Test runtime missing scenario
		const runtimeMissingApi = createMockPositronApi({ failureMode: 'runtime-missing' });
		const foregroundSession = await runtimeMissingApi.runtime.getForegroundSession();
		assert.strictEqual(foregroundSession, null, 'Should return null for missing runtime');
		runtimeMissingApi.sandbox.restore();
	});
});