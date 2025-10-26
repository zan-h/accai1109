// src/app/agentConfigs/shared/tools/web/webSearchTool.ts

import { RealtimeItem, tool } from '@openai/agents/realtime';

// Helper function to call Responses API
async function fetchResponsesMessage(body: any) {
  const response = await fetch('/api/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    throw new Error(`Responses API error: ${response.statusText}`);
  }
  
  return await response.json();
}

export const webSearchTool = tool({
  name: 'search_web',
  description: 'Search the web for information, facts, sources, research, and current data. Returns formatted results with links.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query to find information about',
      },
    },
    required: ['query'],
    additionalProperties: false,
  },
  execute: async (input, details) => {
    const { query } = input as { query: string };
    const addBreadcrumb = (details?.context as any)?.addTranscriptBreadcrumb;
    const history: RealtimeItem[] = (details?.context as any)?.history ?? [];
    const filteredLogs = history.filter((log) => log.type === 'message');

    addBreadcrumb?.('[web search]', { query });

    const body = {
      model: 'gpt-4.1',
      tools: [{ type: 'web_search_preview' }],
      tool_choice: 'required',
      input: `You're a research assistant helping a writer. Search the web and respond with relevant, well-organized information.

IMPORTANT: 
- Format response in clear, structured markdown
- Include links to sources for verification
- Cite dates when information was published
- Note credibility of sources
- Summarize key findings concisely
- If relevant, include quotes from sources

==== Recent Conversation History ====
${JSON.stringify(filteredLogs.slice(-5), null, 2)}

==== Research Query ====
${query}`,
    };

    try {
      const response = await fetchResponsesMessage(body);
      const responseText = response.output_text;
      addBreadcrumb?.('[web search] response', { responseText });
      
      if (response.error) {
        return { error: 'Web search failed. Please try rephrasing your query.' };
      }

      return { 
        results: responseText as string,
        query: query,
      };
    } catch (error) {
      console.error('Web search error:', error);
      return { error: 'Web search encountered an error. Please try again.' };
    }
  },
});

export const webSearchTools = [webSearchTool];

