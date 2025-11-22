// src/app/agentConfigs/shared/tools/workspace/workspaceTools.ts

import { tool } from '@openai/agents/realtime';
import {
  addWorkspaceTab,
  renameWorkspaceTab,
  deleteWorkspaceTab,
  setTabContent,
  getWorkspaceInfo,
  setSelectedTabId,
} from '@/app/contexts/workspaceActions';

// Info only tool for agents to use to get the current state of the workspace
export const workspaceInfoTool = tool({
  name: 'get_workspace_info',
  description: 'Get the current state of the workspace',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
    additionalProperties: false,
  },
  execute: getWorkspaceInfo,
});

export const addTabTool = tool({
  name: 'add_workspace_tab',
  description: 'Add a new tab to the workspace',
  parameters: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'The name of the tab',
      },
      type: {
        type: 'string',
        description: "The type of the tab (e.g., 'markdown', 'csv', etc.)",
      },
      content: {
        type: 'string',
        description: 'The content of the tab to add',
      },
    },
    required: ['name', 'type'],
    additionalProperties: false,
  },
  execute: addWorkspaceTab,
});

export const setContentTool = tool({
  name: 'set_tab_content',
  description: 'Set the content of a workspace tab (pipe-delimited CSV or markdown depending on tab type)',
  parameters: {
    type: 'object',
    properties: {
      index: {
        type: 'integer',
        nullable: true,
        description: '0-based position of the tab (optional – you can use id or name instead; set to null if unused)',
        minimum: 0,
      },
      name: {
        type: 'string',
        nullable: true,
        description: 'The name of the tab (optional – you can use id or index instead; set to null if unused)',
      },
      content: {
        type: 'string',
        description: 'The content for the tab (pipe-delimited CSV or markdown)',
      },
    },
    required: ['content'],
    additionalProperties: false,
  },
  execute: setTabContent,
});

export const renameTabTool = tool({
  name: 'rename_workspace_tab',
  description: 'Rename an existing workspace tab',
  parameters: {
    type: 'object',
    properties: {
      index: {
        type: 'integer',
        nullable: true,
        description: '0-based position of the tab in the workspace (optional - you can use id or current_name instead; set to null if unused)',
        minimum: 0,
      },
      current_name: {
        type: 'string',
        nullable: true,
        description: 'The current name of the tab (optional - you can use id or index instead; set to null if unused)',
      },
      new_name: {
        type: 'string',
        description: 'The new name for the tab',
      },
    },
    required: ['current_name', 'new_name'],
    additionalProperties: false,
  },
  execute: renameWorkspaceTab,
});

export const deleteTabTool = tool({
  name: 'delete_workspace_tab',
  description: 'Delete a workspace tab',
  parameters: {
    type: 'object',
    properties: {
      index: {
        type: 'integer',
        nullable: true,
        description: '0-based position of the tab (optional – you can use id or name instead; set to null if unused)',
        minimum: 0,
      },
      name: {
        type: 'string',
        nullable: true,
        description: 'The name of the tab (optional – you can use id or index instead; set to null if unused)',
      },
    },
    required: [],
    additionalProperties: false,
  },
  execute: deleteWorkspaceTab,
});

export const selectTabTool = tool({
  name: 'select_workspace_tab',
  description: 'Select/focus a specific workspace tab',
  parameters: {
    type: 'object',
    properties: {
      index: {
        type: 'integer',
        nullable: true,
        description: '0-based position of the tab (optional – you can use id or name instead; set to null if unused)',
        minimum: 0,
      },
      name: {
        type: 'string',
        nullable: true,
        description: 'The name of the tab (optional – you can use id or index instead; set to null if unused)',
      },
    },
    required: [],
    additionalProperties: false,
  },
  execute: setSelectedTabId,
});

// Export as collection
export const workspaceTools = {
  getInfo: workspaceInfoTool,
  addTab: addTabTool,
  setContent: setContentTool,
  renameTab: renameTabTool,
  deleteTab: deleteTabTool,
  selectTab: selectTabTool,
};

// Export array for agent tools
export const basicWorkspaceTools = [
  workspaceInfoTool,
  addTabTool,
  setContentTool,
];

export const advancedWorkspaceTools = [
  ...basicWorkspaceTools,
  renameTabTool,
  deleteTabTool,
  selectTabTool,
];


