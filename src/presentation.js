import {
  createEffect,
  createResource,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";

const PRESENTATION_URLS = ["/"];
// @ts-ignore Can not find type definitions for this Browser API
const request = new PresentationRequest(PRESENTATION_URLS);
/**
 *
 * @param {(event: Event) => void} onAvailabilityChange
 */
async function getIsAvailable(onAvailabilityChange) {
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

  availability.addEventListener("change", onAvailabilityChange);
}

function useIsAvailable() {
  //TODO add third state of "is loading"
  // Can not use crateResource because we need to react to the availability change event
  const [isAvailable, setIsAvailable] = createSignal(false);

  onMount(async () => {
    getIsAvailable((event) => {
      // @ts-ignore
      setIsAvailable(event.target?.value);
    });
  });

  return isAvailable;
}

/**
 * Enable the user agent to initialize presentations
 * @param {import("solid-js").Setter<any>} setConnection
 */
function enableUserAgent(setConnection) {
  if (!("presentation" in navigator)) return;
  // @ts-ignore
  navigator.presentation.defaultRequest = request;
  // Event might not exist
  // @ts-ignore
  navigator.presentation.onconnectionavailable = (event) => {
    console.log("Connection available", event.connection.id);
    setConnection(event.connection);
  };
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
    oldConnection.onclose = undefined;
    oldConnection.close();

    // Use new connection as old connection next call
    return newConnection;
  }, getConnection());
}
export function usePresentationApi() {
  usePresentiationState();
  //TODO check if is supported by browser
  const isAvailable = useIsAvailable();
  // @ts-ignore
  const [connection, setConnection] = createSignal();

  const [isConnected, setIsConnected] = createSignal(false);

  // Presentation can be initialized by the user agent (the user's browser)
  onMount(() => {
    enableUserAgent(setConnection);
  });

  // Reconnect if there is an existing connection
  onMount(() => {
    const id = localStorage["presentation id"];
    if (!id) return;
    request.reconnect(id).then(setConnection);
  });

  async function present() {
    // @ts-ignore
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
    localStorage["presentation id"] = connection().id;

    // Monitor the connection state
    connection().addEventListener("connect", () => {
      console.log("Connected to presentation");
      setIsConnected(true);

      // @ts-ignore
      connection().addEventListener("message", (message) => {
        console.log("message from connection", message.data);
      });

      // Send initial message
      connection().send("Hello, presentation!");
    });

    connection().addEventListener("close", () => {
      setConnection(null);
      setIsConnected(false);
    });

    connection().addEventListener("terminate", () => {
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

// @ts-ignore
function usePresentiationState() {
  // This code is intended to run when document is shown as presentation
  onMount(async () => {
    // @ts-ignore
    const connectionList = navigator.presentation?.receiver?.connectionList;
    if (!connectionList) {
      console.debug("No connection list available");
      return;
    }

    const list = await connectionList;
    for (const connection of list.connections) {
      console.log("Connection", connection.id);
      // @ts-ignore
      connection.addEventListener("message", (message) => {
        console.log("Message from sender", message.data);
        connection.send("Hello, I got your message!", message.data);
      });

      connection.send("Hello, I am connected to you!");
    }

    // @ts-ignore
    list.addEventListener("connectionavailable", (event) => {
      console.log("New connection available", event.connection.id);
      // @ts-ignore
      event.connection.addEventListener("message", (message) => {
        console.log("Message from sender", message.data);
        event.connection.send("Hello, I got your message!", message.data);
      });

      event.connection.send("Hello, I am connected to you!");
    });
  });
}
