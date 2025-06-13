import * as sinon from 'sinon';
import { PositronApi, tryAcquirePositronApi } from '@posit-dev/positron';

/**
 * Creates a mock Positron API for testing purposes
 */
export function createMockPositronApi(): PositronApi & { sandbox: sinon.SinonSandbox } {
	const sandbox = sinon.createSandbox();

	const mockApi = {
		version: '1.0.0',
		
		runtime: {
			executeCode: sandbox.stub().resolves({ success: true }),
			getPreferredRuntime: sandbox.stub().resolves('python'),
			registerLanguageRuntimeManager: sandbox.stub(),
			getRegisteredRuntimes: sandbox.stub().resolves([]),
			startLanguageRuntime: sandbox.stub().resolves(),
			restartSession: sandbox.stub().resolves(),
			startNewSession: sandbox.stub().resolves(),
			selectSession: sandbox.stub().resolves(),
			getSessions: sandbox.stub().resolves([]),
			foregroundSession: sandbox.stub().resolves(),
			getActiveSessions: sandbox.stub().resolves([]),
			getForegroundSession: sandbox.stub().resolves(null),
			getSessionVariables: sandbox.stub().resolves([]),
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
				document: { uri: { path: '/test.py' } },
				selection: { active: { line: 0, character: 0 } }
			}),
			call: sandbox.stub().resolves({ result: 'test result' }),
			showQuestion: sandbox.stub().resolves(true),
			showDialog: sandbox.stub().resolves({ action: 'ok' })
		},

		environment: {
			getEnvironmentContributions: sandbox.stub().resolves([])
		}
	};

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