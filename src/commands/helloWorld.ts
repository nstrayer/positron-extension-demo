import * as vscode from "vscode";
import { tryAcquirePositronApi, previewUrl } from "@posit-dev/positron";

export function registerHelloWorldCommand(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("myExtension.helloWorld", () => {
      const positron = tryAcquirePositronApi();

      if (positron === undefined) {
        vscode.window.showInformationMessage("Failed to find positron api");
        return;
      }

      // Preview a URL in Positron's viewer
      positron.window.previewUrl(
        vscode.Uri.parse("https://positron.posit.co/")
      );

      // Or just if you want it to work in both vscode and positron
      previewUrl("https://positron.posit.co/");

      // Execute code in the active runtime
      positron.runtime.executeCode(
        "python",
        'print("Hello Positron from the extension")',
        true
      );
    })
  );
}
