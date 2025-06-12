import * as vscode from "vscode";
import { tryAcquirePositronApi } from "@posit-dev/positron";

export function registerEventListeners(context: vscode.ExtensionContext) {
  const positronApi = tryAcquirePositronApi();

  if (positronApi) {
    // Listen for runtime changes
    const runtimeSub = positronApi.runtime.onDidChangeForegroundSession(
      (sessionId) => {
        vscode.window.showInformationMessage(`Active runtime changed to: ${sessionId}`);
        // Update your extension's state
      }
    );

    // Listen for code execution
    const executionSub = positronApi.runtime.onDidExecuteCode((event) => {
      if (event.attribution.source === "extension") {
        // React to code executed by extensions
        vscode.window.showInformationMessage(`Extension executed: ${event.code}`);
      }
    });

    // Listen for UI changes
    const uiSub = positronApi.window.onDidChangeConsoleWidth((width) => {
      // Adapt your output to the console width
      adjustOutputFormatting(width);
    });

    context.subscriptions.push(runtimeSub, executionSub, uiSub);
  }
}

function adjustOutputFormatting(width: number) {
  // Implementation for adjusting output formatting
  vscode.window.showInformationMessage(`Adjusting output for width: ${width}`);
}