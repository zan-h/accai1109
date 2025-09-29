import { RealtimeAgent } from '@openai/agents/realtime';
import { makeWorkspaceChanges, workspaceInfoTool } from './energyCoach';
import { RealtimeItem, tool } from '@openai/agents/realtime';
import { fetchResponsesMessage } from './utils';
import { bodyDoublingCompanionPrompt } from './prompts';

const focusTimer = tool({
  name: 'focusTimer',
  description:
    'Start focus session timing and provide gentle check-ins for ADHD body doubling support.',
  parameters: {
    type: 'object',
    properties: {
      session_details: {
        type: 'string',
        description:
          'Details about the focus session: what task we\'re working on, preferred check-in frequency, any special needs.',
      },
    },
    required: ['data_to_calculate'],
    additionalProperties: false,
  },
  execute: async (input, details) => {
    const { session_details } = input as { session_details: string };

    const addBreadcrumb = (details?.context as any)?.addTranscriptBreadcrumb as
      | ((title: string, data?: any) => void)
      | undefined;

    const history: RealtimeItem[] = (details?.context as any)?.history ?? [];
    const filteredLogs = history.filter((log) => log.type === 'message');

    addBreadcrumb?.('[focus-session]', { session_details });

    const body = {
      model: "gpt-4.1",
      tools: [
        {
          type: "code_interpreter",
          container: { type: "auto" }
        }
      ],
      instructions: "You are a gentle ADHD body doubling companion. Help create focus session structure and timing based on the user's needs and energy levels. Be supportive and adaptive.",
      input: `==== Recent Conversation History ====
      ${JSON.stringify(filteredLogs, null, 2)}
      
      ==== Focus Session Details ====
      ${session_details}`,
    };

    console.log('Body:', body);
    const response = await fetchResponsesMessage(body);
    console.log('Response:', response);
    const responseText = response.output_text;
    console.log('Response Text:', responseText);
    addBreadcrumb?.('[focus-session] response', { responseText });
    if (response.error) {
      return { error: 'Something went wrong.' };
    }

    return { focusSessionResponse: responseText as string };
  },
});

export const bodyDoublingCompanion = new RealtimeAgent({
  name: 'bodyDoublingCompanion',
  voice: 'sage',
  instructions: bodyDoublingCompanionPrompt,
  tools: [focusTimer, workspaceInfoTool, makeWorkspaceChanges],
  handoffs: [], // wired up in index.ts to avoid circular dependencies
});
