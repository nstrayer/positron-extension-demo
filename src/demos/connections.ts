import * as vscode from "vscode";
import { tryAcquirePositronApi } from "@posit-dev/positron";

export function registerConnectionDemos(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "demoExtension.registerDriver",
      async () => {
        const positron = tryAcquirePositronApi();
        if (positron) {
          positron.connections.registerConnectionDriver({
            driverId: "mockdb",
            metadata: {
              languageId: "python",
              name: "Mock Database",
              inputs: [
                {
                  id: "database",
                  label: "Database Name",
                  type: "string",
                  value: "test_db",
                },
              ],
            },
            generateCode: (inputs) => {
              const dbName =
                inputs.find((i) => i.id === "database")?.value || "test_db";

              // Generate Python code that creates a mock connection
              return `
# Mock database connection
class MockDatabase:
    def __init__(self, name):
        self.name = name
        self.tables = ['users', 'products', 'orders']
        print(f"Connected to mock database: {name}")
        print(f"Available tables: {', '.join(self.tables)}")
    
    def query(self, sql):
        return f"Mock result for: {sql}"

# Create connection
mock_db = MockDatabase("test_db")
print("\\nConnection successful! Try: mock_db.query('SELECT * FROM users')")
`;
            },
            connect: async (code) => {
              await positron.runtime.executeCode("python", code, true);
            },
          });
        }
      }
    )
  );
}
