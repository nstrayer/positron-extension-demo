import * as sinon from 'sinon';
import { PositronApi, tryAcquirePositronApi } from '@posit-dev/positron';

/**
 * Creates a mock Positron API for testing purposes
 */
export function createMockPositronApi(options?: {
	failureMode?: 'network' | 'permission' | 'runtime-missing';
}): PositronApi & { sandbox: sinon.SinonSandbox } {
	const sandbox = sinon.createSandbox();

	const mockApi = {
		version: '1.0.0',
		
		runtime: {
			executeCode: sandbox.stub().resolves({ 'text/plain': 'Execution completed' }),
			getPreferredRuntime: sandbox.stub().resolves({
				runtimeId: 'python-3.9',
				runtimeName: 'Python 3.9',
				languageId: 'python',
				runtimePath: '/usr/bin/python3'
			}),
			registerLanguageRuntimeManager: sandbox.stub(),
			getRegisteredRuntimes: sandbox.stub().resolves([]),
			startLanguageRuntime: sandbox.stub().resolves(),
			restartSession: sandbox.stub().resolves(),
			startNewSession: sandbox.stub().resolves(),
			selectSession: sandbox.stub().resolves(),
			getSessions: sandbox.stub().resolves([
				{ sessionId: 'session-1', languageId: 'python', state: 'idle' },
				{ sessionId: 'session-2', languageId: 'r', state: 'busy' }
			]),
			foregroundSession: sandbox.stub().resolves({
				sessionId: 'session-1',
				languageId: 'python',
				state: 'idle'
			}),
			getActiveSessions: sandbox.stub().resolves([
				{ sessionId: 'session-1', languageId: 'python', state: 'idle' }
			]),
			getForegroundSession: sandbox.stub().resolves({
				metadata: { sessionId: 'session-1', languageId: 'python' },
				state: 'idle'
			}),
			getSessionVariables: sandbox.stub().resolves([
				{ name: 'x', value: '42', type: 'int' },
				{ name: 'df', value: '<DataFrame>', type: 'pandas.DataFrame' }
			]),
			// Events
			onDidChangeRuntimeState: sandbox.stub(),
			onDidChangeActiveRuntime: sandbox.stub(),
			onDidExecuteCode: sandbox.stub().returns({ dispose: sandbox.stub() }),
			onDidChangeForegroundSession: sandbox.stub().returns({ dispose: sandbox.stub() })
		},

		window: {
			showSimpleModalDialogMessage: sandbox.stub().resolves(),
			showSimpleModalDialogPrompt: sandbox.stub().resolves(true),
			previewUrl: sandbox.stub().resolves(),
			previewHtml: sandbox.stub().resolves(),
			createPreviewPanel: sandbox.stub().returns({
				proxy: {},
				webview: {
					html: '',
					asWebviewUri: sandbox.stub()
				},
				onDidReceiveMessage: sandbox.stub(),
				postMessage: sandbox.stub(),
				dispose: sandbox.stub()
			}),
			getGettingStartedUri: sandbox.stub().returns(undefined),
			onDidChangeConsoleWidth: sandbox.stub().returns({ dispose: sandbox.stub() }),
			getPlotsRenderSettings: sandbox.stub().resolves({
				size: { width: 800, height: 600 },
				pixelRatio: 2,
				fontScale: 1
			})
		},

		languages: {
			registerStatementRangeProvider: sandbox.stub().returns({ dispose: sandbox.stub() }),
			registerHelpTopicProvider: sandbox.stub().returns({ dispose: sandbox.stub() })
		},


		connections: {
			registerConnectionDriver: sandbox.stub().returns({ dispose: sandbox.stub() }),
			connect: sandbox.stub().resolves()
		},

		methods: {
			lastActiveEditorContext: sandbox.stub().resolves({
				document: { 
					uri: { path: '/workspace/test.py', scheme: 'file' },
					languageId: 'python',
					version: 1
				},
				selection: { 
					active: { line: 10, character: 5 },
					anchor: { line: 10, character: 0 },
					start: { line: 10, character: 0 },
					end: { line: 10, character: 5 },
					isEmpty: false
				}
			}),
			call: sandbox.stub().resolves({ 
				result: 'Method executed successfully',
				data: { status: 'ok', value: 42 }
			}),
			showQuestion: sandbox.stub().resolves(true),
			showDialog: sandbox.stub().resolves({ 
				action: 'ok',
				selectedOption: 0
			})
		},

		environment: {
			getEnvironmentContributions: sandbox.stub().resolves({
				'test-extension': [
					{ action: 'set', name: 'TEST_VAR', value: 'test_value' },
					{ action: 'append', name: 'PATH', value: '/test/bin' }
				]
			})
		}
	};

	// Apply failure modes if specified
	if (options?.failureMode) {
		switch (options.failureMode) {
			case 'network':
				// Network errors for API calls
				mockApi.runtime.executeCode = sandbox.stub().rejects(new Error('Network error: Unable to connect to runtime'));
				mockApi.methods.call = sandbox.stub().rejects(new Error('Network error: Connection timeout'));
				mockApi.connections.connect = sandbox.stub().rejects(new Error('Network error: Failed to establish connection'));
				break;
				
			case 'permission':
				// Permission errors
				mockApi.runtime.executeCode = sandbox.stub().rejects(new Error('Permission denied: Insufficient privileges'));
				mockApi.environment.getEnvironmentContributions = sandbox.stub().rejects(new Error('Permission denied: Cannot access environment'));
				mockApi.runtime.startLanguageRuntime = sandbox.stub().rejects(new Error('Permission denied: Cannot start runtime'));
				break;
				
			case 'runtime-missing':
				// Runtime not available errors
				mockApi.runtime.getForegroundSession = sandbox.stub().resolves(null);
				mockApi.runtime.getPreferredRuntime = sandbox.stub().resolves(null);
				mockApi.runtime.getActiveSessions = sandbox.stub().resolves([]);
				mockApi.runtime.executeCode = sandbox.stub().rejects(new Error('No active runtime session'));
				break;
		}
	}

	// Add sandbox to the mock for cleanup
	return {
		...mockApi,
		sandbox
	} as unknown as PositronApi & { sandbox: sinon.SinonSandbox };
}

/**
 * Helper to mock the tryAcquirePositronApi function
 */
export function mockTryAcquirePositronApi(mockApi: PositronApi | undefined) {
	// Mock the module exports
	const positronModule = { tryAcquirePositronApi };
	sinon.stub(positronModule, 'tryAcquirePositronApi').returns(mockApi);
	return positronModule;
}