import * as vscode from "vscode";
import * as positron from "@posit-dev/positron";
import { tryAcquirePositronApi } from "@posit-dev/positron";

export function registerAIDemos(context: vscode.ExtensionContext) {
  const positronApi = tryAcquirePositronApi();

  // Simple Chat Participant
  const participant = vscode.chat.createChatParticipant(
    "data-assistant",
    async (request, context, response, token) => {
      const positron = tryAcquirePositronApi();
      if (!positron) {
        return;
      }

      const positronContext = await positron.ai.getPositronChatContext(request);

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
  );

  // Set agent properties
  participant.iconPath = new vscode.ThemeIcon("robot");
  participant.followupProvider = {
    provideFollowups(result, context, token) {
      return [
        {
          prompt: "hello",
          label: "Say hello",
        },
      ];
    },
  };

  context.subscriptions.push(participant);

  // Dynamic Agent Registration (Positron only)
  if (positronApi) {
    // Register agent metadata dynamically
    const agentData: positron.ai.ChatAgentData = {
      id: "my.extension.agent",
      name: "Dynamic Agent",
      description: "Custom data science assistant",
      modes: [positronApi.PositronChatMode.Ask],
      locations: [positronApi.PositronChatAgentLocation.Panel],
      slashCommands: [
        {
          name: "analyze",
          description: "Analyze current data",
          isSticky: false,
        },
      ],
      disambiguation: [
        {
          category: "data-science",
          description: "Data analysis help",
          examples: ["analyze this dataset", "explain this plot"],
        },
      ],
      metadata: {},
    };

    positronApi.ai.registerChatAgent(agentData).then((disposable) => {
      context.subscriptions.push(disposable);
    });
  }
}
