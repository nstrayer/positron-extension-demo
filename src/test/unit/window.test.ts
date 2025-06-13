import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { createMockPositronApi } from '../mocks/positronApi';

suite('Window API Demo Tests', () => {
	let sandbox: sinon.SinonSandbox;

	setup(() => {
		sandbox = sinon.createSandbox();
	});

	teardown(() => {
		sandbox.restore();
	});

	test('Window demo functions should handle Positron API correctly', async () => {
		// Test the window demo functionality in complete isolation
		const mockPositronApi = createMockPositronApi();
		
		// Mock vscode.window methods
		const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage');
		
		// Create separate mocks for command and event registration
		const mockCommands = new Map<string, () => void | Promise<void>>();
		const mockEventListeners: { dispose: () => void }[] = [];
		
		// Mock command registration to capture registrations
		const registerCommandStub = sandbox.stub(vscode.commands, 'registerCommand');
		registerCommandStub.callsFake((command: string, callback: () => void | Promise<void>) => {
			mockCommands.set(command, callback);
			return { dispose: () => {} };
		});
		
		// Create mock context that captures all subscriptions
		const mockSubscriptions: vscode.Disposable[] = [];
		const mockContext = {
			subscriptions: {
				push: (disposable: vscode.Disposable) => {
					mockSubscriptions.push(disposable);
				}
			}
		} as unknown as vscode.ExtensionContext;
		
		// Mock the Positron API module
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const Module = require('module');
		const originalRequire = Module.prototype.require;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		Module.prototype.require = function(id: string, ...args: any[]): any {
			if (id === '@posit-dev/positron') {
				return { tryAcquirePositronApi: () => mockPositronApi };
			}
			return originalRequire.apply(this, [id, ...args]);
		};
		
		try {
			// Clear cache and import fresh
			delete require.cache[require.resolve('../../demos/window')];
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const windowModule = require('../../demos/window');
			
			// Register the demos
			windowModule.registerWindowDemos(mockContext);
			
			// Should register 3 items: 2 commands + 1 event listener
			assert.strictEqual(mockSubscriptions.length, 3, 'Should register 3 items');
			
			// Verify commands were registered
			assert.ok(mockCommands.has('demoExtension.dialogDemo'), 'Dialog demo command should be registered');
			assert.ok(mockCommands.has('demoExtension.plotSettings'), 'Plot settings command should be registered');
			
			// Test dialog demo execution
			const dialogCallback = mockCommands.get('demoExtension.dialogDemo')!;
			await dialogCallback();
			
			// Verify the modal dialog was called
			const showDialogStub = mockPositronApi.window.showSimpleModalDialogPrompt as sinon.SinonStub;
			assert.ok(showDialogStub.calledOnce, 'Should call showSimpleModalDialogPrompt');
			assert.ok(
				showDialogStub.calledWith(
					'Delete Data',
					'Are you sure you want to delete this dataset?',
					'Delete',
					'Cancel'
				),
				'Should call with correct parameters'
			);
			
			// Verify the info message was shown
			assert.ok(
				showInfoStub.calledWith('User chose to delete'),
				'Should show confirmation message'
			);
			
			// Test plot settings demo
			showInfoStub.reset();
			const plotCallback = mockCommands.get('demoExtension.plotSettings')!;
			await plotCallback();
			
			// Verify the plot settings were retrieved
			const getPlotSettingsStub = mockPositronApi.window.getPlotsRenderSettings as sinon.SinonStub;
			assert.ok(getPlotSettingsStub.calledOnce, 'Should call getPlotsRenderSettings');
			
			// Verify the info message was shown with correct dimensions
			assert.ok(
				showInfoStub.calledWith('Render plots at 800x600'),
				'Should show plot dimensions'
			);
			
			// Verify event listener was registered
			const onConsoleWidthStub = mockPositronApi.window.onDidChangeConsoleWidth as sinon.SinonStub;
			assert.ok(onConsoleWidthStub.calledOnce, 'Should register console width change listener');
			
		} finally {
			// Restore require
			Module.prototype.require = originalRequire;
			mockPositronApi.sandbox.restore();
		}
	});

	test('Window demos should handle missing Positron API gracefully', async () => {
		// Mock vscode.window methods
		const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage');
		
		// Create separate mocks for command registration
		const mockCommands = new Map<string, () => void | Promise<void>>();
		
		// Mock command registration to capture registrations
		const registerCommandStub = sandbox.stub(vscode.commands, 'registerCommand');
		registerCommandStub.callsFake((command: string, callback: () => void | Promise<void>) => {
			mockCommands.set(command, callback);
			return { dispose: () => {} };
		});
		
		// Create mock context that captures all subscriptions
		const mockSubscriptions: vscode.Disposable[] = [];
		const mockContext = {
			subscriptions: {
				push: (disposable: vscode.Disposable) => {
					mockSubscriptions.push(disposable);
				}
			}
		} as unknown as vscode.ExtensionContext;
		
		// Mock the Positron API module to return undefined
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const Module = require('module');
		const originalRequire = Module.prototype.require;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		Module.prototype.require = function(id: string, ...args: any[]): any {
			if (id === '@posit-dev/positron') {
				return { tryAcquirePositronApi: () => undefined };
			}
			return originalRequire.apply(this, [id, ...args]);
		};
		
		try {
			// Clear cache and import fresh
			delete require.cache[require.resolve('../../demos/window')];
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const windowModule = require('../../demos/window');
			
			// Register the demos
			windowModule.registerWindowDemos(mockContext);
			
			// Should only register 2 commands (no event listener without API)
			assert.strictEqual(mockSubscriptions.length, 2, 'Should only register 2 commands');
			
			// Verify commands were still registered
			assert.ok(mockCommands.has('demoExtension.dialogDemo'), 'Dialog demo command should be registered');
			assert.ok(mockCommands.has('demoExtension.plotSettings'), 'Plot settings command should be registered');
			
			// Test that commands handle missing API gracefully
			const dialogCallback = mockCommands.get('demoExtension.dialogDemo')!;
			
			// Execute should not throw
			await assert.doesNotReject(async () => {
				await dialogCallback();
			}, 'Dialog demo should not throw without API');
			
			// No info message should be shown (command returns early)
			assert.ok(!showInfoStub.called, 'Should not show any message when API is missing');
			
		} finally {
			// Restore require
			Module.prototype.require = originalRequire;
		}
	});
});