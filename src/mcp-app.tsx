/**
 * @file App that demonstrates a simple waiting room UI using MCP Apps SDK + React.
 */
import type { App, McpUiHostContext } from "@modelcontextprotocol/ext-apps";
import { useApp } from "@modelcontextprotocol/ext-apps/react";
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";


function WaitingRoomApp() {
  const [hostContext, setHostContext] = useState<McpUiHostContext | undefined>();

  const { app, error } = useApp({
    appInfo: { name: "Waiting Room App", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app) => {
      app.onerror = console.error;
      app.onhostcontextchanged = (params) => {
        setHostContext((prev) => ({ ...prev, ...params }));
      };
    },
  });

  useEffect(() => {
    if (app) {
      setHostContext(app.getHostContext());
    }
  }, [app]);

  if (error) return <div><strong>ERROR:</strong> {error.message}</div>;
  if (!app) return <div>Connecting...</div>;

  return <WaitingRoomAppInner app={app} hostContext={hostContext} />;
}

import GameHub from "./games/GameHub";
import Clicker from "./games/Clicker";

interface WaitingRoomAppInnerProps {
  app: App;
  hostContext?: McpUiHostContext;
}

function WaitingRoomAppInner({ app }: WaitingRoomAppInnerProps) {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInitialGame() {
      try {
        const result = await app.callServerTool({ name: "get-current-game" });
        if (result.content?.[0]?.type === "text") {
          const data = JSON.parse(result.content[0].text);
          if (data.game) {
            setActiveGame(data.game);
          }
        }
      } catch (err) {
        console.error("Failed to fetch initial game state", err);
      } finally {
        setLoading(false);
      }
    }

    loadInitialGame();
  }, [app]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "white", backgroundColor: "#0d1117" }}>
        Loading experience...
      </div>
    );
  }

  // Render proper game component based on active route
  if (activeGame === "clicker") {
    return <Clicker app={app} onExit={() => setActiveGame(null)} />;
  }

  // Fallback to hub
  return <GameHub app={app} onSelectGame={(gameId) => setActiveGame(gameId)} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WaitingRoomApp />
  </StrictMode>,
);
