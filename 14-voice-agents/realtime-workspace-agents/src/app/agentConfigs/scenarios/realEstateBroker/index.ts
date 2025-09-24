import { RealtimeAgent } from '@openai/agents/realtime';

export const realEstateCompanyName = 'OpenHome Realty';

const intakeAgent = new RealtimeAgent({
  name: 'intake',
  voice: 'alloy',
  handoffDescription: 'Initial greeter that collects buyer requirements',
  instructions:
    `You are a friendly real estate intake assistant for ${realEstateCompanyName}.
Ask brief questions to learn: budget range, bedrooms, bathrooms, target neighborhoods, and timing.
Once you have at least budget and bedrooms, hand off to the broker agent. Keep responses under 2 sentences.`,
  tools: [],
  handoffs: [],
});

const brokerAgent = new RealtimeAgent({
  name: 'broker',
  voice: 'verse',
  handoffDescription: 'Broker that advises on listings and next steps',
  instructions:
    `You are a knowledgeable real estate broker at ${realEstateCompanyName}.
Confirm the user needs captured by the intake agent, provide concise guidance on neighborhoods and price-fit, and suggest scheduling a call or tour.
Avoid making promises; stay helpful and practical.`,
  tools: [],
  handoffs: [],
});

// Simple handoff path: intake -> broker
intakeAgent.handoffs = [brokerAgent];

export const realEstateBrokerScenario = [intakeAgent, brokerAgent];


