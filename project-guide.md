# Positron Extension Demo - Project Guide

This document lists all the features and commands available in this demo extension, how to run them, and what they demonstrate.

## Commands Available via Command Palette

### 1. **Hello Positron** (`myExtension.helloWorld`)

**How to run:** Command Palette → "Hello Positron"  
**What it does:**

- Opens the Positron website in the viewer pane
- Executes Python code: `print("Hello Positron from the extension")`
- Demonstrates basic Positron API usage and dual-environment compatibility
- Falls back to showing an info message if Positron API is not available

### 2. **Preview Window Please** (`demoExtension.previewWindow`)

**How to run:** Command Palette → "Preview Window Please"  
**What it does:**

- Shows a modal dialog asking "Hello to World or Positron?"
- Creates a custom preview panel with HTML content
- Displays "Hello World" or "Hello Positron" based on user choice
- Demonstrates modal dialogs and custom webview panels

### 3. **Register demo connection** (`demoExtension.registerDriver`)

**How to run:** Command Palette → "Register demo connection"  
**What it does:**

- Registers a "Mock Database" connection driver for Python
- Adds a connection type that appears in Positron's Connections pane
- When used, generates Python code to create a mock database connection
- Demonstrates how to extend Positron's data connection system

### 4. **Positron Dialog Demo** (`demoExtension.dialogDemo`)

**How to run:** Command Palette → "Positron Dialog Demo"  
**What it does:**

- Shows a confirmation dialog: "Are you sure you want to delete this dataset?"
- Has "Delete" and "Cancel" buttons
- Shows result message based on user choice
- Demonstrates modal confirmation dialogs

### 5. **Positron Plot Settings Demo** (`demoExtension.plotSettings`)

Note: errors with `Unknown actor MainThreadPlotsService`

**How to run:** Command Palette → "Positron Plot Settings Demo"  
**What it does:**

- Retrieves current plot rendering settings from Positron
- Shows plot dimensions (e.g., "Render plots at 800x600")
- Demonstrates how to get plot configuration for custom visualizations

### 6. **Execute Code Demo** (`demoExtension.executeCode`)

**How to run:** Command Palette → Search for "Execute Code Demo"  
**What it does:**

- Executes Python code: `print("Hello")`
- Shows full execution lifecycle with observer pattern:
  - "Execution started"
  - Output messages
  - Error handling
  - Completion results
  - "Execution finished"
- Demonstrates comprehensive runtime interaction

### 7. **Session Info Demo** (`demoExtension.sessionInfo`)

**How to run:** Command Palette → Search for "Session Info Demo"  
**What it does:**

- Shows active runtime sessions
- Displays foreground session information
- Lists session variables
- Shows preferred runtime
- Demonstrates runtime session management

### 8. **Methods Demo** (`demoExtension.methodsDemo`)

**How to run:** Command Palette → Search for "Methods Demo"  
**What it does:**

- Gets current editor context (file path and selection)
- Calls frontend methods with parameters
- Shows confirmation dialog: "Do you want to proceed?"
- Shows information dialog: "Operation completed successfully!"
- Demonstrates bidirectional communication with Positron frontend

### 9. **Environment Variables Demo** (`demoExtension.envVars`)

**How to run:** Command Palette → Search for "Environment Variables Demo"  
**What it does:**

- Retrieves all environment variable contributions from extensions
- Shows which extensions contribute environment variables
- Displays variable names, values, and actions (set/unset)
- Demonstrates environment management integration

## Automatic Registrations (No Commands Required)

### 10. **Language Providers**

**What it does:**

- Registers a `StatementRangeProvider` for language "mylang"
- Registers a `HelpTopicProvider` for language "mylang"
- Enables Positron to understand statement boundaries in custom languages
- Provides context-sensitive help topics
- Demonstrates language server integration

### 11. **Event Listeners**

**What it does:**

- Automatically listens for code execution events across all runtimes
- Monitors console width changes for responsive output formatting
- Shows notifications when events occur
- Demonstrates reactive programming with Positron events

### 12. **Console Width Monitoring**

**What it does:**

- Automatically monitors console width changes
- Shows notification: "Console width changed to X characters"
- Helps extensions adapt output formatting to console size
- Demonstrates responsive UI design

## How to Test Everything

1. **Install and activate the extension:**

   ```bash
   npm install
   F5 (or "Run Extension" in Debug view)
   ```

2. **Open Command Palette:** `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)

3. **Try each command** listed above by typing its title

4. **For best results:**
   - Test in Positron to see full functionality
   - Test in VS Code to see graceful degradation
   - Have a Python runtime active for execution demos

## API Areas Demonstrated

- **Window Management**: Dialogs, viewer panes, plot settings, console monitoring
- **Runtime Execution**: Code execution, session management, event observation
- **Connection System**: Custom data source drivers
- **Language Support**: Statement ranges, help providers
- **Environment**: Variable contributions and management
- **Methods**: Frontend communication, editor context
- **Events**: Runtime and UI event handling
- **Dual Environment**: VS Code compatibility throughout

Each feature shows how to safely detect Positron vs VS Code and provide appropriate functionality in both environments.
