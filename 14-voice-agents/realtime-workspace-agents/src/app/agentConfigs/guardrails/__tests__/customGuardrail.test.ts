import { createCustomBusinessGuardrail } from '../customGuardrail';

// Mock the fetch function for testing
global.fetch = jest.fn();

describe('Custom Business Guardrail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow professional responses', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        output_parsed: {
          moderationRationale: 'Professional business communication',
          moderationCategory: 'NONE'
        }
      })
    };
    
    (fetch as jest.Mock).mockResolvedValue(mockResponse);

    const guardrail = createCustomBusinessGuardrail('customer service');
    const result = await guardrail.execute({
      agentOutput: 'Thank you for contacting our customer service. How may I assist you today?'
    });

    expect(result.tripwireTriggered).toBe(false);
  });

  it('should block competitor mentions', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        output_parsed: {
          moderationRationale: 'Mentions competitor by name',
          moderationCategory: 'COMPETITOR_MENTION'
        }
      })
    };
    
    (fetch as jest.Mock).mockResolvedValue(mockResponse);

    const guardrail = createCustomBusinessGuardrail('customer service');
    const result = await guardrail.execute({
      agentOutput: 'Unlike CompetitorX, we offer better pricing...'
    });

    expect(result.tripwireTriggered).toBe(true);
    expect(result.outputInfo.moderationCategory).toBe('COMPETITOR_MENTION');
  });

  it('should block unprofessional language', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        output_parsed: {
          moderationRationale: 'Uses casual, unprofessional language',
          moderationCategory: 'UNPROFESSIONAL_LANGUAGE'
        }
      })
    };
    
    (fetch as jest.Mock).mockResolvedValue(mockResponse);

    const guardrail = createCustomBusinessGuardrail('customer service');
    const result = await guardrail.execute({
      agentOutput: 'Hey dude, that\'s totally awesome! No worries, we got you covered!'
    });

    expect(result.tripwireTriggered).toBe(true);
    expect(result.outputInfo.moderationCategory).toBe('UNPROFESSIONAL_LANGUAGE');
  });
});
