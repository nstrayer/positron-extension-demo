import * as vscode from "vscode";
import { registerHelloWorldCommand } from "./commands/helloWorld";
import { registerPreviewDemoCommand } from "./commands/previewDemo";
import { registerDataAssistantChatParticipant } from "./chat/dataAssistant";
import { registerWindowDemos } from "./demos/window";
import { registerRuntimeDemos } from "./demos/runtime";
import { registerAIDemos } from "./demos/ai";
import { registerConnectionDemos } from "./demos/connections";
import { registerMethodsDemos } from "./demos/methods";
import { registerEnvironmentDemos } from "./demos/environment";
import { registerLanguageDemos } from "./demos/languages";
import { registerEventListeners } from "./events/eventListeners";

export function activate(context: vscode.ExtensionContext) {
  // Register commands
  [
    registerDataAssistantChatParticipant,
    registerHelloWorldCommand,
    registerPreviewDemoCommand,
    registerWindowDemos,
    registerRuntimeDemos,
    registerAIDemos,
    registerConnectionDemos,
    registerMethodsDemos,
    registerEnvironmentDemos,
    registerLanguageDemos,
    registerEventListeners,
  ].forEach((register) => register(context));
}
