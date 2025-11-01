"use client";

import React, { useRef, useEffect, useState } from "react";
import { useEvent } from "@/app/contexts/EventContext";
import { LoggedEvent } from "@/app/types";

export interface EventsProps {
  isExpanded: boolean;
}

function Events({ isExpanded }: EventsProps) {
  const [prevEventLogs, setPrevEventLogs] = useState<LoggedEvent[]>([]);
  const eventLogsContainerRef = useRef<HTMLDivElement | null>(null);

  const { loggedEvents, toggleExpand } = useEvent();

  const getDirectionArrow = (direction: string) => {
    if (direction === "client") return { symbol: "▲", color: "#00d9ff" }; // cyan accent
    if (direction === "server") return { symbol: "▼", color: "#00ff88" }; // success green
    return { symbol: "•", color: "#8a8a8a" }; // text-secondary
  };

  useEffect(() => {
    const hasNewEvent = loggedEvents.length > prevEventLogs.length;

    if (isExpanded && hasNewEvent && eventLogsContainerRef.current) {
      eventLogsContainerRef.current.scrollTop =
        eventLogsContainerRef.current.scrollHeight;
    }

    setPrevEventLogs(loggedEvents);
  }, [loggedEvents, isExpanded]);

  return (
    <div
      className={
        (isExpanded ? "w-80 overflow-auto" : "w-0 overflow-hidden opacity-0") +
        " transition-all duration-200 ease-in-out flex-col bg-bg-secondary border border-border-primary min-h-0 flex flex-shrink-0"
      }
      ref={eventLogsContainerRef}
    >
      {isExpanded && (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-3 sticky top-0 z-10 text-base border-b border-border-primary bg-bg-secondary">
            <span className="font-semibold uppercase tracking-widest text-text-primary font-mono">Logs</span>
          </div>
          <div className="flex-1 overflow-auto">
            {loggedEvents.map((log, idx) => {
              const arrowInfo = getDirectionArrow(log.direction);
              const isError =
                log.eventName.toLowerCase().includes("error") ||
                log.eventData?.response?.status_details?.error != null;

              return (
                <div
                  key={`${log.id}-${idx}`}
                  className="border-t border-border-primary py-2 px-6 font-mono hover:bg-bg-tertiary transition-colors"
                >
                  <div
                    onClick={() => toggleExpand(log.id)}
                    className="flex items-center justify-between cursor-pointer gap-2"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <span
                        style={{ color: arrowInfo.color }}
                        className="ml-1 mr-2 font-bold flex-shrink-0"
                      >
                      {arrowInfo.symbol}
                      </span>
                      <span
                        title={log.eventName}
                        className={
                          "text-sm truncate " +
                          (isError ? "text-status-error" : "text-text-primary")
                        }
                      >
                        {log.eventName}
                      </span>
                    </div>
                    <div className="text-text-tertiary text-xs whitespace-nowrap flex-shrink-0">
                      {log.timestamp}
                    </div>
                  </div>

                  {log.expanded && log.eventData && (
                    <div className="text-text-primary text-left">
                      <pre className="border-l-2 ml-1 border-border-primary whitespace-pre-wrap break-words font-mono text-xs mb-2 mt-2 pl-2 bg-bg-tertiary p-2">
                        {JSON.stringify(log.eventData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Events;
