import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';

// Define your custom moderation categories
const CustomModerationCategories = [
  "INAPPROPRIATE_TOPIC",
  "UNPROFESSIONAL_LANGUAGE", 
  "COMPETITOR_MENTION",
  "PRICING_DISCUSSION",
  "NONE",
] as const;

const CustomModerationCategoryZod = z.enum([...CustomModerationCategories]);

const CustomGuardrailOutputZod = z.object({
  moderationRationale: z.string(),
  moderationCategory: CustomModerationCategoryZod,
  testText: z.string().optional(),
});

type CustomGuardrailOutput = z.infer<typeof CustomGuardrailOutputZod>;

export interface CustomGuardrailResult {
  tripwireTriggered: boolean;
  outputInfo: any;
}

export interface CustomGuardrailArgs {
  agentOutput: string;
  agent?: any;
  context?: any;
}

// Custom classifier for your specific business rules
export async function runCustomGuardrailClassifier(
  message: string,
  businessContext: string = 'customer service'
): Promise<CustomGuardrailOutput> {
  const messages = [
    {
      role: 'user',
      content: `You are an expert at classifying text according to business-specific moderation policies. Consider the provided message, analyze potential classes from output_classes, and output the best classification. Output json, following the provided schema. Keep your analysis and reasoning short and to the point, maximum 2 sentences.

      <business_context>
      - Context: ${businessContext}
      - Company policy: Professional, helpful, avoid competitor discussions
      </business_context>

      <message>
      ${message}
      </message>

      <output_classes>
      - INAPPROPRIATE_TOPIC: Content discussing topics outside business scope (politics, religion, personal opinions).
      - UNPROFESSIONAL_LANGUAGE: Content using casual slang, informal language, or unprofessional tone.
      - COMPETITOR_MENTION: Content mentioning or comparing with competitors by name.
      - PRICING_DISCUSSION: Content providing specific pricing information or discounts without authorization.
      - NONE: If no other classes are appropriate and the message is professionally acceptable.
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
        format: zodTextFormat(CustomGuardrailOutputZod, 'output_format'),
      },
    }),
  });

  if (!response.ok) {
    console.warn('Server returned an error:', response);
    return Promise.reject('Error with runCustomGuardrailClassifier.');
  }

  const data = await response.json();

  try {
    const output = CustomGuardrailOutputZod.parse(data.output_parsed);
    return {
      ...output,
      testText: message,
    };
  } catch (error) {
    console.error('Error parsing the message content as CustomGuardrailOutput:', error);
    return Promise.reject('Failed to parse custom guardrail output.');
  }
}

// Create your custom guardrail factory
export function createCustomBusinessGuardrail(businessContext: string = 'customer service') {
  return {
    name: 'custom_business_guardrail',

    async execute({ agentOutput }: CustomGuardrailArgs): Promise<CustomGuardrailResult> {
      try {
        const res = await runCustomGuardrailClassifier(agentOutput, businessContext);
        const triggered = res.moderationCategory !== 'NONE';
        return {
          tripwireTriggered: triggered,
          outputInfo: res,
        };
      } catch {
        return {
          tripwireTriggered: false,
          outputInfo: { error: 'custom_guardrail_failed' },
        };
      }
    },
  } as const;
}
