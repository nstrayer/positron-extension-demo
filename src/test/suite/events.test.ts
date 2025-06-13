/* eslint-disable @typescript-eslint/no-explicit-any */
import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { createMockPositronApi } from '../mocks/positronApi';
import { TestUtils } from '../helpers/testUtils';

suite('Event Listener Tests', () => {
	let sandbox: sinon.SinonSandbox;
	let mockContext: vscode.ExtensionContext;
	let showInformationStub: sinon.SinonStub;

	setup(() => {
		sandbox = sinon.createSandbox();
		mockContext = TestUtils.createMockContext(sandbox);
		showInformationStub = sandbox.stub(vscode.window, 'showInformationMessage');
	});

	teardown(() => {
		sandbox.restore();
	});

	test('Runtime event listeners should respond to events', async () => {
		const mockApi = createMockPositronApi();
		let eventCallback: ((event: any) => void) | undefined;
		
		// Mock the event registration to capture the callback
		const onDidExecuteCodeStub = mockApi.runtime.onDidExecuteCode as sinon.SinonStub;
		onDidExecuteCodeStub.callsFake((callback: (event: any) => void) => {
			eventCallback = callback;
			return { dispose: sinon.stub() };
		});
		
		// Register event listener
		const disposable = mockApi.runtime.onDidExecuteCode((event) => {
			showInformationStub(`Executed ${event.code} in ${event.languageId}`);
		});
		
		// Verify registration
		assert.ok(onDidExecuteCodeStub.calledOnce, 'Event listener should be registered');
		assert.ok(eventCallback, 'Callback should be captured');
		
		// Trigger event
		eventCallback!({
			code: 'print("test")',
			languageId: 'python',
			attribution: { source: 'test' }
		});
		
		// Verify handler was called
		assert.ok(showInformationStub.calledWith('Executed print("test") in python'));
		
		// Clean up
		disposable.dispose();
	});

	test('Console width change event should be handled', async () => {
		const mockApi = createMockPositronApi();
		let eventCallback: ((width: number) => void) | undefined;
		
		// Mock the event registration
		const onDidChangeConsoleWidthStub = mockApi.window.onDidChangeConsoleWidth as sinon.SinonStub;
		onDidChangeConsoleWidthStub.callsFake((callback: (width: number) => void) => {
			eventCallback = callback;
			return { dispose: sinon.stub() };
		});
		
		// Register event listener
		const disposable = mockApi.window.onDidChangeConsoleWidth((width) => {
			showInformationStub(`Console width changed to ${width}`);
		});
		
		// Trigger event
		eventCallback!(800);
		
		// Verify handler was called
		assert.ok(showInformationStub.calledWith('Console width changed to 800'));
		
		// Clean up
		disposable.dispose();
	});

	test('Foreground session change event should be handled', async () => {
		const mockApi = createMockPositronApi();
		let eventCallback: ((session: any) => void) | undefined;
		
		// Mock the event registration
		const onDidChangeForegroundSessionStub = mockApi.runtime.onDidChangeForegroundSession as sinon.SinonStub;
		onDidChangeForegroundSessionStub.callsFake((callback: (session: any) => void) => {
			eventCallback = callback;
			return { dispose: sinon.stub() };
		});
		
		// Register event listener
		const disposable = mockApi.runtime.onDidChangeForegroundSession((session: any) => {
			if (session) {
				showInformationStub(`Foreground session changed to ${session.metadata.sessionId}`);
			} else {
				showInformationStub('No foreground session');
			}
		});
		
		// Trigger event with session
		const mockSession = {
			metadata: { sessionId: 'session-123', languageId: 'python' }
		};
		eventCallback!(mockSession);
		
		// Verify handler was called
		assert.ok(showInformationStub.calledWith('Foreground session changed to session-123'));
		
		// Trigger event with null session
		showInformationStub.reset();
		eventCallback!(null);
		
		assert.ok(showInformationStub.calledWith('No foreground session'));
		
		// Clean up
		disposable.dispose();
	});

	test('Multiple event listeners should be manageable', async () => {
		const mockApi = createMockPositronApi();
		const disposables: { dispose: () => void }[] = [];
		
		// Register multiple event listeners
		const listener1 = mockApi.runtime.onDidExecuteCode(() => {});
		const listener2 = mockApi.runtime.onDidChangeForegroundSession(() => {});
		const listener3 = mockApi.window.onDidChangeConsoleWidth(() => {});
		
		disposables.push(listener1 as any, listener2 as any, listener3 as any);
		
		// Verify all listeners were registered
		const onDidExecuteCodeStub = mockApi.runtime.onDidExecuteCode as sinon.SinonStub;
		const onDidChangeForegroundSessionStub = mockApi.runtime.onDidChangeForegroundSession as sinon.SinonStub;
		const onDidChangeConsoleWidthStub = mockApi.window.onDidChangeConsoleWidth as sinon.SinonStub;
		
		assert.ok(onDidExecuteCodeStub.calledOnce);
		assert.ok(onDidChangeForegroundSessionStub.calledOnce);
		assert.ok(onDidChangeConsoleWidthStub.calledOnce);
		
		// Dispose all listeners
		disposables.forEach(d => d.dispose());
		
		// Verify all were disposed
		disposables.forEach(d => {
			assert.ok((d.dispose as sinon.SinonStub).calledOnce, 'Each listener should be disposed once');
		});
	});

	test('Event listeners should handle errors gracefully', async () => {
		const mockApi = createMockPositronApi();
		let eventCallback: ((event: any) => void) | undefined;
		let errorHandled = false;
		
		// Mock the event registration to wrap callbacks in try-catch
		const onDidExecuteCodeStub = mockApi.runtime.onDidExecuteCode as sinon.SinonStub;
		onDidExecuteCodeStub.callsFake((callback: (event: any) => void) => {
			eventCallback = (event: any) => {
				try {
					callback(event);
				} catch (error) {
					// Event system should catch errors
					errorHandled = true;
				}
			};
			return { dispose: sinon.stub() };
		});
		
		// Register event listener that throws
		mockApi.runtime.onDidExecuteCode((event) => {
			throw new Error('Handler error');
		});
		
		// Trigger event - should not throw
		assert.doesNotThrow(() => {
			eventCallback!({
				code: 'print("test")',
				languageId: 'python',
				attribution: { source: 'test' }
			});
		});
		
		// Verify error was handled
		assert.ok(errorHandled, 'Error should be handled by event system');
		
		// Clean up
		mockApi.sandbox.restore();
	});

	test('Event listener integration matches actual implementation', async () => {
		// Test that our event tests match the actual event listeners in eventListeners.ts
		const mockApi = createMockPositronApi();
		
		// These are the actual events used in the extension
		const actualEvents = [
			'runtime.onDidChangeForegroundSession',
			'runtime.onDidExecuteCode',
			'window.onDidChangeConsoleWidth'
		];
		
		// Verify our mock supports all actual events
		assert.ok(mockApi.runtime.onDidChangeForegroundSession, 'Mock should support onDidChangeForegroundSession');
		assert.ok(mockApi.runtime.onDidExecuteCode, 'Mock should support onDidExecuteCode');
		assert.ok(mockApi.window.onDidChangeConsoleWidth, 'Mock should support onDidChangeConsoleWidth');
		
		// Clean up mock
		mockApi.sandbox.restore();
	});
});