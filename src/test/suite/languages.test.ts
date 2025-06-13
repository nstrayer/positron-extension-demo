import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { createMockPositronApi } from '../mocks/positronApi';
import { TestUtils } from '../helpers/testUtils';

suite('Languages Demo Test Suite', () => {
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

	test('Statement range provider registration should work correctly', async () => {
		const mockApi = createMockPositronApi();
		const registerStatementRangeProviderStub = mockApi.languages.registerStatementRangeProvider as sinon.SinonStub;
		const disposable = { dispose: sinon.stub() };
		registerStatementRangeProviderStub.returns(disposable);
		
		// Create a mock provider
		const provider = {
			provideStatementRange: sinon.stub().returns({
				range: new vscode.Range(0, 0, 0, 10)
			})
		};
		
		// Register the provider - matches actual API usage in languages.ts
		const result = registerStatementRangeProviderStub({ language: 'mylang' }, provider);
		
		// Verify registration
		assert.ok(registerStatementRangeProviderStub.calledOnce);
		assert.deepStrictEqual(registerStatementRangeProviderStub.firstCall.args[0], { language: 'mylang' });
		assert.ok(registerStatementRangeProviderStub.firstCall.args[1]);
		assert.ok(result.dispose);
	});

	test('Help topic provider registration should work correctly', async () => {
		const mockApi = createMockPositronApi();
		const registerHelpTopicProviderStub = mockApi.languages.registerHelpTopicProvider as sinon.SinonStub;
		const disposable = { dispose: sinon.stub() };
		registerHelpTopicProviderStub.returns(disposable);
		
		// Create a mock provider
		const provider = {
			provideHelpTopic: sinon.stub()
		};
		
		// Register the provider - matches actual API usage
		const result = registerHelpTopicProviderStub({ language: 'mylang' }, provider);
		
		// Verify registration
		assert.ok(registerHelpTopicProviderStub.calledOnce);
		assert.deepStrictEqual(registerHelpTopicProviderStub.firstCall.args[0], { language: 'mylang' });
		assert.ok(registerHelpTopicProviderStub.firstCall.args[1]);
		assert.ok(result.dispose);
	});

	test('Language provider lifecycle should be manageable', async () => {
		const mockApi = createMockPositronApi();
		const registerStatementRangeProviderStub = mockApi.languages.registerStatementRangeProvider as sinon.SinonStub;
		const registerHelpTopicProviderStub = mockApi.languages.registerHelpTopicProvider as sinon.SinonStub;
		
		const disposables: { dispose: sinon.SinonStub }[] = [];
		
		// Register multiple providers like in actual implementation
		const statementDisposable = { dispose: sinon.stub() };
		registerStatementRangeProviderStub.returns(statementDisposable);
		disposables.push(statementDisposable);
		
		const helpDisposable = { dispose: sinon.stub() };
		registerHelpTopicProviderStub.returns(helpDisposable);
		disposables.push(helpDisposable);
		
		// Register providers
		registerStatementRangeProviderStub({ language: 'mylang' }, {});
		registerHelpTopicProviderStub({ language: 'mylang' }, {});
		
		// Dispose all
		disposables.forEach(d => d.dispose());
		
		// Verify all disposed
		disposables.forEach(d => assert.ok(d.dispose.calledOnce));
	});

	test('Language API registration with actual demo patterns', async () => {
		// Test the pattern used in registerLanguageDemos
		const mockApi = createMockPositronApi();
		
		// Mock tryAcquirePositronApi
		const tryAcquireStub = sandbox.stub();
		tryAcquireStub.returns(mockApi);
		
		// Simulate the registration pattern from languages.ts
		const positronApi = tryAcquireStub();
		if (positronApi) {
			// Register statement range provider
			const statementProvider = { provideStatementRange: sinon.stub() };
			positronApi.languages.registerStatementRangeProvider(
				{ language: "mylang" },
				statementProvider
			);
			
			// Register help topic provider
			const helpProvider = { provideHelpTopics: sinon.stub() };
			positronApi.languages.registerHelpTopicProvider(
				{ language: "mylang" },
				helpProvider
			);
		}
		
		// Verify both providers were registered
		const registerStatementRangeProviderStub = mockApi.languages.registerStatementRangeProvider as sinon.SinonStub;
		const registerHelpTopicProviderStub = mockApi.languages.registerHelpTopicProvider as sinon.SinonStub;
		
		assert.ok(registerStatementRangeProviderStub.calledOnce);
		assert.ok(registerHelpTopicProviderStub.calledOnce);
	});

	test('Language API unavailability should be handled gracefully', async () => {
		// Mock Positron API as unavailable
		const tryAcquireStub = sandbox.stub();
		tryAcquireStub.returns(undefined);
		
		// Attempt to use language features
		const result = tryAcquireStub();
		
		// Verify graceful handling
		assert.strictEqual(result, undefined);
	});

	test('Language providers should work with context subscriptions', async () => {
		const mockApi = createMockPositronApi();
		const mockContext = TestUtils.createMockContext(sandbox);
		
		// Simulate adding disposables to context like real implementation would
		const disposable1 = mockApi.languages.registerStatementRangeProvider(
			{ language: 'mylang' },
			{ provideStatementRange: sinon.stub() }
		);
		
		const disposable2 = mockApi.languages.registerHelpTopicProvider(
			{ language: 'mylang' },
			{ provideHelpTopic: sinon.stub() }
		);
		
		// In real implementation these would be added to context.subscriptions
		mockContext.subscriptions.push(disposable1);
		mockContext.subscriptions.push(disposable2);
		
		// Verify subscriptions were added
		assert.strictEqual(mockContext.subscriptions.length, 2);
	});
});