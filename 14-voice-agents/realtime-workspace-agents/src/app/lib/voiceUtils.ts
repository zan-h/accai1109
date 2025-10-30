import { RealtimeAgent } from '@openai/agents/realtime';
import { VoicePreferences, OpenAIVoiceName } from './supabase/types';

/**
 * Descriptions for each OpenAI Realtime API voice
 * to help users make informed choices
 */
export const VOICE_DESCRIPTIONS: Record<OpenAIVoiceName, string> = {
  alloy: 'Neutral & balanced - Good for general use',
  echo: 'Warm & friendly - Conversational tone',
  fable: 'Expressive & articulate - Clear pronunciation',
  onyx: 'Deep & authoritative - Professional tone',
  nova: 'Energetic & dynamic - Upbeat delivery',
  shimmer: 'Soft & gentle - Calm and soothing',
  sage: 'Thoughtful & calm - Wise and measured',
  verse: 'Clear & professional - Crisp enunciation',
};

/**
 * Validates if a given string is a valid OpenAI voice name
 */
export function isValidVoice(voice: string): voice is OpenAIVoiceName {
  const validVoices: OpenAIVoiceName[] = [
    'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer', 'sage', 'verse'
  ];
  return validVoices.includes(voice as OpenAIVoiceName);
}

/**
 * Applies user's voice preferences to all agents in a suite
 * 
 * This function clones each agent and overrides the voice property
 * with the user's preferred voice if enabled.
 * 
 * @param agents - Array of RealtimeAgent objects from a suite
 * @param preferences - User's voice preferences (or undefined if not set)
 * @returns Array of agents with voice overrides applied
 * 
 * @example
 * const agents = [captureCoachAgent, organizerAgent, clarifierAgent];
 * const preferences = { enabled: true, voice: 'sage' };
 * const modifiedAgents = applyVoicePreferences(agents, preferences);
 * // All agents now have voice: 'sage'
 */
export function applyVoicePreferences(
  agents: RealtimeAgent[],
  preferences: VoicePreferences | undefined | null
): RealtimeAgent[] {
  // If no preferences or not enabled, return original agents
  if (!preferences || !preferences.enabled) {
    return agents;
  }

  // Validate voice preference
  if (!isValidVoice(preferences.voice)) {
    console.warn(
      `Invalid voice preference: ${preferences.voice}. Falling back to agent defaults.`
    );
    return agents;
  }

  // Clone each agent with voice override
  // Note: We use type assertions here because RealtimeAgent has complex generic constraints
  // that make it difficult to clone properly while preserving exact types
  return agents.map((agent: any) => {
    return new RealtimeAgent({
      name: agent.name,
      voice: preferences.voice, // Override with user's preferred voice
      instructions: agent.instructions,
      tools: agent.tools,
      handoffs: agent.handoffs,
    });
  }) as any;
}

/**
 * Fetches user's voice preferences from the API
 * 
 * @returns Promise resolving to voice preferences or null
 */
export async function fetchVoicePreferences(): Promise<VoicePreferences | null> {
  try {
    const response = await fetch('/api/user/voice-preferences');
    
    if (!response.ok) {
      console.error('Failed to fetch voice preferences:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data.voicePreferences || null;
  } catch (error) {
    console.error('Error fetching voice preferences:', error);
    return null;
  }
}

/**
 * Saves user's voice preferences via the API
 * 
 * @param preferences - Voice preferences to save
 * @returns Promise resolving to success boolean
 */
export async function saveVoicePreferences(
  preferences: VoicePreferences
): Promise<boolean> {
  try {
    const response = await fetch('/api/user/voice-preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to save voice preferences:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving voice preferences:', error);
    return false;
  }
}

