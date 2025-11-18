import React, { Suspense } from "react";
import { TranscriptProvider } from "@/app/contexts/TranscriptContext";
import { EventProvider } from "@/app/contexts/EventContext";
import { WorkspaceProvider } from "@/app/contexts/WorkspaceContext";
import { ProjectProvider } from "@/app/contexts/ProjectContext";
import { WorkJournalProvider } from "@/app/contexts/WorkJournalContext";
import App from "./App";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectProvider>
        <TranscriptProvider>
          <WorkJournalProvider>
            <EventProvider>
              <WorkspaceProvider>
                <App />
              </WorkspaceProvider>
            </EventProvider>
          </WorkJournalProvider>
        </TranscriptProvider>
      </ProjectProvider>
    </Suspense>
  );
}
