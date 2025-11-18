"use client";
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUser, UserButton } from '@clerk/nextjs';
// import { v4 as uuidv4 } from "uuid"; // No longer needed - removed automatic "hi" message

import Image from "next/image";

// UI components
import Transcript from "./components/Transcript";
import Events from "./components/Events";
import BottomToolbar from "./components/BottomToolbar";
import Workspace from "./components/Workspace";
import ProjectSwitcher from "./components/ProjectSwitcher";
import SuiteSelector from "./components/SuiteSelector";
import SuiteIndicator from "./components/SuiteIndicator";
import SuiteTemplatePrompt from "./components/SuiteTemplatePrompt";
import SaveStatusIndicator from "./components/SaveStatusIndicator";
import Timer from "./components/Timer";
import VoiceSettingsModal from "./components/settings/VoiceSettingsModal";
import { BottomNav, MobileTab } from "./components/mobile/BottomNav";
import { useResponsive } from "./components/layouts/ResponsiveLayout";

// Types
import { SessionStatus } from "@/app/types";
import type { RealtimeAgent } from '@openai/agents/realtime';

// Context providers & hooks
import { useTranscript } from "@/app/contexts/TranscriptContext";
import { useEvent } from "@/app/contexts/EventContext";
import { useProjectContext } from "@/app/contexts/ProjectContext";
import { useRealtimeSession } from "./hooks/useRealtimeSession";
import { createModerationGuardrail } from "@/app/agentConfigs/guardrails";

// Agent configs
import {
  allAgentSets,
  defaultAgentSetKey,
  workspaceBuilderScenario,
} from "@/app/agentConfigs";

// Suite system
import { AgentSuite } from '@/app/agentConfigs/types';
import { findSuiteById } from '@/app/agentConfigs';
import { initializeWorkspaceWithTemplates, getWorkspaceInfoForContext } from './lib/workspaceInitializer';

// Voice customization
import { applyVoicePreferences, fetchVoicePreferences } from './lib/voiceUtils';
import { VoicePreferences } from './lib/supabase/types';

// Map used by connect logic for scenarios defined via the SDK
const sdkScenarioMap: Record<string, RealtimeAgent[]> = {
  workspaceBuilder: workspaceBuilderScenario,
};

import useAudioDownload from "./hooks/useAudioDownload";
import { useHandleSessionHistory } from "./hooks/useHandleSessionHistory";
// Removed unused import from 'domain' and legacy design guardrail; see guardrails.ts for createResearchGuardrail if needed.
// import { createResearchGuardrail } from "@/app/agentConfigs/scenarios/workspaceBuilder/guardrails";

// Memory monitoring for detecting leaks in development
import { enableMemoryMonitoring } from './lib/memoryMonitor';

// Versioning for workspace localStorage. If user has an older (e.g., interior remodel) workspaceState, reset when entering the investment research scenario.
const WORKSPACE_VERSION_KEY = 'workspace_version';
const MEDICAL_RESEARCH_VERSION = 'medical_research_v1';

function App() {
  const searchParams = useSearchParams()!;
  const { user, isLoaded } = useUser();

  // One-time migration: when scenario is workspaceBuilder (investment research) ensure workspace state is versioned.
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const scenario = (new URL(window.location.href).searchParams.get('agentConfig')) || '';
    if (scenario !== 'medicalResearch') return;
    const currentVersion = window.localStorage.getItem(WORKSPACE_VERSION_KEY);
    if (currentVersion !== MEDICAL_RESEARCH_VERSION) {
      // Drop legacy workspace content (interior remodeling, etc.) so the research builder can start fresh.
      window.localStorage.removeItem('workspaceState');
      window.localStorage.setItem(WORKSPACE_VERSION_KEY, MEDICAL_RESEARCH_VERSION);
      // Force reload so WorkspaceContext initializes cleanly.
      window.location.reload();
    }
  }, []);

  // ---------------------------------------------------------------------
  // Codec selector – lets you toggle between wide-band Opus (48 kHz)
  // and narrow-band PCMU/PCMA (8 kHz) to hear what the agent sounds like on
  // a traditional phone line and to validate ASR / VAD behaviour under that
  // constraint.
  //
  // We read the `?codec=` query-param and rely on the `changePeerConnection`
  // hook (configured in `useRealtimeSession`) to set the preferred codec
  // before the offer/answer negotiation.
  // ---------------------------------------------------------------------
  const urlCodec = searchParams.get("codec") || "opus";

  // Agents SDK doesn't currently support codec selection so it is now forced 
  // via global codecPatch at module load 

  const {
    // addTranscriptMessage, // No longer needed - removed automatic "hi" message
    addTranscriptBreadcrumb,
    currentSessionId,
    setCurrentSession,
    loadTranscriptFromSession,
    saveTranscriptToDatabase,
    clearTranscript,
  } = useTranscript();
  const { logClientEvent, logServerEvent } = useEvent();
  const { currentProjectId, getCurrentProject, updateProject } = useProjectContext();

  const [selectedAgentName, setSelectedAgentName] = useState<string>("");
  const [selectedAgentConfigSet, setSelectedAgentConfigSet] = useState<
    RealtimeAgent[] | null
  >(null);
  
  // Suite state
  const [selectedSuiteId, setSelectedSuiteId] = useState<string | null>(() => {
    // Initialize from localStorage on client side only
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedSuiteId');
    }
    return null;
  });
  const [showSuiteSelector, setShowSuiteSelector] = useState(false);
  const currentSuite = selectedSuiteId ? findSuiteById(selectedSuiteId) : null;
  
  // Template prompt state
  const [showTemplatePrompt, setShowTemplatePrompt] = useState(false);
  const [pendingSuite, setPendingSuite] = useState<AgentSuite | null>(null);
  
  // Voice preferences state
  const [voicePreferences, setVoicePreferences] = useState<VoicePreferences | null>(null);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  // Ref to identify whether the latest agent switch came from an automatic handoff
  const handoffTriggeredRef = useRef(false);
  // Ref to track which project the agent is connected to (for auto-disconnect on project switch)
  const connectedProjectIdRef = useRef<string | null>(null);

  const sdkAudioElement = React.useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    const el = document.createElement('audio');
    el.autoplay = true;
    el.style.display = 'none';
    document.body.appendChild(el);
    return el;
  }, []);

  // Attach SDK audio element once it exists (after first render in browser)
  useEffect(() => {
    if (sdkAudioElement && !audioElementRef.current) {
      audioElementRef.current = sdkAudioElement;
    }
  }, [sdkAudioElement]);

  // Cleanup: Remove audio element from DOM when component unmounts
  useEffect(() => {
    return () => {
      if (sdkAudioElement && document.body.contains(sdkAudioElement)) {
        document.body.removeChild(sdkAudioElement);
        console.log('🧹 Cleaned up audio element from DOM');
      }
    };
  }, [sdkAudioElement]);

  const {
    connect,
    disconnect,
    sendUserText,
    sendEvent,
    interrupt,
    mute,
  } = useRealtimeSession({
    onConnectionChange: (s) => setSessionStatus(s as SessionStatus),
    onAgentHandoff: (agentName: string) => {
      handoffTriggeredRef.current = true;
      setSelectedAgentName(agentName);
    },
  });

  const [sessionStatus, setSessionStatus] =
    useState<SessionStatus>("DISCONNECTED");

  const [isEventsPaneExpanded, setIsEventsPaneExpanded] =
    useState<boolean>(true);
  const [isPTTActive, setIsPTTActive] = useState<boolean>(false);
  const [isPTTUserSpeaking, setIsPTTUserSpeaking] = useState<boolean>(false);
  const [isAudioPlaybackEnabled, setIsAudioPlaybackEnabled] = useState<boolean>(
    () => {
      if (typeof window === 'undefined') return true;
      const stored = localStorage.getItem('audioPlaybackEnabled');
      return stored ? stored === 'true' : true;
    },
  );

  // Initialize the recording hook.
  const { startRecording, stopRecording, downloadRecording, isRecording } =
    useAudioDownload();
  const [isRecordingEnabled, setIsRecordingEnabled] = useState<boolean>(false);
  const stopRecordingRef = useRef(stopRecording);

  useEffect(() => {
    stopRecordingRef.current = stopRecording;
  }, [stopRecording]);

  const sendClientEvent = (eventObj: any, eventNameSuffix = "") => {
    try {
      sendEvent(eventObj);
      logClientEvent(eventObj, eventNameSuffix);
    } catch (err) {
      console.error('Failed to send via SDK', err);
    }
  };

  useHandleSessionHistory();

  useEffect(() => {
    // Bootstrap based on ?agentConfig=, falling back to default when unknown
    const requested = searchParams.get("agentConfig");
    const validKeys = Object.keys(allAgentSets);
    const finalAgentConfig = validKeys.includes(requested || "")
      ? (requested as string)
      : defaultAgentSetKey;

    if (requested !== finalAgentConfig) {
      const url = new URL(window.location.toString());
      url.searchParams.set("agentConfig", finalAgentConfig);
      window.history.replaceState({}, '', url.toString());
    }

    const agents = allAgentSets[finalAgentConfig];
    const agentKeyToUse = agents[0]?.name || "";
    setSelectedAgentName(agentKeyToUse);
    setSelectedAgentConfigSet(agents);
  }, [searchParams]);

  // Fetch voice preferences when user is loaded
  useEffect(() => {
    if (!isLoaded || !user) return;
    
    const loadVoicePreferences = async () => {
      const preferences = await fetchVoicePreferences();
      setVoicePreferences(preferences);
      
      if (preferences?.enabled) {
        console.log('🎙️ Voice preferences loaded:', preferences.voice);
      }
    };
    
    loadVoicePreferences();
  }, [isLoaded, user]);

  useEffect(() => {
    if (selectedAgentName && sessionStatus === "DISCONNECTED") {
      connectToRealtime();
    }
  }, [selectedAgentName]);

  useEffect(() => {
    if (
      sessionStatus === "CONNECTED" &&
      selectedAgentConfigSet &&
      selectedAgentName
    ) {
      const currentAgent = selectedAgentConfigSet.find(
        (a) => a.name === selectedAgentName
      );
      addTranscriptBreadcrumb(`Agent: ${selectedAgentName}`, currentAgent);
      updateSession(); // No longer triggers automatic response
      // Reset flag after handling so subsequent effects behave normally
      handoffTriggeredRef.current = false;
    }
  }, [selectedAgentConfigSet, selectedAgentName, sessionStatus]);

  useEffect(() => {
    if (sessionStatus === "CONNECTED") {
      updateSession();
    }
  }, [isPTTActive]);

  const fetchEphemeralKey = async (): Promise<string | null> => {
    logClientEvent({ url: "/session" }, "fetch_session_token_request");
    const tokenResponse = await fetch("/api/session");
    const data = await tokenResponse.json();
    logServerEvent(data, "fetch_session_token_response");

    if (!data.client_secret?.value) {
      logClientEvent(data, "error.no_ephemeral_key");
      console.error("No ephemeral key provided by the server");
      setSessionStatus("DISCONNECTED");
      return null;
    }

    return data.client_secret.value;
  };

  const connectToRealtime = async () => {
    if (sessionStatus !== "DISCONNECTED") return;
    setSessionStatus("CONNECTING");

    try {
      const EPHEMERAL_KEY = await fetchEphemeralKey();
      if (!EPHEMERAL_KEY) return;

      let agents: RealtimeAgent[];
      let guardrails: any[];
      let suiteContext = {};

      // Try suite system first
      if (currentSuite) {
        console.log('🔌 Connecting to suite:', currentSuite.name);
        
        // Use suite agents
        agents = [...currentSuite.agents];
        
        // Ensure the selectedAgentName (root agent) is first
        const idx = agents.findIndex((a) => a.name === selectedAgentName);
        if (idx > 0) {
          const [agent] = agents.splice(idx, 1);
          agents.unshift(agent);
        }
        
        // Use suite guardrails
        guardrails = currentSuite.guardrails || [createModerationGuardrail(currentSuite.name)];
        
        // Include suite context
        suiteContext = {
          suiteId: currentSuite.id,
          suiteName: currentSuite.name,
          ...currentSuite.initialContext,
        };
      } else {
        // Fallback to old scenario system
        const agentSetKey = searchParams.get("agentConfig") || "default";
        if (sdkScenarioMap[agentSetKey]) {
          agents = [...sdkScenarioMap[agentSetKey]];
          const idx = agents.findIndex((a) => a.name === selectedAgentName);
          if (idx > 0) {
            const [agent] = agents.splice(idx, 1);
            agents.unshift(agent);
          }
          guardrails = [createModerationGuardrail("accai")];
        } else {
          throw new Error('No suite or scenario selected');
        }
      }
      
      // Apply voice preferences to all agents if enabled
      agents = applyVoicePreferences(agents, voicePreferences);
      if (voicePreferences?.enabled) {
        console.log(`🎙️ Applied voice override: ${voicePreferences.voice} to all agents`);
      }

      await connect({
        getEphemeralKey: async () => EPHEMERAL_KEY,
        initialAgents: agents,
        audioElement: sdkAudioElement,
        outputGuardrails: guardrails,
        extraContext: {
          ...suiteContext,
          workspaceState: getWorkspaceInfoForContext(),
          addTranscriptBreadcrumb,
        },
      });

      // Track which project we connected to
      connectedProjectIdRef.current = currentProjectId;
      
      // ============================================
      // SESSION PERSISTENCE: Create or Resume Session
      // ============================================
      try {
        if (!currentProjectId) {
          console.warn('No project selected, skipping session creation');
        } else {
          // Check if there's a working session for this project (is_saved=false)
          const sessionsResponse = await fetch(`/api/sessions?projectId=${currentProjectId}&saved=false&limit=1`);
          if (sessionsResponse.ok) {
            const { sessions } = await sessionsResponse.json();
            const workingSession = sessions?.[0]; // Most recent working session
            
            if (workingSession) {
              // Resume existing working session (continuous transcript)
              console.log('📂 Resuming working session:', workingSession.id);
              setCurrentSession(workingSession.id);
              
              // Load existing transcript
              try {
                await loadTranscriptFromSession(workingSession.id);
                addTranscriptBreadcrumb(`📂 Resumed working session`);
              } catch (loadError) {
                console.warn('Failed to load transcript from session:', loadError);
                // Continue anyway with empty transcript
              }
            } else {
              // Create new working session
              const suiteId = currentSuite?.id || 'default';
              const createResponse = await fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  projectId: currentProjectId, 
                  suiteId 
                }),
              });
              
              if (createResponse.ok) {
                const { session } = await createResponse.json();
                console.log('✅ Created new working session:', session.id);
                setCurrentSession(session.id);
                clearTranscript(); // Start fresh
                addTranscriptBreadcrumb(`🆕 New conversation started`);
              } else {
                console.error('Failed to create session, continuing without persistence');
              }
            }
          }
        }
      } catch (sessionError) {
        console.error('Error managing session:', sessionError);
        // Non-fatal: continue without persistence
      }
      
      // Add breadcrumb showing which project agent is connected to
      const currentProject = getCurrentProject();
      if (currentProject) {
        addTranscriptBreadcrumb(`🗂️ Connected to project: ${currentProject.name}`);
      }
      
      if (currentSuite) {
        addTranscriptBreadcrumb(`✅ Connected to ${currentSuite.name}`);
      }
    } catch (err) {
      console.error("Error connecting via SDK:", err);
      setSessionStatus("DISCONNECTED");
      addTranscriptBreadcrumb('❌ Connection failed', { error: String(err) });
    }
  };

  const disconnectFromRealtime = async () => {
    // ============================================
    // SESSION PERSISTENCE: Save and End Session
    // ============================================
    if (currentSessionId) {
      try {
        // Save transcript one final time
        await saveTranscriptToDatabase();
        console.log('💾 Final transcript save completed');
        
        // NOTE: We do NOT mark the working session as ended
        // This allows it to be resumed on reconnect (continuous transcript)
        // The user can explicitly save or start a new conversation if they want
        console.log('⏸️  Session paused (will resume on reconnect):', currentSessionId);
        
        // Keep currentSessionId in context so auto-save continues
        // Don't call setCurrentSession(null) here
      } catch (error) {
        console.error('Error saving session:', error);
        // Continue with disconnect anyway
      }
    }
    
    disconnect();
    setSessionStatus("DISCONNECTED");
    setIsPTTUserSpeaking(false);
    setIsRecordingEnabled(false);
    stopRecording();
    // Clear connected project ref
    connectedProjectIdRef.current = null;
  };

  // Removed sendSimulatedUserMessage - no longer needed since we don't auto-send "hi"
  // const sendSimulatedUserMessage = (text: string) => {
  //   const id = uuidv4().slice(0, 32);
  //   addTranscriptMessage(id, "user", text, true);
  //   sendClientEvent({
  //     type: 'conversation.item.create',
  //     item: {
  //       id,
  //       type: 'message',
  //       role: 'user',
  //       content: [{ type: 'input_text', text }],
  //     },
  //   });
  //   sendClientEvent({ type: 'response.create' }, '(simulated user text message)');
  // };

  const updateSession = () => {
    // Reflect Push-to-Talk UI state by (de)activating server VAD on the
    // backend. The Realtime SDK supports live session updates via the
    // `session.update` event.
    const turnDetection = isPTTActive
      ? null
      : {
          type: 'server_vad',
          threshold: 0.9,
          prefix_padding_ms: 300,
          silence_duration_ms: 500,
          create_response: true,
        };

    sendEvent({
      type: 'session.update',
      session: {
        turn_detection: turnDetection,
      },
    });

    // Removed automatic "hi" message - let user initiate conversation
    // This prevents wasteful get_workspace_info calls on every connection
    // if (shouldTriggerResponse) {
    //   sendSimulatedUserMessage('hi');
    // }
  }

  const handleSendTextMessage = (text: string) => {
    const trimmedMessage = text.trim();
    if (!trimmedMessage) return;
    interrupt();

    try {
      sendUserText(trimmedMessage);
    } catch (err) {
      console.error('Failed to send via SDK', err);
    }
  };

  const handleTalkButtonDown = () => {
    if (sessionStatus !== 'CONNECTED') return;
    interrupt();

    setIsPTTUserSpeaking(true);
    sendClientEvent({ type: 'input_audio_buffer.clear' }, 'clear PTT buffer');

    // No placeholder; we'll rely on server transcript once ready.
  };

  const handleTalkButtonUp = () => {
    if (sessionStatus !== 'CONNECTED' || !isPTTUserSpeaking)
      return;

    setIsPTTUserSpeaking(false);
    sendClientEvent({ type: 'input_audio_buffer.commit' }, 'commit PTT');
    sendClientEvent({ type: 'response.create' }, 'trigger response PTT');
  };

  const handleDownloadRecording = async () => {
    await downloadRecording();
    stopRecording();
    setIsRecordingEnabled(false);
  };

  const onToggleConnection = () => {
    if (sessionStatus === "CONNECTED" || sessionStatus === "CONNECTING") {
      disconnectFromRealtime();
      setSessionStatus("DISCONNECTED");
    } else {
      connectToRealtime();
    }
  };

  // Removed scenario & agent change handlers (single-agent app)

  // Because we need a new connection, refresh the page when codec changes
  const handleCodecChange = (newCodec: string) => {
    const url = new URL(window.location.toString());
    url.searchParams.set("codec", newCodec);
    window.location.replace(url.toString());
  };

  useEffect(() => {
    const storedPushToTalkUI = localStorage.getItem("pushToTalkUI");
    if (storedPushToTalkUI) {
      setIsPTTActive(storedPushToTalkUI === "true");
    }
    const storedLogsExpanded = localStorage.getItem("logsExpanded");
    if (storedLogsExpanded) {
      setIsEventsPaneExpanded(storedLogsExpanded === "true");
    }
    const storedAudioPlaybackEnabled = localStorage.getItem(
      "audioPlaybackEnabled"
    );
    if (storedAudioPlaybackEnabled) {
      setIsAudioPlaybackEnabled(storedAudioPlaybackEnabled === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("pushToTalkUI", isPTTActive.toString());
  }, [isPTTActive]);

  useEffect(() => {
    localStorage.setItem("logsExpanded", isEventsPaneExpanded.toString());
  }, [isEventsPaneExpanded]);

  useEffect(() => {
    localStorage.setItem(
      "audioPlaybackEnabled",
      isAudioPlaybackEnabled.toString()
    );
  }, [isAudioPlaybackEnabled]);

  useEffect(() => {
    if (audioElementRef.current) {
      if (isAudioPlaybackEnabled) {
        audioElementRef.current.muted = false;
        audioElementRef.current.play().catch((err) => {
          console.warn("Autoplay may be blocked by browser:", err);
        });
      } else {
        // Mute and pause to avoid brief audio blips before pause takes effect.
        audioElementRef.current.muted = true;
        audioElementRef.current.pause();
      }
    }

    // Toggle server-side audio stream mute so bandwidth is saved when the
    // user disables playback. 
    try {
      mute(!isAudioPlaybackEnabled);
    } catch (err) {
      console.warn('Failed to toggle SDK mute', err);
    }
  }, [isAudioPlaybackEnabled]);

  // Ensure mute state is propagated to transport right after we connect or
  // whenever the SDK client reference becomes available.
  useEffect(() => {
    if (sessionStatus === 'CONNECTED') {
      try {
        mute(!isAudioPlaybackEnabled);
      } catch (err) {
        console.warn('mute sync after connect failed', err);
      }
    }
  }, [sessionStatus, isAudioPlaybackEnabled]);

  useEffect(() => {
    if (!isRecordingEnabled) {
      if (isRecording) {
        stopRecording();
      }
      return;
    }

    if (sessionStatus !== "CONNECTED") {
      if (isRecording) {
        stopRecording();
      }
      return;
    }

    if (isRecording) {
      return;
    }

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const attemptStart = async (attempt = 0) => {
      if (
        cancelled ||
        !isRecordingEnabled ||
        sessionStatus !== "CONNECTED" ||
        isRecording
      ) {
        return;
      }

      const stream = audioElementRef.current?.srcObject as MediaStream | null;
      if (stream) {
        try {
          await startRecording(stream);
        } catch (err) {
          console.error("Failed to start recording", err);
        }
        return;
      }

      if (attempt < 10) {
        retryTimer = setTimeout(() => attemptStart(attempt + 1), 300);
      } else {
        console.warn("Remote audio stream not available for recording");
      }
    };

    attemptStart();

    return () => {
      cancelled = true;
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [
    isRecordingEnabled,
    sessionStatus,
    isRecording,
    startRecording,
    stopRecording,
  ]);

  useEffect(() => {
    return () => {
      stopRecordingRef.current();
    };
  }, []);

  // Single-agent app; no scenario key needed

  const [isTranscriptVisible, setIsTranscriptVisible] = useState(true);

  useEffect(() => {
    // Migration: Check for old key first, then use new key
    const oldStored = localStorage.getItem('transcriptVisible');
    const newStored = localStorage.getItem('sessionVisible');
    
    if (newStored !== null) {
      // New key exists, use it
      setIsTranscriptVisible(newStored === 'true');
    } else if (oldStored !== null) {
      // Migrate from old key
      setIsTranscriptVisible(oldStored === 'true');
      localStorage.setItem('sessionVisible', oldStored);
      localStorage.removeItem('transcriptVisible');
    } else {
      // Default
      setIsTranscriptVisible(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sessionVisible', isTranscriptVisible.toString());
  }, [isTranscriptVisible]);

  // Mobile tab navigation state
  const [mobileTab, setMobileTab] = useState<MobileTab>('workspace');
  
  // Get responsive context
  const { isMobile } = useResponsive();

  // Project Switcher state
  const [isProjectSwitcherOpen, setIsProjectSwitcherOpen] = useState(false);

  // Initialize suite on mount
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;
    
    // Check if we're using old URL-based scenario system
    const urlScenario = searchParams.get('agentConfig');
    
    if (urlScenario) {
      // Clear old URL parameter
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', newUrl);
    }
    
    // Check for stored suite
    const storedSuiteId = localStorage.getItem('selectedSuiteId');
    if (storedSuiteId && findSuiteById(storedSuiteId)) {
      const suite = findSuiteById(storedSuiteId);
      if (suite) {
        setSelectedAgentName(suite.rootAgent.name);
      }
    } else {
      // No stored suite - show selector
      setShowSuiteSelector(true);
    }
  }, []); // Only run once on mount

  // Handle suite selection (with template prompt)
  const handleSelectSuite = async (suite: AgentSuite) => {
    console.log('📦 Selected suite:', suite.name);
    
    // Save suite selection
    setSelectedSuiteId(suite.id);
    localStorage.setItem('selectedSuiteId', suite.id);
    setSelectedAgentName(suite.rootAgent.name);
    setShowSuiteSelector(false);
    
    // Check if suite has templates
    const hasTemplates = suite.workspaceTemplates && suite.workspaceTemplates.length > 0;
    if (!hasTemplates) {
      // No templates, just connect
      addTranscriptBreadcrumb(`📦 Suite selected: ${suite.name}`);
      return;
    }
    
    // Check user's preference for this suite in this project
    const currentProject = getCurrentProject();
    const preference = currentProject?.suiteTemplatePreferences?.[suite.id];
    
    if (preference === 'add') {
      // User previously chose to always add templates
      console.log('📋 Auto-adding templates (user preference)');
      try {
        await initializeWorkspaceWithTemplates(suite.workspaceTemplates || []);
        addTranscriptBreadcrumb(`📦 Suite selected: ${suite.name} (templates added)`);
      } catch (err) {
        console.error('Failed to initialize workspace templates:', err);
      }
      return;
    }
    
    if (preference === 'skip') {
      // User previously chose to skip templates
      console.log('🚫 Skipping templates (user preference)');
      addTranscriptBreadcrumb(`📦 Suite selected: ${suite.name}`);
      return;
    }
    
    // No preference set, show prompt
    setPendingSuite(suite);
    setShowTemplatePrompt(true);
  };
  
  // Handle template prompt - Add templates
  const handleAddTemplates = async (remember: boolean) => {
    if (!pendingSuite) return;
    
    console.log('📋 Adding templates from:', pendingSuite.name, remember ? '(remembering)' : '');
    
    try {
      await initializeWorkspaceWithTemplates(pendingSuite.workspaceTemplates || []);
      addTranscriptBreadcrumb(`📦 Suite selected: ${pendingSuite.name} (templates added)`);
      
      // Save preference if user checked "Remember"
      if (remember && currentProjectId) {
        await saveTemplatePreference(currentProjectId, pendingSuite.id, 'add');
      }
    } catch (err) {
      console.error('Failed to initialize workspace templates:', err);
    }
    
    setPendingSuite(null);
  };
  
  // Handle template prompt - Skip templates
  const handleSkipTemplates = async (remember: boolean) => {
    if (!pendingSuite) return;
    
    console.log('🚫 Skipping templates from:', pendingSuite.name, remember ? '(remembering)' : '');
    
    addTranscriptBreadcrumb(`📦 Suite selected: ${pendingSuite.name}`);
    
    // Save preference if user checked "Remember"
    if (remember && currentProjectId) {
      await saveTemplatePreference(currentProjectId, pendingSuite.id, 'skip');
    }
    
    setPendingSuite(null);
  };
  
  // Save template preference to project
  const saveTemplatePreference = async (
    projectId: string, 
    suiteId: string, 
    preference: 'add' | 'skip'
  ) => {
    try {
      const project = getCurrentProject();
      if (!project) return;
      
      const updatedPreferences = {
        ...project.suiteTemplatePreferences,
        [suiteId]: preference,
      };
      
      await updateProject(projectId, {
        suiteTemplatePreferences: updatedPreferences,
      });
      
      console.log(`✅ Saved template preference for ${suiteId}:`, preference);
    } catch (err) {
      console.error('Failed to save template preference:', err);
    }
  };

  // Handle suite change (disconnect first)
  const handleChangeSuite = () => {
    if (sessionStatus === "CONNECTED" || sessionStatus === "CONNECTING") {
      // Confirm before switching
      if (!window.confirm('This will end your current session. Continue?')) {
        return;
      }
      disconnectFromRealtime();
    }
    setShowSuiteSelector(true);
  };

  // Keyboard shortcut for project switcher (Cmd+P / Ctrl+P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        setIsProjectSwitcherOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ============================================
  // PAGE UNLOAD HANDLER: Save transcript before exit
  // ============================================
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Only try to save if we have an active session
      if (currentSessionId && sessionStatus === "CONNECTED") {
        // Save transcript synchronously using navigator.sendBeacon
        // This is more reliable than fetch() for unload events
        
        // Note: We can't await here, but the auto-save debounce should have
        // already saved most of the transcript. This is just a final attempt.
        saveTranscriptToDatabase().catch(err => {
          console.error('Failed to save on unload:', err);
        });
        
        // Optional: Show confirmation dialog if user has unsaved changes
        // Uncomment if you want to warn users before closing
        // e.preventDefault();
        // e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentSessionId, sessionStatus, saveTranscriptToDatabase]);

  // Auto-disconnect agent when switching projects (CRITICAL for context sync)
  useEffect(() => {
    // Only run if agent is connected
    if (sessionStatus === "DISCONNECTED") return;
    
    // If we're connected to a different project than the current one, disconnect
    if (connectedProjectIdRef.current && 
        connectedProjectIdRef.current !== currentProjectId) {
      
      console.log('🔄 Project switched while agent connected - auto-disconnecting');
      disconnectFromRealtime();
      
      // Show clear notification to user
      const currentProject = getCurrentProject();
      if (currentProject) {
        addTranscriptBreadcrumb(
          `🔄 Switched to project: ${currentProject.name}. Connect to start a new conversation.`
        );
      }
    }
  }, [currentProjectId, sessionStatus, disconnectFromRealtime, getCurrentProject, addTranscriptBreadcrumb]);

  // Enable memory monitoring in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      enableMemoryMonitoring(30000); // Check every 30 seconds
      console.log('🔍 Memory monitoring enabled - check console for periodic stats');
    }
  }, []);

  // Auth guard: show loading or redirect to sign-in (after all hooks are called)
  if (!isLoaded) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-text-secondary">Loading...</div>
    </div>;
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/sign-in';
    }
    return <div className="flex items-center justify-center h-screen">
      <div className="text-text-secondary">Redirecting to sign in...</div>
    </div>;
  }

  return (
    <div className="text-base flex flex-col h-screen bg-bg-primary text-text-primary relative">
      {/* Save Status Indicator */}
      <SaveStatusIndicator />
      
      {/* Suite Selector Modal */}
      <SuiteSelector
        isOpen={showSuiteSelector}
        onSelectSuite={handleSelectSuite}
        onClose={() => {
          // Only allow closing if a suite is already selected
          if (selectedSuiteId) {
            setShowSuiteSelector(false);
          }
        }}
      />

      {/* Header - mobile-optimized: compact and clean */}
      <div className={`flex justify-between items-center ${isMobile ? 'p-3 text-base' : 'p-5 text-lg'} font-semibold`}>
        <div
          className="flex items-center cursor-pointer"
          onClick={() => window.location.reload()}
        >
          <div>
            <Image
              src="/openai-logomark.svg"
              alt="OpenAI Logo"
              width={isMobile ? 16 : 20}
              height={isMobile ? 16 : 20}
              className="mr-2"
            />
          </div>
          <div className={isMobile ? 'text-sm' : ''}>
            accai <span className="text-text-secondary">Agent</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* User Info - hide email on mobile, keep avatar */}
          {isLoaded && user && (
            <div className="flex items-center gap-3">
              {/* Hide email on mobile */}
              <span className="text-text-secondary text-sm font-mono hidden lg:inline">
                {user.emailAddresses[0]?.emailAddress}
              </span>
              <UserButton afterSignOutUrl="/">
                <UserButton.MenuItems>
                  {/* Switch Suite - especially useful on mobile where suite indicator is hidden */}
                  {currentSuite && (
                    <UserButton.Action
                      label={`Suite: ${currentSuite.name}`}
                      labelIcon={
                        <span className="text-base" role="img" aria-label={currentSuite.name}>
                          {currentSuite.icon}
                        </span>
                      }
                      onClick={handleChangeSuite}
                    />
                  )}
                  <UserButton.Action
                    label="Voice Settings"
                    labelIcon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    }
                    onClick={() => setShowVoiceSettings(true)}
                  />
                </UserButton.MenuItems>
              </UserButton>
            </div>
          )}
          
          {/* Suite Indicator - hide on mobile, show on desktop */}
          {currentSuite && (
            <div className="hidden lg:block">
              <SuiteIndicator
                currentSuite={currentSuite}
                onChangeSuite={handleChangeSuite}
              />
            </div>
          )}
          
          {/* Fallback: Old scenario selector (for backwards compatibility) - hide on mobile */}
          {!currentSuite && (
            <div className="hidden lg:flex lg:items-center lg:gap-2">
              <label className="text-sm text-text-secondary uppercase tracking-wider">Scenario</label>
              <select
                className="border border-border-primary bg-bg-secondary text-text-primary px-2 py-1 focus:outline-none focus:border-accent-primary cursor-pointer text-sm font-mono transition-colors"
                value={(() => {
                  const requested = searchParams.get('agentConfig');
                  const keys = Object.keys(allAgentSets);
                  return keys.includes(requested || '') ? (requested as string) : defaultAgentSetKey;
                })()}
                onChange={(e) => {
                  // Disconnect then navigate to the selected scenario
                  try { disconnectFromRealtime(); } catch {}
                  const url = new URL(window.location.toString());
                  url.searchParams.set('agentConfig', e.target.value);
                  window.location.replace(url.toString());
                }}
              >
                {Object.keys(allAgentSets).map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className={`flex flex-1 overflow-hidden relative ${isMobile ? 'px-0 gap-0' : 'px-2 gap-2'}`} style={{ marginBottom: isMobile ? '56px' : '0' }}>
        {/* MOBILE: Show only one panel at a time based on tab */}
        {isMobile ? (
          <>
            {mobileTab === 'workspace' && (currentSuite || (typeof window !== 'undefined' && new URL(window.location.href).searchParams.get('agentConfig') === 'workspaceBuilder')) && (
              <Workspace 
                sessionStatus={sessionStatus}
                onOpenProjectSwitcher={() => setIsProjectSwitcherOpen(true)}
              />
            )}
            {mobileTab === 'transcript' && (
              <Transcript
                onSendMessage={handleSendTextMessage}
                downloadRecording={handleDownloadRecording}
                canSend={sessionStatus === "CONNECTED"}
                isVisible={true}
                sessionStatus={sessionStatus}
                isPTTActive={isPTTActive}
                setIsPTTActive={setIsPTTActive}
                isPTTUserSpeaking={isPTTUserSpeaking}
                handleTalkButtonDown={handleTalkButtonDown}
                handleTalkButtonUp={handleTalkButtonUp}
              />
            )}
          </>
        ) : (
          /* DESKTOP/TABLET: Show workspace + transcript side-by-side */
          <>
            {(currentSuite || (typeof window !== 'undefined' && new URL(window.location.href).searchParams.get('agentConfig') === 'workspaceBuilder')) && (
              <Workspace 
                sessionStatus={sessionStatus}
                onOpenProjectSwitcher={() => setIsProjectSwitcherOpen(true)}
              />
            )}
            <Transcript
              onSendMessage={handleSendTextMessage}
              downloadRecording={handleDownloadRecording}
              canSend={sessionStatus === "CONNECTED"}
              isVisible={isTranscriptVisible}
              sessionStatus={sessionStatus}
              isPTTActive={isPTTActive}
              setIsPTTActive={setIsPTTActive}
              isPTTUserSpeaking={isPTTUserSpeaking}
              handleTalkButtonDown={handleTalkButtonDown}
              handleTalkButtonUp={handleTalkButtonUp}
            />
            {/* Hide logs on mobile - developer feature */}
            <div className="hidden lg:block">
              <Events isExpanded={isEventsPaneExpanded} />
            </div>
          </>
        )}
      </div>
      
      {/* Mobile bottom navigation */}
      <BottomNav 
        activeTab={mobileTab} 
        onTabChange={setMobileTab} 
      />

      <BottomToolbar
        sessionStatus={sessionStatus}
        onToggleConnection={onToggleConnection}
        isEventsPaneExpanded={isEventsPaneExpanded}
        setIsEventsPaneExpanded={setIsEventsPaneExpanded}
        isAudioPlaybackEnabled={isAudioPlaybackEnabled}
        setIsAudioPlaybackEnabled={setIsAudioPlaybackEnabled}
        isRecordingEnabled={isRecordingEnabled}
        setIsRecordingEnabled={setIsRecordingEnabled}
        isRecordingActive={isRecording}
        codec={urlCodec}
        onCodecChange={handleCodecChange}
        isTranscriptVisible={isTranscriptVisible}
        setIsTranscriptVisible={setIsTranscriptVisible}
        currentProjectName={getCurrentProject()?.name}
      />

      {/* Timer - floating overlay */}
      <Timer />

      {/* Project Switcher Modal */}
      <ProjectSwitcher
        isOpen={isProjectSwitcherOpen}
        onClose={() => setIsProjectSwitcherOpen(false)}
        sessionStatus={sessionStatus}
      />
      
      {/* Template Prompt Modal */}
      {showTemplatePrompt && pendingSuite && (
        <SuiteTemplatePrompt
          suite={pendingSuite}
          onAdd={handleAddTemplates}
          onSkip={handleSkipTemplates}
          onClose={() => {
            setShowTemplatePrompt(false);
            setPendingSuite(null);
          }}
        />
      )}
      
      {/* Voice Settings Modal */}
      <VoiceSettingsModal
        isOpen={showVoiceSettings}
        onClose={() => {
          setShowVoiceSettings(false);
          // Reload preferences after closing modal to update state
          fetchVoicePreferences().then((prefs) => {
            setVoicePreferences(prefs);
          });
        }}
        sessionStatus={sessionStatus}
      />
    </div>
  );
}

export default App;
