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

/**
 * @returns {import("solid-js").Signal<number | null>}
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
  createEffect(() => {
    const currentPage = page();
    if (currentPage === null) return;

    // Persist page
    localStorage.setItem("page", currentPage.toString());
    channel.postMessage({ type: "set page", page: currentPage });
  });
  onMount(() => {
    channel.addEventListener("message", (event) => {
      if (event.data.type === "set page") setPage(event.data.page);
    });
  });

  return [page, setPage];
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

function urlPageNumber() {
  const parameters = useParams();

  // Don't use `"page" in parameters` as it does not trigger the accessor and thus not the signal/reactive system
  if (parameters.page === undefined || parameters.page.length === 0)
    return null;

  const page = Number(parameters.page);
  if (Number.isNaN(page)) return null;

  return page;
}

/**
 * Can only be used inside a route
 */
export function usePage() {
  // Manage state from url and global state
  const [page, setPage] = useGlobalPageContext();

  // Url page number always takes precedence as it is set by user interaction

  // Update global page number if user set the state through the url
  createEffect(() => {
    const urlPage = urlPageNumber();
    if (urlPage === null) return;

    setPage(urlPageNumber());
  });

  const pageNumber = () => {
    const urlPage = urlPageNumber();
    const globalPage = page();

    if (urlPage !== null) {
      // Fix global state
      if (urlPage !== globalPage) setPage(urlPage);

      return urlPage;
    }

    return globalPage ?? 0;
  };

  return pageNumber;
}
