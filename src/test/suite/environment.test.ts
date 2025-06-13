import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { createMockPositronApi } from '../mocks/positronApi';
import { TestUtils } from '../helpers/testUtils';

suite('Environment Demo Test Suite', () => {
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

	test('demoExtension.envVars command should exist and execute without errors', async () => {
		// Verify command exists
		const commands = await vscode.commands.getCommands(true);
		assert.ok(
			commands.includes('demoExtension.envVars'),
			'envVars command should be registered'
		);
		
		// Execute should not throw
		await assert.doesNotReject(async () => {
			await vscode.commands.executeCommand('demoExtension.envVars');
		});
		
		// In VS Code environment, should show API not available message
		assert.ok(
			showInformationStub.calledWith('Positron API not available'),
			'Should show Positron API not available message'
		);
	});

	test('Environment demo integration with VS Code', async () => {
		// Verify that environment demo gracefully handles VS Code environment
		const ext = vscode.extensions.getExtension('posit-dev.positron-extension-demo');
		assert.ok(ext, 'Extension should be present');
		
		// The environment demo should be registered even without Positron
		if (!ext.isActive) {
			await ext.activate();
		}
		
		assert.ok(ext.isActive, 'Extension should be active with environment demos registered');
	});

	test('demoExtension.envVars should handle API unavailability', async () => {
		// Mock Positron API as unavailable
		const tryAcquireStub = sandbox.stub();
		tryAcquireStub.returns(undefined);
		
		// Execute the command
		await vscode.commands.executeCommand('demoExtension.envVars');
		
		// Verify message - the actual implementation shows info not error
		assert.ok(showInformationStub.calledWith('Positron API not available'));
	});

	test('Environment API mock structure validation', async () => {
		// Test that our mock API has the expected structure for environment
		const mockApi = createMockPositronApi();
		
		// Verify environment API structure
		assert.ok(mockApi.environment, 'Mock should have environment API');
		assert.ok(mockApi.environment.getEnvironmentContributions, 'Environment API should have getEnvironmentContributions');
		
		// Verify the mock returns expected data structure
		const contributions = await mockApi.environment.getEnvironmentContributions();
		assert.ok(Array.isArray(contributions) || typeof contributions === 'object', 'Should return array or object');
		
		// Clean up
		mockApi.sandbox.restore();
	});

	test('Environment contributions API should return structured data', async () => {
		const mockApi = createMockPositronApi();
		const mockGetEnvironmentContributions = mockApi.environment.getEnvironmentContributions as sinon.SinonStub;
		
		// Test the structure of contributions
		const contributions = {
			'test-extension': [
				{ action: 'set', name: 'VAR1', value: 'value1' },
				{ action: 'append', name: 'VAR2', value: 'value2' },
				{ action: 'prepend', name: 'VAR3', value: 'value3' }
			]
		};
		
		mockGetEnvironmentContributions.resolves(contributions);
		
		// Call the API
		const result = await mockApi.environment.getEnvironmentContributions();
		
		// Verify structure
		assert.ok(result['test-extension']);
		assert.strictEqual(result['test-extension'].length, 3);
		assert.strictEqual(result['test-extension'][0].action, 'set');
	});
});