import * as vscode from "vscode";
import { tryAcquirePositronApi } from "@posit-dev/positron";
import { MyStatementRangeProvider, MyHelpTopicProvider } from "../providers/languageProviders";

export function registerLanguageDemos(context: vscode.ExtensionContext) {
  const positronApi = tryAcquirePositronApi();
  if (!positronApi) {
    throw new Error("Positron API not available");
  }

  // Register statement range provider for your language
  positronApi.languages.registerStatementRangeProvider(
    { language: "mylang" },
    new MyStatementRangeProvider()
  );

  // Register help topic provider
  positronApi.languages.registerHelpTopicProvider(
    { language: "mylang" },
    new MyHelpTopicProvider()
  );
}