import * as vscode from "vscode";
import { tryAcquirePositronApi } from "@posit-dev/positron";

export function registerWindowDemos(context: vscode.ExtensionContext) {
  // Dialog Demo
  context.subscriptions.push(
    vscode.commands.registerCommand("demoExtension.dialogDemo", async () => {
      const positronApi = tryAcquirePositronApi();
      if (!positronApi) return;

      // Show a confirmation dialog
      const confirmed = await positronApi.window.showSimpleModalDialogPrompt(
        "Delete Data",
        "Are you sure you want to delete this dataset?",
        "Delete", // Returns true
        "Cancel" // Returns false
      );

      vscode.window.showInformationMessage(
        confirmed ? "User chose to delete" : "User cancelled"
      );
    })
  );

  // Console Width Listener
  const positronApi = tryAcquirePositronApi();
  if (positronApi) {
    // Listen for console width changes to optimize output formatting
    context.subscriptions.push(
      positronApi.window.onDidChangeConsoleWidth((width) => {
        vscode.window.showInformationMessage(
          `Console width changed to ${width} characters`
        );
        // Adjust your output formatting accordingly
      })
    );
  }

  // Plot Settings Demo
  context.subscriptions.push(
    vscode.commands.registerCommand("demoExtension.plotSettings", async () => {
      const positronApi = tryAcquirePositronApi();
      if (!positronApi) return;

      // Get plot rendering settings for custom visualizations
      const plotSettings = await positronApi.window.getPlotsRenderSettings();
      vscode.window.showInformationMessage(
        `Render plots at ${plotSettings.size.width}x${plotSettings.size.height}`
      );
    })
  );
}
