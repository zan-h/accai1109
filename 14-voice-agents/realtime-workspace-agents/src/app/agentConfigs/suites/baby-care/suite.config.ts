import { SuiteConfig } from '@/app/agentConfigs/types';

export const babyCareSuiteConfig: SuiteConfig = {
  id: 'baby-care',
  name: 'Baby Care Companion',
  description: 'Expert support for infant care - feeding, sleep, development, and health monitoring',
  icon: '👶',
  category: 'mental-health', // Caregiving support
  tags: [
    'baby',
    'infant-care',
    'parenting',
    'feeding',
    'sleep',
    'development',
    'health',
    'newborn'
  ],
  
  suggestedUseCases: [
    'First-time babysitting',
    'Caring for infant temporarily',
    'Tracking feeding and sleep patterns',
    'Monitoring developmental milestones',
    'Emergency baby care guidance',
  ],
  
  userLevel: 'beginner',
  estimatedSessionLength: 30, // Quick check-ins throughout day
  
  workspaceTemplates: [
    {
      name: 'Feeding Log',
      type: 'csv',
      content: `Time|Type|Amount (oz)|Duration (min)|Notes
06:30 AM|Bottle|4 oz|15|Finished completely
09:45 AM|Bottle|3 oz|10|Left 1 oz
`,
      description: 'Track all feedings with times, amounts, and notes',
    },
    {
      name: 'Sleep Schedule',
      type: 'csv',
      content: `Date|Sleep Start|Wake Time|Duration|Quality|Location|Notes
${new Date().toLocaleDateString()}|7:00 AM|9:30 AM|2h 30m|Good|Crib|Long morning nap
${new Date().toLocaleDateString()}|12:00 PM|1:45 PM|1h 45m|Restless|Stroller|Woke up crying
`,
      description: 'Monitor sleep patterns and quality',
    },
    {
      name: 'Daily Care Log',
      type: 'csv',
      content: `Time|Activity|Details|Notes
06:00 AM|Diaper Change|Wet|Normal
08:00 AM|Bath|10 min|Used baby soap
10:00 AM|Tummy Time|5 min|Happy and engaged
`,
      description: 'Track diapers, baths, activities',
    },
    {
      name: 'Health Journal',
      type: 'markdown',
      content: `# Health Monitoring

## Today's Vitals
- Temperature: 
- Overall mood: 
- Appetite: 

## Symptoms to Watch
- [ ] Fever
- [ ] Unusual crying
- [ ] Rash
- [ ] Vomiting
- [ ] Diarrhea

## Medications Given
(None yet)

## Notes
`,
      description: 'Monitor health and track any concerns',
    },
    {
      name: 'Milestones',
      type: 'markdown',
      content: `# Developmental Milestones

## Current Age: _____ months

## Recently Achieved
- [ ] Holds head up
- [ ] Rolls over
- [ ] Sits without support
- [ ] Crawls
- [ ] Pulls to stand
- [ ] First words

## Working On
- 

## Next Expected Milestones
- 

## Activities to Encourage Development
- 
`,
      description: 'Track baby\'s developmental progress',
    },
    {
      name: 'Emergency Info',
      type: 'markdown',
      content: `# Emergency Information

## Parents Contact
- Mom: 
- Dad: 
- Best time to call: 

## Medical Contacts
- Pediatrician: 
- After-hours clinic: 
- Hospital: 
- Poison Control: 1-800-222-1222

## Baby Information
- **Name:** 
- **Date of Birth:** 
- **Age:** 
- **Weight:** 
- **Allergies:** None known
- **Medications:** 
- **Medical conditions:** 

## Important Notes
- Formula brand: 
- Usual feeding times: 
- Sleep schedule: 
- Special instructions: 
`,
      description: 'Critical information for emergencies',
    },
  ],
  
  initialContext: {
    careType: 'temporary',
    experienceLevel: 'learning',
    supportStyle: 'reassuring',
  },
};

