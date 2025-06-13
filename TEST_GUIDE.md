# Testing Guide for Positron Extension Demo

This guide explains the testing architecture for the Positron Extension Demo, which demonstrates how to build extensions that work in both VS Code and Positron IDEs.

## Testing Philosophy

This extension has a unique testing challenge: it must work in two different environments (VS Code and Positron) with different available APIs. Our testing strategy addresses this by:

1. **Mocking the Positron API** - Since tests run in VS Code's test environment, we mock all Positron-specific APIs
2. **Testing both scenarios** - We test both when Positron APIs are available and when they're not
3. **Ensuring graceful degradation** - Commands should work in VS Code even without Positron features

## Test Structure

```
src/test/
├── suite/              # Integration tests that run in VS Code environment
│   ├── index.ts        # Test runner setup (configures Mocha)
│   ├── extension.test.ts   # Tests extension activation and command registration
│   ├── commands.test.ts    # Tests individual command execution
│   └── connections.test.ts # Tests connection provider functionality
├── unit/               # Unit tests for isolated components
│   ├── errorHandling.test.ts  # Tests error handling utilities
│   └── window.test.ts         # Tests window API demos
├── mocks/              # Mock implementations
│   └── positronApi.ts  # Complete mock of @posit-dev/positron API
├── helpers/            # Test utilities
│   └── testUtils.ts    # Common test setup/teardown and VS Code mocks
└── runTest.ts          # VS Code test launcher
```

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### With VS Code UI
1. Open the Command Palette (Cmd+Shift+P)
2. Run "Tasks: Run Test Task"
3. Select "npm: test"

### Debugging Tests
1. Set breakpoints in your test files
2. Go to the Debug view (Cmd+Shift+D)
3. Select "Extension Tests" from the dropdown
4. Press F5 to start debugging

## Writing Tests

### Basic Test Structure

```typescript
import * as assert from 'assert';
import * as vscode from 'vscode';
import { TestUtils } from '../helpers/testUtils';

suite('My Feature Tests', () => {
    let sandbox: sinon.SinonSandbox;

    setup(() => {
        sandbox = TestUtils.setup();
    });

    teardown(() => {
        TestUtils.teardown();
    });

    test('should do something', async () => {
        // Your test logic here
        assert.strictEqual(1 + 1, 2);
    });
});
```

### Testing Commands

```typescript
test('My command should execute', async () => {
    // Mock VS Code API
    const vscodeStubs = TestUtils.mockVSCodeAPI(sandbox);
    
    // Execute command
    await vscode.commands.executeCommand('myExtension.myCommand');
    
    // Verify behavior
    assert.ok(vscodeStubs.showInformationMessage.calledOnce);
});
```

### Testing with Positron API

```typescript
test('Positron feature should work', async () => {
    // Create mock Positron API
    const mockApi = createMockPositronApi();
    
    // Mock the tryAcquirePositronApi function
    const positronModule = require('@posit-dev/positron');
    sandbox.stub(positronModule, 'tryAcquirePositronApi').returns(mockApi);
    
    // Your test logic here
    await vscode.commands.executeCommand('myExtension.positronFeature');
    
    // Verify Positron API was called correctly
    assert.ok(mockApi.runtime.executeCode.calledOnce);
});
```

### Testing Error Scenarios

```typescript
test('should handle missing Positron API gracefully', async () => {
    // Mock tryAcquirePositronApi to return undefined
    const positronModule = require('@posit-dev/positron');
    sandbox.stub(positronModule, 'tryAcquirePositronApi').returns(undefined);
    
    // Execute command that requires Positron
    await vscode.commands.executeCommand('myExtension.positronOnlyFeature');
    
    // Verify error message was shown
    const vscodeStubs = TestUtils.mockVSCodeAPI(sandbox);
    assert.ok(vscodeStubs.showErrorMessage.calledWith('Positron API not available'));
});
```

## Understanding the Mocks

### Why We Mock

Since the tests run in VS Code's test environment (not Positron), we need to mock:

1. **Positron API** - The entire `@posit-dev/positron` module and its APIs
2. **VS Code APIs** - For verifying user interactions (notifications, input boxes, etc.)
3. **Extension Context** - To test command registration and subscription management

### Mock Architecture

#### Positron API Mock (`src/test/mocks/positronApi.ts`)

The mock provides a complete implementation of the Positron API surface:

```typescript
{
  version: '1.0.0',
  
  runtime: {
    executeCode: stub(),              // Execute code in runtime
    getPreferredRuntime: stub(),      // Get user's preferred language
    getActiveSessions: stub(),        // List active runtime sessions
    getForegroundSession: stub(),     // Get current active session
    // ... and more
  },
  
  window: {
    previewUrl: stub(),               // Open URL in viewer pane
    showSimpleModalDialogPrompt: stub(), // Show modal dialogs
    getPlotsRenderSettings: stub(),   // Get plot dimensions
    onDidChangeConsoleWidth: stub(),  // Console width events
    // ... and more
  },
  
  connections: {
    registerConnectionDriver: stub(), // Register data source drivers
    connect: stub()                  // Connect to data sources
  },
  
  methods: {
    lastActiveEditorContext: stub(), // Get editor context
    call: stub(),                   // Call runtime methods
    showQuestion: stub(),           // Show help questions
    showDialog: stub()              // Show help dialogs
  },
  
  environment: {
    getEnvironmentContributions: stub() // Get environment variables
  },
  
  languages: {
    registerStatementRangeProvider: stub(), // Code navigation
    registerHelpTopicProvider: stub()       // Help tooltips
  }
}
```

Each stubbed method can be configured for specific test scenarios:

```typescript
// Configure return values
mockApi.runtime.executeCode.resolves({ success: true, output: '42' });
mockApi.window.previewUrl.rejects(new Error('No viewer available'));

// Verify calls after test
assert.ok(mockApi.runtime.executeCode.calledWith({
  code: 'print(42)',
  focus: true
}));
```

#### VS Code API Mocks (`src/test/helpers/testUtils.ts`)

TestUtils provides mocks for common VS Code APIs:

```typescript
const vscodeStubs = TestUtils.mockVSCodeAPI(sandbox);
// Returns stubs for:
// - showInformationMessage
// - showErrorMessage  
// - showWarningMessage
// - showInputBox
// - showQuickPick
// - createOutputChannel
```

#### Extension Context Mock

A minimal but complete mock of VS Code's ExtensionContext:

```typescript
const mockContext = TestUtils.createMockContext(sandbox);
// Provides:
// - subscriptions[] array for disposables
// - workspaceState and globalState storage
// - Extension paths and URIs
// - Secrets storage
// - All required context properties
```

## Best Practices

1. **Isolation**: Each test should be independent and not rely on state from other tests
2. **Mocking**: Mock external dependencies (VS Code API, Positron API, file system, etc.)
3. **Async/Await**: Use async/await for asynchronous operations
4. **Meaningful Names**: Use descriptive test names that explain what is being tested
5. **Setup/Teardown**: Use setup() and teardown() hooks to initialize and clean up
6. **Assertions**: Use specific assertions (strictEqual vs ok) for better error messages
7. **Test Both Environments**: Always test behavior both with and without Positron API
8. **Verify Graceful Degradation**: Ensure features degrade gracefully in VS Code

### Testing Patterns for Dual-Environment Support

```typescript
suite('My Feature', () => {
    test('should work with Positron API', async () => {
        // Setup mock with Positron API available
        const mockApi = createMockPositronApi();
        sandbox.stub(positronModule, 'tryAcquirePositronApi').returns(mockApi);
        
        // Test Positron-specific functionality
        await vscode.commands.executeCommand('myCommand');
        assert.ok(mockApi.runtime.executeCode.called);
    });
    
    test('should work without Positron API', async () => {
        // Setup mock without Positron API
        sandbox.stub(positronModule, 'tryAcquirePositronApi').returns(undefined);
        
        // Test graceful degradation
        await vscode.commands.executeCommand('myCommand');
        // Should not throw, might show info message
    });
});
```

## Coverage

To check test coverage:

```bash
# Install coverage tool
npm install --save-dev nyc

# Run tests with coverage
npx nyc npm test
```

## Continuous Integration

Example GitHub Actions workflow for running tests:

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm test
```

## Test Configuration Details

### Mocha Configuration

The project uses Mocha with TDD (Test Driven Development) style:
- **UI Style**: TDD (`suite`, `test`, `setup`, `teardown`)
- **Timeout**: 20 seconds per test
- **Test Discovery**: Globs for `**/*.test.js` in compiled output

### VS Code Test Configuration (`.vscode-test.mjs`)

```javascript
{
  files: 'out/test/**/*.test.js',
  version: 'stable',
  mocha: {
    timeout: 20000,
    color: true,
    ui: 'tdd'  // Matches our test style
  },
  launchArgs: [
    '--disable-extensions',  // Isolate from other extensions
    '--new-window'          // Fresh window for each test run
  ]
}
```

## Troubleshooting

### Tests not found
- Ensure test files end with `.test.ts`
- Check that TypeScript compilation succeeded (`npm run compile`)
- Verify the test glob pattern in `.vscode-test.mjs`
- Check that test files use correct TDD style (`suite`, `test`)

### Mock not working
- Make sure to stub before the code under test runs
- Verify you're mocking the correct module path
- Check that sandbox.restore() is called in teardown
- For Positron API, ensure you're stubbing `tryAcquirePositronApi` from the module

### Positron API not available in tests
- This is expected! Tests run in VS Code, not Positron
- Always mock the Positron API using `createMockPositronApi()`
- Test both scenarios (with and without API)

### Command not found errors
- Ensure the extension is activated before running commands
- Check that commands are registered in `package.json`
- Verify command IDs match between code and tests

### Async issues
- Always use async/await for asynchronous operations
- Set appropriate timeouts for long-running operations
- Use TestUtils.waitFor() for polling conditions
- Remember that many VS Code and Positron APIs are asynchronous