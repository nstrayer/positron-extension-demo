import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { createMockPositronApi } from '../mocks/positronApi';

/**
 * Test utilities for VSCode/Positron extension testing
 */
export class TestUtils {
	private static sandbox: sinon.SinonSandbox;

	/**
	 * Setup test environment before each test
	 */
	static setup(): sinon.SinonSandbox {
		this.sandbox = sinon.createSandbox();
		return this.sandbox;
	}

	/**
	 * Cleanup test environment after each test
	 */
	static teardown(): void {
		if (this.sandbox) {
			this.sandbox.restore();
		}
	}

	/**
	 * Wait for extension to activate
	 */
	static async activateExtension(extensionId: string): Promise<vscode.Extension<unknown>> {
		const extension = vscode.extensions.getExtension(extensionId);
		if (!extension) {
			throw new Error(`Extension ${extensionId} not found`);
		}
		
		if (!extension.isActive) {
			await extension.activate();
		}
		
		return extension;
	}

	/**
	 * Mock VS Code API methods
	 */
	static mockVSCodeAPI(sandbox: sinon.SinonSandbox) {
		return {
			showInformationMessage: sandbox.stub(vscode.window, 'showInformationMessage'),
			showErrorMessage: sandbox.stub(vscode.window, 'showErrorMessage'),
			showWarningMessage: sandbox.stub(vscode.window, 'showWarningMessage'),
			showInputBox: sandbox.stub(vscode.window, 'showInputBox'),
			showQuickPick: sandbox.stub(vscode.window, 'showQuickPick'),
			createOutputChannel: sandbox.stub(vscode.window, 'createOutputChannel' as keyof typeof vscode.window).returns({
				name: 'Test Channel',
				append: sandbox.stub(),
				appendLine: sandbox.stub(),
				clear: sandbox.stub(),
				show: sandbox.stub(),
				hide: sandbox.stub(),
				dispose: sandbox.stub(),
				replace: sandbox.stub()
			} as unknown as vscode.OutputChannel) as sinon.SinonStub
		};
	}

	/**
	 * Create a mock extension context for testing
	 */
	static createMockContext(sandbox: sinon.SinonSandbox): vscode.ExtensionContext {
		return {
			subscriptions: [],
			workspaceState: {
				get: sandbox.stub(),
				update: sandbox.stub().resolves()
			},
			globalState: {
				get: sandbox.stub(),
				update: sandbox.stub().resolves(),
				setKeysForSync: sandbox.stub()
			},
			extensionPath: '/mock/extension/path',
			extensionUri: vscode.Uri.file('/mock/extension/path'),
			environmentVariableCollection: {} as vscode.EnvironmentVariableCollection,
			extensionMode: vscode.ExtensionMode.Test,
			storageUri: vscode.Uri.file('/mock/storage'),
			globalStorageUri: vscode.Uri.file('/mock/global/storage'),
			logUri: vscode.Uri.file('/mock/logs'),
			secrets: {
				get: sandbox.stub().resolves(undefined),
				store: sandbox.stub().resolves(),
				delete: sandbox.stub().resolves(),
				onDidChange: new vscode.EventEmitter<vscode.SecretStorageChangeEvent>().event
			},
			asAbsolutePath: (relativePath: string) => `/mock/extension/path/${relativePath}`,
			storagePath: '/mock/storage',
			globalStoragePath: '/mock/global/storage',
			logPath: '/mock/logs',
			extension: {} as vscode.Extension<unknown>,
			languageModelAccessInformation: {
				onDidChange: new vscode.EventEmitter<void>().event,
				canSendRequest: sandbox.stub().returns(true)
			}
		} as unknown as vscode.ExtensionContext;
	}

	/**
	 * Wait for a condition to be true
	 */
	static async waitFor(condition: () => boolean, timeout = 5000): Promise<void> {
		const start = Date.now();
		while (!condition()) {
			if (Date.now() - start > timeout) {
				throw new Error('Timeout waiting for condition');
			}
			await new Promise(resolve => setTimeout(resolve, 100));
		}
	}

	/**
	 * Execute a command and wait for result
	 */
	static async executeCommand(command: string, ...args: unknown[]): Promise<unknown> {
		return vscode.commands.executeCommand(command, ...args);
	}
}