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
  } = useTranscript();
  const { logClientEvent, logServerEvent } = useEvent();
  const { currentProjectId, getCurrentProject } = useProjectContext();

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
  const [userText, setUserText] = useState<string>("");
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
  const { startRecording, stopRecording, downloadRecording } =
    useAudioDownload();

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

  const disconnectFromRealtime = () => {
    disconnect();
    setSessionStatus("DISCONNECTED");
    setIsPTTUserSpeaking(false);
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

  const handleSendTextMessage = () => {
    if (!userText.trim()) return;
    interrupt();

    try {
      sendUserText(userText.trim());
    } catch (err) {
      console.error('Failed to send via SDK', err);
    }

    setUserText("");
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
    if (sessionStatus === "CONNECTED" && audioElementRef.current?.srcObject) {
      // The remote audio stream from the audio element.
      const remoteStream = audioElementRef.current.srcObject as MediaStream;
      startRecording(remoteStream);
    }

    // Clean up on unmount or when sessionStatus is updated.
    return () => {
      stopRecording();
    };
  }, [sessionStatus]);

  // Single-agent app; no scenario key needed

  const [isTranscriptVisible, setIsTranscriptVisible] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('transcriptVisible');
    if (stored !== null) {
      setIsTranscriptVisible(stored === 'true');
    } else {
      setIsTranscriptVisible(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('transcriptVisible', isTranscriptVisible.toString());
  }, [isTranscriptVisible]);

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

  // Handle suite selection
  const handleSelectSuite = async (suite: AgentSuite) => {
    console.log('📦 Selected suite:', suite.name);
    
    // Save preference
    setSelectedSuiteId(suite.id);
    localStorage.setItem('selectedSuiteId', suite.id);
    
    // Set root agent
    setSelectedAgentName(suite.rootAgent.name);
    
    // Close selector
    setShowSuiteSelector(false);
    
    // Initialize workspace with templates
    if (suite.workspaceTemplates && suite.workspaceTemplates.length > 0) {
      try {
        await initializeWorkspaceWithTemplates(suite.workspaceTemplates);
      } catch (err) {
        console.error('Failed to initialize workspace templates:', err);
      }
    }
    
    addTranscriptBreadcrumb(`📦 Suite selected: ${suite.name}`);
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

      <div className="p-5 text-lg font-semibold flex justify-between items-center">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => window.location.reload()}
        >
          <div>
            <Image
              src="/openai-logomark.svg"
              alt="OpenAI Logo"
              width={20}
              height={20}
              className="mr-2"
            />
          </div>
          <div>
            accai <span className="text-text-secondary">Agent</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* User Info */}
          {isLoaded && user && (
            <div className="flex items-center gap-3 mr-4">
              <span className="text-text-secondary text-sm font-mono">
                {user.emailAddresses[0]?.emailAddress}
              </span>
              <UserButton afterSignOutUrl="/" />
            </div>
          )}
          
          {/* Suite Indicator */}
          {currentSuite && (
            <SuiteIndicator
              currentSuite={currentSuite}
              onChangeSuite={handleChangeSuite}
            />
          )}
          
          {/* Fallback: Old scenario selector (for backwards compatibility) */}
          {!currentSuite && (
            <>
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
            </>
          )}
        </div>
      </div>

      <div className="flex flex-1 gap-2 px-2 overflow-hidden relative">
        {/* Show workspace if suite is selected OR if using old workspaceBuilder scenario */}
        {(currentSuite || (typeof window !== 'undefined' && new URL(window.location.href).searchParams.get('agentConfig') === 'workspaceBuilder')) && (
          <Workspace 
            sessionStatus={sessionStatus}
            onOpenProjectSwitcher={() => setIsProjectSwitcherOpen(true)}
          />
        )}
        <Transcript
          userText={userText}
          setUserText={setUserText}
          onSendMessage={handleSendTextMessage}
          downloadRecording={downloadRecording}
          canSend={sessionStatus === "CONNECTED"}
          isVisible={isTranscriptVisible}
        />
        <Events isExpanded={isEventsPaneExpanded} />
      </div>

      <BottomToolbar
        sessionStatus={sessionStatus}
        onToggleConnection={onToggleConnection}
        isPTTActive={isPTTActive}
        setIsPTTActive={setIsPTTActive}
        isPTTUserSpeaking={isPTTUserSpeaking}
        handleTalkButtonDown={handleTalkButtonDown}
        handleTalkButtonUp={handleTalkButtonUp}
        isEventsPaneExpanded={isEventsPaneExpanded}
        setIsEventsPaneExpanded={setIsEventsPaneExpanded}
        isAudioPlaybackEnabled={isAudioPlaybackEnabled}
        setIsAudioPlaybackEnabled={setIsAudioPlaybackEnabled}
        codec={urlCodec}
        onCodecChange={handleCodecChange}
        isTranscriptVisible={isTranscriptVisible}
        setIsTranscriptVisible={setIsTranscriptVisible}
        currentProjectName={getCurrentProject()?.name}
      />

      {/* Project Switcher Modal */}
      <ProjectSwitcher
        isOpen={isProjectSwitcherOpen}
        onClose={() => setIsProjectSwitcherOpen(false)}
        sessionStatus={sessionStatus}
      />
    </div>
  );
}

export default App;
