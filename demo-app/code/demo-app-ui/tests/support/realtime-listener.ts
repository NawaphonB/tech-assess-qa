import { BFF_URL } from '../../playwright.config';

export interface RealtimeMessage {
  type: 'CLAIM_SUBMITTED' | 'CLAIM_STATUS_CHANGED';
  claimId: string;
  newStatus?: string;
  oldStatus?: string;
}

const WS_URL = BFF_URL.replace(/^http/, 'ws') + '/api/ws/claims';

/** Listens on the BFF WebSocket as one user and records every claim message it receives. */
export class RealtimeListener {
  readonly messages: RealtimeMessage[] = [];

  private constructor(private readonly socket: WebSocket) {
    socket.addEventListener('message', (event) => {
      try {
        this.messages.push(JSON.parse(String(event.data)));
      } catch {
        // ping frames and non-JSON messages are ignored
      }
    });
  }

  static open(accessToken: string, timeoutMs = 5_000): Promise<RealtimeListener> {
    const socket = new WebSocket(`${WS_URL}?token=${encodeURIComponent(accessToken)}`);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('WebSocket did not open in time')), timeoutMs);
      socket.addEventListener('open', () => {
        clearTimeout(timer);
        resolve(new RealtimeListener(socket));
      });
      socket.addEventListener('error', () => {
        clearTimeout(timer);
        reject(new Error('WebSocket handshake was refused'));
      });
    });
  }

  /** Resolves with the first matching message, or undefined when none arrives in time. */
  async waitFor(match: (message: RealtimeMessage) => boolean, timeoutMs = 5_000): Promise<RealtimeMessage | undefined> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const found = this.messages.find(match);
      if (found) return found;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return undefined;
  }

  close(): void {
    this.socket.close();
  }
}
