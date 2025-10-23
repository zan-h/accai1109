// src/app/agentConfigs/suites/writing-companion/suite.config.ts

import type { AgentSuite } from '@/app/agentConfigs/types';

export const writingCompanionSuite: AgentSuite = {
  id: 'writing-companion',
  name: 'Writing Companion',
  description: 'Complete writing workflow: from ideation to publication-ready prose',
  icon: '✍️',
  category: 'creativity',
  tags: ['writing', 'editing', 'creativity', 'publishing', 'prose', 'ideation', 'free-writing'],
  
  suggestedUseCases: [
    'Writing essays, articles, or blog posts',
    'Developing ideas through free-writing',
    'Editing and polishing drafts',
    'Overcoming writer\'s block',
    'Morning pages and creative exploration',
    'Professional editing workflow',
  ],
  
  targetUsers: [
    'Writers and authors',
    'Bloggers and content creators',
    'Journalists and essayists',
    'Students working on papers',
    'Anyone who writes regularly',
  ],

  workspaceTemplates: [
    {
      name: 'Current Draft',
      type: 'markdown',
      description: 'Your working draft - the agent can help you write and edit here',
      content: `# [Your Title Here]

*Date: ${new Date().toLocaleDateString()}*
*Status: Draft*

---

## Introduction

[Start writing here, or speak to the agent and they'll help you develop your piece...]

## Main Body

[Continue developing your ideas...]

## Conclusion

[Wrap up your thoughts...]

---

**Notes to Self:**
- 
- 

**Word Count:** 0
`,
      primary_agent: 'freeWriter',
      secondary_agents: ['substantiveEditor', 'lineEditor', 'copyEditor', 'proofreader'],
    },
    
    {
      name: 'Structure Inspiration',
      type: 'markdown',
      description: 'Paste examples, outlines, or reference material here for the agent to review',
      content: `# Structure & Reference Material

## Purpose
Paste any reference material, example structures, or inspiration here. The agent will read this before helping you write.

---

## Example Structures

### Classic Essay Structure
1. Hook
2. Thesis statement
3. Supporting arguments (3-5)
4. Counterargument & rebuttal
5. Conclusion with call to action

### Narrative Arc
1. Setup (character, setting, situation)
2. Inciting incident
3. Rising action (challenges, obstacles)
4. Climax (turning point)
5. Resolution (transformation, lesson)

### Listicle Structure
- Compelling title (number + benefit)
- Brief introduction
- Each point: Subheading → Explanation → Example
- Conclusion with key takeaway

---

## Reference Material

[Paste any articles, outlines, or inspiration here...]

`,
      primary_agent: 'ideation',
      secondary_agents: ['substantiveEditor'],
    },
    
    {
      name: 'Idea Garden',
      type: 'markdown',
      description: 'Free-form space for brainstorming, morning pages, and creative exploration',
      content: `# Idea Garden 🌱

*A place for raw thoughts, free-writing, and creative exploration*

---

## ${new Date().toLocaleDateString()} - Morning Pages

[Start writing freely... no judgment, no editing, just flow...]

---

## Ideas & Sparks

- 

---

## Curiosities & Questions

What am I curious about right now?
- 

What makes me feel alive?
- 

What seems fun to explore?
- 

---

## Random Thoughts

[Capture anything that comes to mind...]

`,
      primary_agent: 'ideation',
      secondary_agents: ['freeWriter'],
    },
    
    {
      name: 'Editing Checklist',
      type: 'markdown',
      description: 'Track your editing progress through each stage',
      content: `# Editing Checklist

## Substantive Editing (Structure & Content)
- [ ] Clear thesis or main argument
- [ ] Logical flow and organization
- [ ] Strong introduction and conclusion
- [ ] Each paragraph serves a purpose
- [ ] Arguments are well-supported
- [ ] Smooth transitions between sections
- [ ] Appropriate length and pacing
- [ ] All necessary information included

**Notes:**
- 

---

## Line Editing (Sentence-Level)
- [ ] Varied sentence structure
- [ ] Active voice where appropriate
- [ ] Strong verbs (minimize "to be")
- [ ] Concise language (cut fluff)
- [ ] Rhythm and flow
- [ ] Consistent tone and voice
- [ ] Engaging and readable

**Notes:**
- 

---

## Copyediting (Technical Accuracy)
- [ ] Grammar and syntax
- [ ] Spelling
- [ ] Punctuation
- [ ] Consistency (capitalization, numbers, etc.)
- [ ] Formatting
- [ ] Citations/references (if applicable)

**Notes:**
- 

---

## Proofreading (Final Polish)
- [ ] Typos
- [ ] Awkward phrasings
- [ ] Formatting consistency
- [ ] Final read-through
- [ ] Ready to publish

**Notes:**
- 

---

**Publication Status:** 🟡 In Progress

`,
      primary_agent: 'substantiveEditor',
      secondary_agents: ['lineEditor', 'copyEditor', 'proofreader'],
    },
  ],
  
  initialContext: `This is a writing workspace for developing written pieces from ideation through publication.

The writer can work through stages:
1. IDEATION - Explore curiosities and generate ideas
2. FREE-WRITING - Write freely without judgment (with timed sessions)
3. DRAFTING - Develop the piece in Current Draft
4. SUBSTANTIVE EDITING - Structure, clarity, argument
5. LINE EDITING - Sentence-level flow and style
6. COPYEDITING - Grammar and consistency
7. PROOFREADING - Final polish

The agent should read Structure Inspiration before helping with writing, and use the Editing Checklist to track progress.`,
};

