import * as vscode from "vscode";
import { tryAcquirePositronApi } from "@posit-dev/positron";

export function registerConnectionDemos(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "demoExtension.registerDriver",
      async () => {
        const positronApi = tryAcquirePositronApi();
        if (!positronApi) {
          throw new Error("Positron API not available");
        }

        // Register a custom database driver
        positronApi.connections.registerConnectionDriver({
          driverId: "my-database",
          metadata: {
            languageId: "sql",
            name: "My Custom Database",
            base64EncodedIconSvg: "data:image/svg+xml;base64,...",
            inputs: [
              {
                id: "host",
                label: "Host",
                type: "string",
                value: "localhost",
              },
              {
                id: "port",
                label: "Port",
                type: "number",
                value: "5432",
              },
              {
                id: "database",
                label: "Database",
                type: "string",
              },
              {
                id: "auth_type",
                label: "Authentication",
                type: "option",
                options: [
                  { identifier: "password", title: "Username/Password" },
                  { identifier: "token", title: "API Token" },
                ],
              },
            ],
          },
          generateCode: (inputs) => {
            const host = inputs.find((i) => i.id === "host")?.value;
            const port = inputs.find((i) => i.id === "port")?.value;
            const database = inputs.find((i) => i.id === "database")?.value;
            return `connect_to_database("${host}:${port}/${database}")`;
          },
          connect: async (code) => {
            // Execute the connection code in the active runtime
            await positronApi.runtime.executeCode("python", code, true);
          },
          checkDependencies: async () => {
            // Check if required packages are installed
            try {
              await positronApi.runtime.executeCode(
                "python",
                "import my_database_library",
                false
              );
              return true;
            } catch {
              return false;
            }
          },
        });
      }
    )
  );
}