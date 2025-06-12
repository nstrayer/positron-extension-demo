import * as vscode from "vscode";
import { tryAcquirePositronApi } from "@posit-dev/positron";

export function registerDataAssistantChatParticipant(
  context: vscode.ExtensionContext
) {
  context.subscriptions.push(
    vscode.chat.createChatParticipant(
      "data-assistant",
      async (request, context, response, token) => {
        const positron = tryAcquirePositronApi();
        if (!positron) {
          return;
        }

        const positronContext = await positron.ai.getPositronChatContext(
          request
        );

        // Example: User asks "summarize my dataframe"
        const sanitizedPrompt = request.prompt.toLowerCase();
        if (
          sanitizedPrompt.includes("summarize") &&
          sanitizedPrompt.includes("data")
        ) {
          if (positronContext.activeSession) {
            // Get current variables
            const vars = await positron.runtime.getSessionVariables(
              positronContext.activeSession.identifier
            );

            // Find dataframes
            const dfRegex = /dataframe/i;
            const dataframes = vars.filter((v) =>
              dfRegex.test(v[0].display_type)
            );

            if (dataframes.length > 0) {
              // Generate summary code
              const code = `${dataframes[0][0].display_name}.describe()`;

              response.markdown(
                `I'll summarize your dataframe:\n\n\`\`\`python\n${code}\n\`\`\``
              );

              // Execute the summary
              await positron.runtime.executeCode("python", code, true);
            } else {
              response.markdown("No dataframes found in your session.");
            }
          }
        }
      }
    )
  );
}
