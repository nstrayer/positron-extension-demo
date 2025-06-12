import * as vscode from "vscode";
import { tryAcquirePositronApi } from "@posit-dev/positron";

export function registerRuntimeDemos(context: vscode.ExtensionContext) {
  // Code Execution Demo
  context.subscriptions.push(
    vscode.commands.registerCommand("demoExtension.executeCode", async () => {
      const positronApi = tryAcquirePositronApi();
      if (!positronApi) {
        throw new Error("Positron API not available");
      }

      // Execute code in a runtime with full observation
      const observer = {
        onStarted: () =>
          vscode.window.showInformationMessage("Execution started"),
        onOutput: (message: any) =>
          vscode.window.showInformationMessage("Output:", message),
        onError: (error: any) =>
          vscode.window.showInformationMessage("Error:", error),
        onCompleted: (result: any) =>
          vscode.window.showInformationMessage("Result:", result),
        onFinished: () =>
          vscode.window.showInformationMessage("Execution finished"),
      };

      // Returns a promise that resolves to execution results (MIME data map)
      const result = await positronApi.runtime.executeCode(
        "python",
        'print("Hello")',
        true,
        false,
        undefined,
        undefined,
        observer
      );
      vscode.window.showInformationMessage("Final result:", result); // MIME map with execution outputs
    })
  );

  // Session Management Demo
  context.subscriptions.push(
    vscode.commands.registerCommand("demoExtension.sessionInfo", async () => {
      const positronApi = tryAcquirePositronApi();
      if (!positronApi) return;

      // Get active sessions and work with them
      const sessions = await positronApi.runtime.getActiveSessions();
      const foregroundSession =
        await positronApi.runtime.getForegroundSession();

      // Get variables from a session
      if (foregroundSession) {
        const variables = await positronApi.runtime.getSessionVariables(
          foregroundSession.metadata.sessionId
        );
        // vscode.window.showInformationMessage("Current variables:", variables);
      }

      // Get available runtimes for a language
      const pythonRuntime = await positronApi.runtime.getPreferredRuntime(
        "python"
      );
      if (pythonRuntime) {
        vscode.window.showInformationMessage(
          `Preferred Python runtime: ${pythonRuntime.runtimeName}`
        );
      }

      // // Debug runtime issues by showing output channels
      // if (foregroundSession) {
      //   // List available output channels
      //   const channels = foregroundSession.listOutputChannels?.() || [];
      //   vscode.window.showInformationMessage("Available channels:", channels);
      // }
    })
  );

  // Code Execution Event Listener
  const positronApi = tryAcquirePositronApi();
  if (positronApi) {
    // Listen for code execution events across all runtimes
    context.subscriptions.push(
      positronApi.runtime.onDidExecuteCode((event) => {
        vscode.window.showInformationMessage(
          `Executed ${event.code} in ${event.languageId} via ${event.attribution.source}`
        );
      })
    );
  }
}
