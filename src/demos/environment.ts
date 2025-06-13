import * as vscode from "vscode";
import { tryAcquirePositronApi } from "@posit-dev/positron";

export function registerEnvironmentDemos(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("demoExtension.envVars", async () => {
      const positronApi = tryAcquirePositronApi();
      if (!positronApi) {
        vscode.window.showInformationMessage("Positron API not available");
        return;
      }

      // Get all environment variable contributions
      const contributions =
        await positronApi.environment.getEnvironmentContributions();

      // contributions is a Record<string, EnvironmentVariableAction[]>
      // where the key is the extension ID and value is array of variable actions
      for (const [extensionId, actions] of Object.entries(contributions)) {
        vscode.window.showInformationMessage(`Extension ${extensionId} contributes:`);
        for (const action of actions) {
          vscode.window.showInformationMessage(`  ${action.action} ${action.name} = ${action.value}`);
        }
      }
    })
  );
}