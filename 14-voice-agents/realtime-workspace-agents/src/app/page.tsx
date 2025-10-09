import React, { Suspense } from "react";
import { TranscriptProvider } from "@/app/contexts/TranscriptContext";
import { EventProvider } from "@/app/contexts/EventContext";
import { WorkspaceProvider } from "@/app/contexts/WorkspaceContext";
import { ProjectProvider } from "@/app/contexts/ProjectContext";
import { BriefProvider } from "@/app/contexts/BriefContext";
import App from "./App";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectProvider>
        <BriefProvider>
          <TranscriptProvider>
            <EventProvider>
              <WorkspaceProvider>
                <App />
              </WorkspaceProvider>
            </EventProvider>
          </TranscriptProvider>
        </BriefProvider>
      </ProjectProvider>
    </Suspense>
  );
}
