// Events.tsx - Enhanced log panel
"use client";

import React, { useRef, useEffect, useState } from "react";
import { useEvent } from "@/app/contexts/EventContext";
import { LoggedEvent } from "@/app/types";
import { motion } from "framer-motion";

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
    <motion.div
      className="flex-col bg-bg-secondary border-l border-border-primary min-h-0 flex flex-shrink-0 glass-panel"
      animate={{ width: isExpanded ? 320 : 0, opacity: isExpanded ? 1 : 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={{ overflow: 'hidden' }}
    >
      <div className="flex flex-col h-full" ref={eventLogsContainerRef} style={{ overflowY: 'auto' }} data-lenis-prevent>
        <div className="flex items-center justify-between px-6 py-3 sticky top-0 z-10 text-base border-b border-white/10 bg-bg-secondary/50 backdrop-blur-sm">
          <span className="font-semibold uppercase tracking-widest text-text-primary font-mono">Logs</span>
        </div>
        <div className="flex-1">
          {loggedEvents.map((log, idx) => {
            const arrowInfo = getDirectionArrow(log.direction);
            const isError =
              log.eventName.toLowerCase().includes("error") ||
              log.eventData?.response?.status_details?.error != null;

            return (
              <motion.div
                key={`${log.id}-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-white/5 py-2 px-6 font-mono hover:bg-white/5 transition-colors"
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
                  <motion.div 
                    className="text-text-primary text-left mt-2"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                  >
                    <pre className="border-l-2 ml-1 border-white/10 whitespace-pre-wrap break-words font-mono text-xs pl-2 bg-black/20 p-2 rounded">
                      {JSON.stringify(log.eventData, null, 2)}
                    </pre>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export default Events;
