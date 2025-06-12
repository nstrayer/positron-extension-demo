import { tryAcquirePositronApi } from "@posit-dev/positron";

export async function demonstrateErrorHandling() {
  const positronApi = tryAcquirePositronApi();
  if (!positronApi) {
    throw new Error("Positron API not available");
  }

  // try {
  //   const code = 'print("Hello World")';
  //   const result = await positronApi.runtime.executeCode("python", code, true);
  //   vscode.window.showInformationMessage("Execution succeeded:", result);
  // } catch (error: any) {
  //   // Handle execution errors gracefully
  //   // Errors may be of type RuntimeMethodError with structured information
  //   if (error.name === "RuntimeMethodError") {
  //     vscode.window.showInformationMessage("Runtime error details:", error.message);
  //   }

  //   await positronApi.window.showSimpleModalDialogMessage(
  //     "Execution Error",
  //     `Failed to execute code: ${error.message}`
  //   );
  // }
}
