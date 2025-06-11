import * as vscode from "vscode";
import { tryAcquirePositronApi } from "@posit-dev/positron";

export function registerPreviewDemoCommand(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("demoExtension.previewWindow", async () => {
      const positron = tryAcquirePositronApi();

      if (positron === undefined) {
        vscode.window.showInformationMessage("Failed to find positron api");
        return;
      }

      // Show a confirmation dialog
      const choseWorld = await positron.window.showSimpleModalDialogPrompt(
        "Message",
        `To what do you wish to say "Hello?"`,
        "World",
        "Positron"
      );

      // Create a custom preview panel with full control
      const panel = positron.window.createPreviewPanel(
        "my-extension.preview",
        "My Data Visualization",
        false, // don't preserve focus
        {
          enableScripts: true,
          localResourceRoots: [vscode.Uri.file("/path/to/assets")],
        }
      );
      panel.webview.html = `<html><body><h1>Hello ${
        choseWorld ? "World" : "Positron"
      }</h1></body></html>`;
    })
  );
}
