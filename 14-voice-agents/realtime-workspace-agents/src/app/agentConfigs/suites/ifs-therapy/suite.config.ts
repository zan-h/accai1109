import { SuiteConfig } from '@/app/agentConfigs/types';

export const ifsTherapySuiteConfig: SuiteConfig = {
  id: 'ifs-therapy',
  name: 'IFS Therapy Companion',
  description: 'Internal Family Systems guided sessions - meet your parts, unblend, witness exiles, and build Self-led healing',
  icon: '🧘',
  category: 'mental-health',
  disabled: true, // Temporarily disabled
  tags: [
    'ifs',
    'internal-family-systems',
    'parts-work',
    'self-compassion',
    'trauma-healing',
    'therapy',
    'mindfulness',
    'emotional-regulation'
  ],
  
  suggestedUseCases: [
    'Daily emotional check-ins (5-10 min)',
    'Processing difficult emotions and triggers',
    'Understanding protective patterns',
    'Healing childhood wounds',
    'Navigating internal conflicts',
    'Managing addictive urges',
    'Acute overwhelm support',
    'Self-led intention setting'
  ],
  
  userLevel: 'intermediate',
  estimatedSessionLength: 25, // Varies by session type: 5-45 min
  
  workspaceTemplates: [
    {
      name: 'Parts Map',
      type: 'markdown',
      content: `# My Parts Map

## Managers (Proactive Protectors)
| Part Name | Role | Positive Intent | Triggers | Trust (0-10) | Distance |
|-----------|------|-----------------|----------|--------------|----------|
| The Planner | Keeps everything organized | Safety through control | Uncertainty | 7 | Close, behind shoulder |
| | | | | | |

## Firefighters (Reactive Protectors)
| Part Name | Role | Positive Intent | Triggers | Trust (0-10) | Distance |
|-----------|------|-----------------|----------|--------------|----------|
| The Numbing Agent | Uses scrolling/substances | Escape pain quickly | Emotional flooding | 4 | Very close when activated |
| | | | | | |

## Exiles (Young, Hurt Parts)
| Part Name | Age | Core Feeling | What It Carries | Permission to Visit | Last Witnessed |
|-----------|-----|--------------|-----------------|---------------------|----------------|
| Little Me | 6 | Abandoned, lonely | "I'm not important" | Yes, with Planner present | 2024-10-15 |
| | | | | | |

## Notes
- Parts may overlap or shift roles
- Distance imagery helps with unblending
- Permission is always required before exile work
`,
      description: 'Track all your parts, their roles, and relationships',
    },
    {
      name: 'Session Log',
      type: 'csv',
      content: `Date,Session Type,Capacity (0-10),Parts Met,Key Insights,Follow-up Actions,Duration (min)
${new Date().toLocaleDateString()},Daily Check-in,6,The Critic,"Realized it's trying to prevent failure",Journal about perfectionism,8
${new Date().toLocaleDateString()},Unblending,5,Anxious Part,"Created distance—felt more Self energy",Practice grounding daily,12
`,
      description: 'Track your IFS journey and session outcomes',
    },
    {
      name: 'Burdens Released',
      type: 'markdown',
      content: `# Burdens Released

## Template
**Date:** 
**Part:** 
**Burden:** [belief/emotion that is not their essence]
**Origin:** [legacy/personal/cultural]
**Release Ritual:** [light, water, earth, wind, fire]
**Qualities Invited In:** 
**Post-Release State:** 

---

## Log

### Example Entry
**Date:** 2024-10-15  
**Part:** Young Me (exile, age 7)  
**Burden:** "I'm not lovable unless I'm perfect"  
**Origin:** Personal (from critical parenting)  
**Release Ritual:** Imagined writing belief on paper, releasing to river current  
**Qualities Invited In:** Self-acceptance, playfulness, ease  
**Post-Release State:** Lighter in chest, less tightness; young part feels calmer  

---

### [Your entries below]

`,
      description: 'Document burden releases and track healing',
    },
    {
      name: 'Protector Contracts',
      type: 'markdown',
      content: `# Protector Contracts

When a protector needs conditions to feel safe allowing deeper work.

## Template
**Date:** 
**Protector:** 
**Concerns:** 
**Conditions Agreed:** 
- [ ] Time limit: ___ minutes
- [ ] No exile contact today
- [ ] Check-in signals
- [ ] External support available
- [ ] Other: 

**What We'll Do If It Feels Unsafe:** 
**Next Check-in:** 

---

## Active Contracts

[Your entries below]

`,
      description: 'Honor protector boundaries and build trust',
    },
    {
      name: 'Polarization Work',
      type: 'markdown',
      content: `# Parts in Conflict (Polarizations)

## Active Polarizations

### [Polarization 1]
**Part A:** 
- **Wants:** 
- **Fears:** 
- **Positive Intent:** 

**Part B:** 
- **Wants:** 
- **Fears:** 
- **Positive Intent:** 

**Common Ground Discovered:** 

**Co-Design Agreement:** 
- Experiment: 
- Time-sharing schedule: 
- Check-in signals: 
- Next review: 

**Status:** [ ] Active / [ ] Resolving / [ ] Resolved

---

## Resolved Polarizations
[Document successful mediations here]

`,
      description: 'Mediate internal conflicts between parts',
    },
    {
      name: 'Daily Micro-Practice Log',
      type: 'csv',
      content: `Date,Time,Part Present,Message from Part,Caring Act Taken,Next Check-in
${new Date().toLocaleDateString()},Morning,Anxious Part,"Worried about meeting",Deep breathing + reassurance,Tomorrow AM
`,
      description: 'Track daily 5-10 minute check-ins with parts',
    },
    {
      name: 'Urge Tracking',
      type: 'csv',
      content: `Date,Time,Urge Type,Intensity (0-10),Body Sensation,Firefighter Role,Alternative Action,Outcome,Duration (min)
${new Date().toLocaleDateString()},2:30 PM,Scrolling,8,"Tight chest, restless","Distract from rejection feeling","Walked outside, called friend","Urge passed",12
`,
      description: 'Track compulsions and urges with alternatives',
    },
    {
      name: 'Safety Protocol',
      type: 'markdown',
      content: `# Safety Information

## Stop Word
**My chosen pause word:** "pause"
- Use this anytime to immediately stop the session
- No explanation needed

## Environment Check
Before each session:
- [ ] Private, safe location
- [ ] Not driving or operating equipment
- [ ] Phone/support available if needed

## Capacity Guidelines
- **0-3:** Crisis support only (SOS protocol)
- **4-6:** Light work (grounding, micro-practice, unblending)
- **7+:** Deeper work possible (exile witnessing, burden release)

## Crisis Contacts
**Therapist:** 
**Crisis Line:** 988 (US Suicide & Crisis Lifeline)
**Trusted Friend/Support:** 
**Emergency:** 911

## Red Flags - Stop & Get Support
- Feeling unsafe or suicidal
- Completely overwhelmed/flooded
- Dissociation or losing present time
- Extreme part activation that won't settle

## Note
This is supportive guidance using IFS principles, NOT a substitute for therapy with a trained IFS therapist.

`,
      description: 'Safety protocols and emergency information',
    },
    {
      name: 'Self-Led Intentions',
      type: 'markdown',
      content: `# Self-Led Intentions

## This Week's North Star
**If I were 10% more Self-led this week, I would:**

## Protector Concerns Honored
**Protector 1:** 
- Concern: 
- How we address it: 

**Protector 2:** 
- Concern: 
- How we address it: 

## Tiny, Testable Steps
1. [ ] [Specific action] - When: ___ - How I'll know: ___
2. [ ] [Specific action] - When: ___ - How I'll know: ___
3. [ ] [Specific action] - When: ___ - How I'll know: ___

## Protective Signals (When to Slow/Stop)
- 
- 

## Review Date: 

---

## Past Intentions Archive
[Track what worked and what you learned]

`,
      description: 'Set Self-led goals with protector buy-in',
    },
  ],
  
  initialContext: {
    approachStyle: 'gentle-ifs',
    traumaInformed: true,
    selfEnergyOriented: true,
    protectorRespect: 'paramount',
  },
};


