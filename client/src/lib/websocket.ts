type WebSocketStatus = "CONNECTING" | "OPEN" | "CLOSING" | "CLOSED" | "ERROR";

interface WebSocketOptions {
  url: string;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (event: Event) => void;
}

type MessageHandler = (data: any) => void;

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private status: WebSocketStatus = "CLOSED";
  private reconnectAttempts = 0;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private options: WebSocketOptions;

  constructor(options: WebSocketOptions) {
    this.options = {
      reconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      ...options,
    };
  }

  public connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log("WebSocket is already connected");
      return;
    }

    try {
      console.log("Connecting to WebSocket:", this.options.url);
      this.ws = new WebSocket(this.options.url);
      this.setupEventHandlers();
      this.status = "CONNECTING";
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      this.status = "ERROR";
      this.handleError(error as Event);
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log("WebSocket connected");
      this.status = "OPEN";
      this.reconnectAttempts = 0;
      this.options.onOpen?.();
    };

    this.ws.onclose = () => {
      console.log("WebSocket closed");
      this.status = "CLOSED";
      this.options.onClose?.();
      this.handleReconnect();
    };

    this.ws.onerror = (event) => {
      console.error("WebSocket error:", event);
      this.status = "ERROR";
      this.options.onError?.(event);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.messageHandlers.get("message")?.forEach((handler) => handler(data));
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };
  }

  private handleReconnect(): void {
    if (
      !this.options.reconnect ||
      this.reconnectAttempts >= (this.options.maxReconnectAttempts || 5)
    ) {
      console.log("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.options.maxReconnectAttempts})...`
    );

    setTimeout(() => {
      this.connect();
    }, this.options.reconnectInterval || 3000);
  }

  private handleError(event: Event): void {
    this.status = "ERROR";
    this.options.onError?.(event);
    this.handleReconnect();
  }

  public disconnect(): void {
    if (this.ws) {
      this.status = "CLOSING";
      this.ws.close();
      this.ws = null;
      this.status = "CLOSED";
      this.options.onClose?.();
    }
  }

  public send(data: any): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      return false;
    }

    try {
      this.ws.send(JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Failed to send message:", error);
      return false;
    }
  }

  public onMessage(handler: MessageHandler): void {
    if (!this.messageHandlers.has("message")) {
      this.messageHandlers.set("message", []);
    }
    this.messageHandlers.get("message")?.push(handler);
  }

  public offMessage(handler: MessageHandler): void {
    const handlers = this.messageHandlers.get("message");
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  public getStatus(): WebSocketStatus {
    return this.status;
  }

  // 웹소켓 연결될 때 까지 기다림
  public waitForOpen(timeout = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.status === "OPEN") {
        resolve();
        return;
      }

      const checkInterval = 100;
      let waited = 0;

      const interval = setInterval(() => {
        if (this.status === "OPEN") {
          clearInterval(interval);
          resolve();
        } else {
          waited += checkInterval;
          if (waited >= timeout) {
            clearInterval(interval);
            reject(new Error("WebSocket connection timeout"));
          }
        }
      }, checkInterval);
    });
  }
}
