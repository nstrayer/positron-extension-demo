# Positron Extension Demo

This is a demo extension that shows how to use the `@posit-dev/positron` npm package to add custom functionality for the Positron data science IDE.

The extension demonstrates how to:
- Safely detect if running in Positron vs VS Code
- Use Positron-specific APIs like `previewUrl` and `executeCode`
- Maintain compatibility with both Positron and VS Code

## Demo

![Extension running in Positron](running-extension.png)

The screenshot shows the extension running in Positron, demonstrating:
- The "Hello Positron" command execution
- URL preview functionality in the viewer pane
- Code execution in the Python console

## Positron API Features

This extension demonstrates the following Positron APIs from `@posit-dev/positron`:

### `tryAcquirePositronApi()`
- Safely detects if the extension is running in Positron
- Returns the Positron API object or `undefined` if not available

### `positron.window.previewUrl()`
- Opens URLs in Positron's built-in viewer pane
- Provides a seamless way to display web content within the IDE

### `positron.runtime.executeCode()`
- Executes code in the active runtime environment
- Supports multiple languages (Python, R, etc.)
- Allows extensions to interact with the data science workflow

## VS Code Compatibility

The extension uses standard VS Code APIs for basic functionality:

### `vscode` module
- [`commands.registerCommand`](https://code.visualstudio.com/api/references/vscode-api#commands.registerCommand)
- [`window.showInformationMessage`](https://code.visualstudio.com/api/references/vscode-api#window.showInformationMessage)

### Contribution Points
- [`contributes.commands`](https://code.visualstudio.com/api/references/contribution-points#contributes.commands)

## Running the Extension

- Run `npm install` in terminal to install dependencies
- Running the `Run Extension` target in the Debug View. This will:
	- Start a task `npm: watch` to compile the code
	- Run the extension in a new Positron or VS Code window
- Execute the "Hello Positron" command from the Command Palette

## Testing

This extension includes comprehensive tests that demonstrate how to test Positron extensions that work in both Positron and VS Code environments.

### Running Tests

```bash
npm test
```

This runs the full test suite including:
- TypeScript compilation
- ESLint linting
- All unit and integration tests in a VS Code test environment

### Test Architecture

The test suite is organized into two main categories:

#### Integration Tests (`src/test/suite/`)
These tests run in the actual VS Code extension host environment and test:
- Extension activation and command registration
- Real command execution without mocking
- Graceful degradation when Positron APIs are unavailable

**Example:**
```typescript
test('Hello World command should show message when Positron API is not available', async () => {
    const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage');
    await vscode.commands.executeCommand('myExtension.helloWorld');
    assert.ok(showInfoStub.calledWith('Failed to find positron api'));
});
```

#### Unit Tests (`src/test/unit/`)
These tests focus on isolated functionality with comprehensive mocking:
- Individual API method testing
- Mock Positron API responses
- Error handling scenarios

**Example:**
```typescript
test('Window demo functions should handle Positron API correctly', async () => {
    const mockPositronApi = createMockPositronApi();
    // Mock module loading to inject Positron API
    // Test specific functionality in isolation
});
```

### Mock Architecture

#### Positron API Mocking (`src/test/mocks/positronApi.ts`)

The mock provides a complete Positron API surface for testing:

```typescript
{
  runtime: {
    executeCode: stub(),              // Execute code in runtime
    getPreferredRuntime: stub(),      // Get user's preferred language
    // ... more runtime methods
  },
  window: {
    previewUrl: stub(),               // Open URL in viewer pane
    showSimpleModalDialogPrompt: stub(), // Show modal dialogs
    getPlotsRenderSettings: stub(),   // Get plot dimensions
    // ... more window methods
  },
  connections: {
    registerConnectionDriver: stub(), // Register data source drivers
  },
  // ... more API surfaces
}
```

#### VS Code API Mocking

Common VS Code APIs are mocked using Sinon:

```typescript
const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage');
const registerCommandStub = sandbox.stub(vscode.commands, 'registerCommand');
```

### Writing New Tests

#### For Integration Tests:

1. Add test files to `src/test/suite/`
2. Test actual command execution without extensive mocking
3. Focus on end-to-end functionality

```typescript
import * as assert from 'assert';
import * as vscode from 'vscode';

suite('My New Feature Tests', () => {
    test('My command should execute without errors', async () => {
        await assert.doesNotReject(async () => {
            await vscode.commands.executeCommand('myExtension.myCommand');
        });
    });
});
```

#### For Unit Tests:

1. Add test files to `src/test/unit/`
2. Use comprehensive mocking for isolation
3. Test both Positron and VS Code scenarios

```typescript
import * as assert from 'assert';
import * as sinon from 'sinon';
import { createMockPositronApi } from '../mocks/positronApi';

suite('My Feature Unit Tests', () => {
    let sandbox: sinon.SinonSandbox;
    
    setup(() => {
        sandbox = sinon.createSandbox();
    });
    
    teardown(() => {
        sandbox.restore();
    });
    
    test('Should work with Positron API', async () => {
        const mockApi = createMockPositronApi();
        // Mock module loading and test functionality
    });
    
    test('Should work without Positron API', async () => {
        // Test graceful degradation
    });
});
```

### Key Testing Patterns

#### 1. Dual Environment Testing
Always test both scenarios:
- ✅ When Positron API is available
- ✅ When Positron API is not available (VS Code)

#### 2. Module Mocking Pattern
For testing modules that import `@posit-dev/positron`:

```typescript
// Mock the module before importing the code under test
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id: string, ...args: any[]): any {
    if (id === '@posit-dev/positron') {
        return { tryAcquirePositronApi: () => mockPositronApi };
    }
    return originalRequire.apply(this, [id, ...args]);
};

// Clear module cache to ensure fresh import
delete require.cache[require.resolve('../../my-module')];
const myModule = require('../../my-module');
```

#### 3. Command Registration Testing
Test that commands are properly registered:

```typescript
const mockCommands = new Map<string, () => void>();
sandbox.stub(vscode.commands, 'registerCommand').callsFake((command, callback) => {
    mockCommands.set(command, callback);
    return { dispose: () => {} };
});

// Test command execution
const callback = mockCommands.get('myExtension.myCommand')!;
await callback();
```

#### 4. Error Handling Testing
Verify graceful error handling:

```typescript
test('Should handle API errors gracefully', async () => {
    const mockApi = createMockPositronApi();
    (mockApi.window.previewUrl as sinon.SinonStub).rejects(new Error('Network error'));
    
    await assert.doesNotReject(async () => {
        await myFunction();
    });
});
```

### Test Configuration

The test configuration is defined in `.vscode-test.mjs`:

```javascript
export default defineConfig({
    files: 'out/test/**/*.test.js',  // All compiled test files
    version: 'stable',               // VS Code version
    mocha: {
        timeout: 20000,              // 20 second timeout
        color: true,
        ui: 'tdd'                    // Test-driven development style
    },
    launchArgs: [
        '--disable-extensions',      // Faster test runs
        '--new-window'              // Clean environment
    ]
});
```

### Best Practices

1. **Isolation**: Each test should be independent
2. **Comprehensive Mocking**: Mock all external dependencies
3. **Both Environments**: Test with and without Positron API
4. **Graceful Degradation**: Ensure features work in VS Code
5. **Async Handling**: Use async/await for all asynchronous operations
6. **Cleanup**: Always restore mocks in teardown hooks

## Learn More

- [Positron Documentation](https://positron.posit.co/)
- [@posit-dev/positron on npm](https://www.npmjs.com/package/@posit-dev/positron)
- [VS Code Extension Testing](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
