import { useParams } from "@solidjs/router";
import {
  createContext,
  createEffect,
  createSignal,
  onMount,
  useContext,
} from "solid-js";
import { SLIDE_COUNT } from "./Presentation";

const channel = new BroadcastChannel("");
const id = crypto.randomUUID();

/**
 *
 * @param {number} page
 */
function updateGlobalPage(page) {
  // Persist page
  localStorage.setItem("page", page.toString());
  channel.postMessage({ type: "set page", page, id });
}
/**
 * @returns {[import("solid-js").Accessor<number | null>, (page: number) => void]}
 */
function createContextValue() {
  // Can not access solid-js router as this happens before router is set up and outside of it's context
  // Get page number from url if there is one

  // Try retrieve last page number from local storage
  const storedPage = localStorage.getItem("page");
  // If string is null or empty then we have no page number
  const pageNumber = storedPage ? Number(storedPage) : null;

  // Don't try to extract page number from url for now. It's too hard and I don't feel like it
  // Setting the number to the same number should not cause any effect as signals handle it internally
  const [page, setPage] = createSignal(pageNumber);

  console.debug("id", id);

  /**
   *
   * @param {MessageEvent} event
   */
  function handleMessage(event) {
    console.debug("message received", event.data);
    if (event.data.type === "set page") setPage(event.data.page);
  }
  onMount(() => {
    channel.addEventListener("message", handleMessage);
    return () => channel.removeEventListener("message", handleMessage);
  });

  /**
   *
   * @param {number} page
   */
  function set(page) {
    if (page < 0 || page >= SLIDE_COUNT) return;
    // Calling broadcast as effect would cause infinite loop
    setPage((previous) => {
      if (previous !== page) {
        updateGlobalPage(page);
      }

      return page;
    });
  }

  return [page, set];
}

const GlobalPageContext = createContext(createContextValue());

export function useGlobalPageContext() {
  const context = useContext(GlobalPageContext);

  return context;
}

/**
 *
 * @param {import("@solidjs/router").RouteSectionProps} properties
 * @returns
 */
export function PresentationProvider({ children, location, params, data }) {
  // Not sure why it requires a value if there is a default value
  const value = GlobalPageContext.defaultValue;
  return (
    <GlobalPageContext.Provider value={value}>
      {children}
    </GlobalPageContext.Provider>
  );
}
