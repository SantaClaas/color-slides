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
import { useNavigate, useParams, A } from "@solidjs/router";
import { SLIDE_COUNT } from "./Presentation";
import { selectScreen } from "./screen";

export const channel = new BroadcastChannel("presentation-api");

function usePageNavigation() {
  const parameters = useParams();

  const page = () => Number(parameters.page) || 0;
  const next = () => (page() + 1 >= SLIDE_COUNT ? 0 : page() + 1);
  const previous = () => (page() - 1 < 0 ? SLIDE_COUNT - 1 : page() - 1);
  const nextPath = () => `/presentation/${next()}`;
  const previousPath = () => `/presentation/${previous()}`;

  return { nextPath, previousPath };
}

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

export default function () {
  const { isFullscreen, toggleFullscreen } = useFullscreeen();
  const { present, isConnected, isAvailable, close, terminate } =
    usePresentationApi();
  const { nextPath, previousPath } = usePageNavigation();

  const isWindowManagementSupported = "getScreenDetails" in window;

  onMount(() => {
    channel.addEventListener("message", (event) => {
      console.log("Controls received message", event.data);

      if (event.data.type === "ready") {
        channel.postMessage({ type: "go fullscreen" });
      }
    });
  });
  const navigate = useNavigate();
  async function presentToAll() {
    //TODO permissions dialog requesting and explaining why we need access to the window managment API permissions
    //TODO think of manual solution with creating two windows and the user having to manually move them to a different screen
    if (!isWindowManagementSupported) return;
    const screens = await window.getScreenDetails();
    const presentationScreen = selectScreen(screens);

    // The order of requesting fullscreen and then opening the window is important
    // The other way around does not work
    // Then fullscreen the current screen with the presentation to the screen
    await presentation.requestFullscreen({
      screen: presentationScreen,
    });

    // Open control in new window on current screen
    const newWindow = openWindow(
      screens.currentScreen.left,
      screens.currentScreen.top,
      screens.currentScreen.width,
      screens.currentScreen.height,
      "/notes"
    );
  }

  return (
    <aside id="controls" class="absolute right-0 bottom-0 flex gap-4 p-4">
      <a
        href={previousPath()}
        class="text-white border-white border rounded-full p-3 place-items-center grid"
      >
        <NavigateBeforeIcon />
      </a>
      <a
        href={nextPath()}
        class="text-white border-white border rounded-full p-3 place-items-center grid"
      >
        <NavigateNextIcon />
      </a>
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
