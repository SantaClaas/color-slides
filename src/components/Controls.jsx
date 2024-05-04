import { Show, createEffect, createSignal, onMount } from "solid-js";
import { useFullscreeen } from "../fullscreen";
import { usePresentationApi, usePresentiationState } from "../presentation";
import {
  CancelPresentationIcon,
  CastIcon,
  CastIconFill,
  FullscreenExitIcon,
  FullscreenIcon,
  NavigateBeforeIcon,
  NavigateNextIcon,
  PresentToAllIcon,
} from "../icons";
import IconButton from "./IconButton";
import { selectScreens } from "./screen";
import { useGlobalPageContext, usePage } from "./PresentationContext";
import { A, useLocation, useNavigate, useParams } from "@solidjs/router";
import { SLIDE_COUNT } from "./Presentation";

/**
 * @param {number} left
 * @param {number} top
 * @param {number} width
 * @param {number} height
 * @param {string | URL | undefined} url
 */
function openWindow(left, top, width, height, url) {
  const features = `left=${left},top=${top},width=${width},height=${height}`;

  const newWindow = window.open(url, "_blank", features);
  //TODO error handling like browser blocking new windows (Can we ask for explicit permission?)
  // See https://developer.mozilla.org/en-US/docs/Web/API/Window_Management_API/Using#opening_windows
  return newWindow;
}

function PageControls() {
  const page = usePage();

  const paths = () => ({
    next: SLIDE_COUNT > page() + 1 ? `/${page() + 1}` : "",
    previous: page() - 1 >= 0 ? `/${page() - 1}` : "",
  });

  createEffect(() => console.debug("paths changed", paths()));
  return (
    <>
      <A
        href={paths().previous}
        class="text-white border-white border rounded-full p-3 place-items-center grid"
      >
        <NavigateBeforeIcon />
      </A>
      <A
        href={paths().next}
        class="text-white border-white border rounded-full p-3 place-items-center grid"
      >
        <NavigateNextIcon />
      </A>
    </>
  );
}
export default function () {
  const { isFullscreen, toggleFullscreen } = useFullscreeen();
  const { present, isConnected, isAvailable, close, terminate } =
    usePresentationApi();

  const isWindowManagementSupported = "getScreenDetails" in window;

  async function presentToAll() {
    //TODO permissions dialog requesting and explaining why we need access to the window managment API permissions
    //TODO think of manual solution with creating two windows and the user having to manually move them to a different screen
    if (!isWindowManagementSupported) return;
    const screens = await window.getScreenDetails();
    const [presentationScreen, notesScreen] = selectScreens(screens);

    // The order of requesting fullscreen and then opening the window is important
    // The other way around does not work
    // Then fullscreen the current screen with the presentation to the screen
    await document.documentElement.requestFullscreen({
      screen: presentationScreen,
    });

    // Can't show notes if there is no screen for them
    if (!notesScreen) return;

    // Open control in new window on current screen
    const notesWindow = openWindow(
      notesScreen.left,
      notesScreen.top,
      notesScreen.width,
      notesScreen.height,
      "/notes"
    );
  }

  return (
    <aside
      id="controls"
      class="in-fullscreen:hidden absolute right-0 bottom-0 flex gap-4 p-4"
    >
      <PageControls />
      {document.fullscreenEnabled && (
        <IconButton onClick={toggleFullscreen}>
          <Show when={isFullscreen()} fallback={<FullscreenIcon />}>
            <FullscreenExitIcon />
          </Show>
          <span class="sr-only">Fullscreen</span>
        </IconButton>
      )}
      <IconButton onClick={presentToAll}>
        <PresentToAllIcon />
      </IconButton>
      <Show when={isAvailable()}>
        <Show
          when={isConnected()}
          fallback={
            <IconButton onClick={present}>
              <CastIcon />
              <span class="sr-only">Present to all</span>
            </IconButton>
          }
        >
          <IconButton
            onClick={terminate}
            color="text-fuchsia-300 border-2 border-fuchsia-300"
          >
            <CastIconFill />
          </IconButton>
        </Show>
      </Show>
    </aside>
  );
}
