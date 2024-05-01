import {
  createEffect,
  createResource,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";

const PRESENTATION_URLS = ["/", "/slides"];

/**
 *
 * @param {(event: Event & {target: PresentationAvailability}) => void} onAvailabilityChange
 * @param {PresentationRequest} request
 */
async function getIsAvailable(onAvailabilityChange, request) {
  /** @type {PresentationAvailability} */
  let availability;
  try {
    availability = await request.getAvailability();
  } catch (error) {
    console.warn("Presentation monitoring might not be supported.", error);
    // From MDN:
    // Availability monitoring is not supported by the platform, so discovery of
    // presentation displays will happen only after request.start() is called.
    // Pretend the devices are available for simplicity; or, one could implement
    // a third state for the button.
    return true;
  }

  availability.addEventListener(
    "change",
    /** @type {(event: Event) => void} */ (onAvailabilityChange)
  );
}

/**
 *
 * @param {PresentationRequest} request
 * @returns {import("solid-js").Accessor<boolean>}
 */
function useIsAvailable(request) {
  //TODO add third state of "is loading"
  // Can not use crateResource because we need to react to the availability change event
  const [isAvailable, setIsAvailable] = createSignal(false);

  onMount(async () => {
    getIsAvailable((event) => {
      console.debug("Availability changed", event.target?.value);
      setIsAvailable(event.target?.value);
    }, request);
  });

  return isAvailable;
}

// What do I want the API surface to look like?
// Can I make a connection?

/**
 * Enable the user agent to initialize presentations
 * @param {import("solid-js").Setter<any>} setConnection
 * @param {PresentationRequest} request
 */
function enableUserAgent(setConnection, request) {
  onMount(() => {
    if (!("presentation" in navigator)) return;
    navigator.presentation.defaultRequest = request;
    // Event might not exist
    navigator.presentation.onconnectionavailable = (event) => {
      console.log("Connection available", event.connection.id);
      setConnection(event.connection);
    };
  });
}
/**
 *
 * @param {import("solid-js").Accessor<any>} getConnection
 */
function useCleanup(getConnection) {
  createEffect((oldConnection) => {
    const newConnection = getConnection();
    if (
      !oldConnection ||
      oldConnection === newConnection ||
      oldConnection.state === "closed"
    )
      return newConnection;

    // Clean up the old connection
    delete localStorage["presentation id"];
    oldConnection.onclose = undefined;
    oldConnection.close();

    // Use new connection as old connection next call
    return newConnection;
  }, getConnection());
}

/**
 *
 * @param {import("solid-js").Setter<any>} setConnection
 * @param {PresentationRequest} request
 */
function useReconnect(setConnection, request) {
  // Reconnect if there is an existing connection
  onMount(async () => {
    const id = localStorage["presentation id"];
    if (!id) return;

    const connection = await request.reconnect(id);
    setConnection(connection);
  });
}

export function usePresentationApi() {
  const request = new PresentationRequest(PRESENTATION_URLS);
  document.onabort;
  //TODO check if is supported by browser
  const isAvailable = useIsAvailable(request);
  /** @type {import("solid-js").Signal< PresentationConnection | undefined | null>}*/
  const [connection, setConnection] = createSignal();
  useReconnect(setConnection, request);

  const [isConnected, setIsConnected] = createSignal(false);

  // Presentation can be initialized by the user agent (the user's browser)
  enableUserAgent(setConnection, request);

  async function present() {
    const connection = await request.start();
    setConnection(connection);
  }

  function terminate() {
    console.debug("Terminating connection", connection());
    connection()?.terminate();
  }

  function close() {
    connection()?.close();
  }

  useCleanup(connection);

  function connectionActor() {
    const currentConnection = connection();
    if (!currentConnection) return;
    return {
      /**
       *
       * @param {string | Blob | ArrayBuffer | ArrayBufferView} data
       */
      send(data) {
        currentConnection.send(data);
      },
      close() {
        currentConnection.close();
      },
      terminate() {
        currentConnection.terminate();
      },
    };
  }

  createEffect(() => {
    const currentConnection = connection();
    if (!currentConnection) return;
    // Persist connection id when we have a new connection
    localStorage["presentation id"] = currentConnection.id;

    // Monitor the connection state
    currentConnection.addEventListener("connect", () => {
      console.log("Connected to presentation");
      setIsConnected(true);

      currentConnection.addEventListener("message", (message) => {
        console.log(
          "message from connection",
          /** @type {Event & {data: string}} */ (message).data
        );
      });
    });

    currentConnection.addEventListener("close", () => {
      setConnection(null);
      setIsConnected(false);
    });

    currentConnection.addEventListener("terminate", () => {
      // Remove persisted connection id if there is one
      delete localStorage["presentation id"];
      setConnection(null);
      setIsConnected(false);
    });
  });

  return {
    isAvailable,
    present,
    terminate,
    close,
    isConnected,
  };
}
/**
 * Tries to get list of active connections from the receiver
 * If there is a presentation then we are on the big presentation screen and get controlled from a controller in a
 * different context that sends messages to us
 * @returns {Promise<boolean>}
 */
async function enterPresentationState() {
  const connectionList = navigator.presentation?.receiver?.connectionList;
  // If the connection list does not exist, then we are not in the presentation user agent on the screen
  if (!connectionList) return false;

  const list = await connectionList;
  for (const connection of list.connections) {
    console.log("Connection", connection.id);
    connection.addEventListener("message", (message) => {
      console.log(
        "Message from sender",
        /** @type {Event & {data: string}} */ (message).data
      );
      connection.send(
        "Hello, I got your message!" +
          /** @type {Event & {data: string}} */ (message).data
      );
    });

    connection.send("Hello, I am connected to you!");
  }

  list.addEventListener(
    "connectionavailable",
    // /**
    //  *
    //  * @param {PresentationAvailableEvent} event
    //  */
    (event) => {
      const connection = /**@type {PresentationAvailableEvent} */ (event)
        .connection;

      console.log("New connection available", connection.id);

      connection.addEventListener("message", (message) => {
        connection.send(/** @type {Event & {data: string}} */ (message).data);
      });
    }
  );

  return true;
}
export function usePresentiationState() {
  // This code is intended to run when document is shown as presentation
  const [isPresenting] = createResource(enterPresentationState);

  return isPresenting;
}
