import * as vscode from "vscode";
import { tryAcquirePositronApi } from "@posit-dev/positron";

export function registerWindowDemos(context: vscode.ExtensionContext) {
  // Preview Window Demo
  context.subscriptions.push(
    vscode.commands.registerCommand("demoExtension.previewWindow", async () => {
      const positronApi = tryAcquirePositronApi();
      if (!positronApi) {
        vscode.window.showInformationMessage("Positron API not available");
        return;
      }

      // Preview a local development server
      positronApi.window.previewUrl(vscode.Uri.parse("http://localhost:3000"));

      // Show HTML content from a file
      positronApi.window.previewHtml("/path/to/report.html");

      // Create a custom preview panel with full control
      const panel = positronApi.window.createPreviewPanel(
        "my-extension.preview",
        "My Data Visualization",
        false, // don't preserve focus
        {
          enableScripts: true,
          localResourceRoots: [vscode.Uri.file("/path/to/assets")],
        }
      );
      panel.webview.html = `<html><body><h1>Custom Content</h1></body></html>`;
    })
  );

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
        vscode.window.showInformationMessage(`Console width changed to ${width} characters`);
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