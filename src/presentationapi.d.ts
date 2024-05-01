declare global {
  interface PresentationAvailability extends EventTarget {
    readonly value: boolean;
    onchange?: (event: Event) => void;
  }

  type PresentationConnectionCloseReason = "error" | "closed" | "wentaway";

  interface PresentationConnectionCloseEvent extends Event {
    readonly reason: PresentationConnectionCloseReason;
    /** @default "" */
    readonly message: string;
  }

  interface PresentationConnection extends EventTarget {
    /**
     * @default "arraybuffer"
     */
    binaryType: "arraybuffer" | "blob";
    readonly id: string;
    readonly state: "connecting" | "connected" | "closed" | "terminated";
    readonly url: string;

    close(): void;
    send(data: string | ArrayBuffer | ArrayBufferView | Blob): void;
    terminate(): void;

    onclose?: (event: PresentationConnectionCloseEvent) => void;
    onconnect?: (event: Event & { target: PresentationConnection }) => void;
    onmessage?: (
      event: Event & { target: PresentationConnection } & {
        data: string | ArrayBuffer | Blob;
      }
    ) => void;
    onterminate?: (event: Event & { target: PresentationConnection }) => void;

    // addEventListener(
    //   type: "close",
    //   callback: (event: PresentationConnectionCloseEvent) => void,
    //   options?: AddEventListenerOptions | boolean
    // ): void;
  }

  interface PresentationAvailableEvent extends Event {
    readonly connection: PresentationConnection;
  }
  class PresentationRequest extends EventTarget {
    constructor(url: string);
    constructor(urls: string[]);

    start(): Promise<PresentationConnection>;
    reconnect(presentationId: string): Promise<PresentationConnection>;
    getAvailability(): Promise<PresentationAvailability>;

    onconnectionavailable?: (event: PresentationAvailableEvent) => void;
  }

  interface PresentationConnectionList extends EventTarget {
    /**
     * Techically frozen array
     */
    readonly connections: ReadonlyArray<PresentationConnection>;
    onconnectionavailable?: (event: PresentationAvailableEvent) => void;
  }

  interface PresentationReceiver {
    readonly connectionList: Promise<PresentationConnectionList>;
  }

  interface Navigator {
    readonly presentation: {
      defaultRequest?: PresentationRequest;
      receiver?: PresentationReceiver;
      // Questionable if this really exists
      onconnectionavailable?: (event: PresentationAvailableEvent) => void;
    };
  }
}

export {};
