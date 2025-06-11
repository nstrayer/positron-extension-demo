import * as vscode from "vscode";
import { tryAcquirePositronApi } from "@posit-dev/positron";

export function registerMethodsDemos(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("demoExtension.methodsDemo", async () => {
      const positronApi = tryAcquirePositronApi();
      if (!positronApi) {
        throw new Error("Positron API not available");
      }

      // Get the current editor context
      const editorContext = await positronApi.methods.lastActiveEditorContext();
      if (editorContext) {
        vscode.window.showInformationMessage(`Current file: ${editorContext.document.path}`);
        vscode.window.showInformationMessage(`Selection: ${editorContext.selection}`);
      }

      // Call a frontend method directly
      const result = await positronApi.methods.call("someMethod", {
        param1: "value1",
        param2: 42,
      });

      // Show dialogs through the methods API
      const confirmed = await positronApi.methods.showQuestion(
        "Confirm Action",
        "Do you want to proceed?",
        "Yes",
        "No"
      );

      await positronApi.methods.showDialog(
        "Information",
        "Operation completed successfully!"
      );
    })
  );
}