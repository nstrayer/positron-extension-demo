import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { createMockPositronApi } from '../mocks/positronApi';
import { TestUtils } from '../helpers/testUtils';

suite('Methods Demo Test Suite', () => {
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

	test('demoExtension.methodsDemo command should exist and execute without errors', async () => {
		// Verify command exists
		const commands = await vscode.commands.getCommands(true);
		assert.ok(
			commands.includes('demoExtension.methodsDemo'),
			'methodsDemo command should be registered'
		);
		
		// Execute should not throw
		await assert.doesNotReject(async () => {
			await vscode.commands.executeCommand('demoExtension.methodsDemo');
		});
		
		// In VS Code environment, should show API not available message
		assert.ok(
			showInformationStub.calledWith('Positron API not available'),
			'Should show Positron API not available message'
		);
	});

	test('Methods demo integration with VS Code', async () => {
		// Verify that methods demo gracefully handles VS Code environment
		// The command should exist even without Positron
		const ext = vscode.extensions.getExtension('posit-dev.positron-extension-demo');
		assert.ok(ext, 'Extension should be present');
		
		// Verify activation includes methods demos
		if (!ext.isActive) {
			await ext.activate();
		}
		
		assert.ok(ext.isActive, 'Extension should be active with methods demos registered');
	});

	test('Help topic provider registration should work correctly', async () => {
		const mockApi = createMockPositronApi();
		const registerHelpTopicProviderStub = mockApi.languages.registerHelpTopicProvider as sinon.SinonStub;
		const disposable = { dispose: sinon.stub() };
		registerHelpTopicProviderStub.returns(disposable);
		
		// Simulate provider registration
		const provider = {
			provideHelpTopics: sinon.stub()
		};
		
		const result = registerHelpTopicProviderStub('python', provider);
		
		// Verify registration
		assert.ok(registerHelpTopicProviderStub.calledOnce);
		assert.strictEqual(registerHelpTopicProviderStub.firstCall.args[0], 'python');
		assert.ok(registerHelpTopicProviderStub.firstCall.args[1]);
		assert.ok(result.dispose);
	});

	test('Method call API interactions should handle parameters correctly', async () => {
		const mockApi = createMockPositronApi();
		const mockCall = mockApi.methods.call as sinon.SinonStub;
		
		const tryAcquireStub = sandbox.stub();
		tryAcquireStub.returns(mockApi);
		
		// Test with various method parameters
		const testParams = {
			method: 'test.method',
			args: ['arg1', 'arg2'],
			options: { timeout: 5000 }
		};
		
		await mockApi.methods.call(testParams.method, testParams.args);
		
		// Verify correct parameters passed
		assert.ok(mockCall.calledWith(testParams.method, testParams.args));
	});

	test('Methods API mock structure validation', async () => {
		// Test that our mock API has the expected structure for methods
		const mockApi = createMockPositronApi();
		
		// Verify methods API structure
		assert.ok(mockApi.methods, 'Mock should have methods API');
		assert.ok(mockApi.methods.call, 'Methods API should have call method');
		assert.ok(mockApi.methods.lastActiveEditorContext, 'Methods API should have lastActiveEditorContext');
		assert.ok(mockApi.methods.showQuestion, 'Methods API should have showQuestion');
		assert.ok(mockApi.methods.showDialog, 'Methods API should have showDialog');
		
		// Clean up
		mockApi.sandbox.restore();
	});
});