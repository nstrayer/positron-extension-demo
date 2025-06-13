import * as vscode from "vscode";
import { registerHelloWorldCommand } from "./commands/helloWorld";
import { registerPreviewDemoCommand } from "./commands/previewDemo";
import { registerWindowDemos } from "./demos/window";
import { registerRuntimeDemos } from "./demos/runtime";
import { registerConnectionDemos } from "./demos/connections";
import { registerMethodsDemos } from "./demos/methods";
import { registerEnvironmentDemos } from "./demos/environment";
import { registerLanguageDemos } from "./demos/languages";
import { registerEventListeners } from "./events/eventListeners";

export function activate(context: vscode.ExtensionContext) {
  // Register commands
  [
    registerHelloWorldCommand,
    registerPreviewDemoCommand,
    registerWindowDemos,
    registerRuntimeDemos,
    registerConnectionDemos,
    registerMethodsDemos,
    registerEnvironmentDemos,
    registerLanguageDemos,
    registerEventListeners,
  ].forEach((register) => register(context));
}
