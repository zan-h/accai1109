import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';

// Context-aware guardrail that adapts based on conversation stage
const ContextModerationCategories = [
  "WRONG_CONVERSATION_STAGE",
  "MISSING_REQUIRED_INFO",
  "PREMATURE_CONCLUSION",
  "NONE",
] as const;

const ContextModerationCategoryZod = z.enum([...ContextModerationCategories]);

const ContextGuardrailOutputZod = z.object({
  moderationRationale: z.string(),
  moderationCategory: ContextModerationCategoryZod,
  testText: z.string().optional(),
});

type ContextGuardrailOutput = z.infer<typeof ContextGuardrailOutputZod>;

export interface ContextGuardrailResult {
  tripwireTriggered: boolean;
  outputInfo: any;
}

export interface ContextGuardrailArgs {
  agentOutput: string;
  agent?: any;
  context?: any;
}

export async function runContextAwareClassifier(
  message: string,
  conversationStage: string,
  requiredInfo: string[]
): Promise<ContextGuardrailOutput> {
  const messages = [
    {
      role: 'user',
      content: `You are an expert at ensuring conversations follow proper workflow stages. Analyze if the agent's response is appropriate for the current conversation stage and requirements.

      <conversation_context>
      - Current stage: ${conversationStage}
      - Required information: ${requiredInfo.join(', ')}
      </conversation_context>

      <agent_message>
      ${message}
      </agent_message>

      <output_classes>
      - WRONG_CONVERSATION_STAGE: Agent discussing topics inappropriate for current conversation stage.
      - MISSING_REQUIRED_INFO: Agent proceeding without collecting required information for this stage.
      - PREMATURE_CONCLUSION: Agent trying to conclude or hand off before completing current stage requirements.
      - NONE: Response is appropriate for current conversation stage and context.
      </output_classes>
      `,
    },
  ];

  const response = await fetch('/api/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      input: messages,
      text: {
        format: zodTextFormat(ContextGuardrailOutputZod, 'output_format'),
      },
    }),
  });

  if (!response.ok) {
    console.warn('Server returned an error:', response);
    return Promise.reject('Error with runContextAwareClassifier.');
  }

  const data = await response.json();

  try {
    const output = ContextGuardrailOutputZod.parse(data.output_parsed);
    return {
      ...output,
      testText: message,
    };
  } catch (error) {
    console.error('Error parsing context guardrail output:', error);
    return Promise.reject('Failed to parse context guardrail output.');
  }
}

export function createContextAwareGuardrail(
  conversationStage: string,
  requiredInfo: string[]
) {
  return {
    name: 'context_aware_guardrail',

    async execute({ agentOutput, context }: ContextGuardrailArgs): Promise<ContextGuardrailResult> {
      try {
        // You could extract stage from context or agent state here
        const currentStage = context?.stage || conversationStage;
        const res = await runContextAwareClassifier(agentOutput, currentStage, requiredInfo);
        const triggered = res.moderationCategory !== 'NONE';
        return {
          tripwireTriggered: triggered,
          outputInfo: res,
        };
      } catch {
        return {
          tripwireTriggered: false,
          outputInfo: { error: 'context_guardrail_failed' },
        };
      }
    },
  } as const;
}
