// useExperimentStore.ts
import { create } from 'zustand';

export type ExperimentType = 'experiment_1' | 'experiment_2' | null;
export type ExperimentStage = 'idle' | 'selection' | 'instructions' | 'running' | 'completed';

interface ExperimentState {
  isActive: boolean;
  type: ExperimentType;
  stage: ExperimentStage;
  experimentId: string | null;
  
  // Actions
  openSelection: () => void;
  selectExperiment: (type: ExperimentType) => void;
  startExperiment: () => void;
  completeExperiment: () => void;
  resetExperiment: () => void;
  closeExperiment: () => void;
}

export const useExperimentStore = create<ExperimentState>((set) => ({
  isActive: false,
  type: null,
  stage: 'idle',
  experimentId: null,

  openSelection: () => set({ isActive: true, stage: 'selection' }),
  
  selectExperiment: (type) => set({ 
    type, 
    stage: 'instructions' 
  }),
  
  startExperiment: () => set({ 
    stage: 'running' 
  }),
  
  completeExperiment: () => set({ 
    stage: 'completed' 
  }),
  
  resetExperiment: () => set({ 
    isActive: false, 
    type: null, 
    stage: 'idle',
    experimentId: null
  }),

  closeExperiment: () => set({
    isActive: false,
    stage: 'idle'
  })
}));
