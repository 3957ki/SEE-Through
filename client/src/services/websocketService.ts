import { WebSocketManager } from "@/lib/websocket";

// Get the WebSocket server URL from environment variables
const WS_LOCAL_SERVER_URL = import.meta.env.VITE_WS_LOCAL_SERVER_URL || "ws://localhost:9000/ws";

// Create a singleton instance for the local server WebSocket
export const localServerWS = new WebSocketManager({
  url: WS_LOCAL_SERVER_URL,
  reconnect: true,
  reconnectInterval: 3000,
  maxReconnectAttempts: 10,
  onOpen: () => {
    console.log("Local server WebSocket connected");
  },
  onError: (event) => {
    console.error("Local server WebSocket error:", event);
  },
});

// Initialize WebSocket connection
export function initLocalServerWebSocket() {
  // Connect to WebSocket server
  localServerWS.connect();
}

// Function to send a message to the local server
export function sendToLocalServer(data: any): boolean {
  return localServerWS.send(data);
}

// Function to register a message handler
export function onLocalServerMessage(handler: (data: any) => void): void {
  localServerWS.onMessage(handler);
}

// Function to remove a message handler
export function offLocalServerMessage(handler: (data: any) => void): void {
  localServerWS.offMessage(handler);
}

// Function to check if the WebSocket is connected
export function isLocalServerConnected(): boolean {
  return localServerWS.getStatus() === "OPEN";
}

// Function to disconnect from the WebSocket
export function disconnectLocalServer(): void {
  localServerWS.disconnect();
}
