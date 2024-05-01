import { Show, createEffect, createSignal } from "solid-js";
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
import { SLIDE_COUNT } from "./Slides";

export default function () {
  const { isFullscreen, toggleFullscreen } = useFullscreeen();
  const { present, isConnected, isAvailable, close, terminate } =
    usePresentationApi();

  createEffect(() => {
    // Debug effect
    console.debug("Debug", isConnected(), isAvailable());
  });
  const navigate = useNavigate();

  const parameters = useParams();

  const page = () => Number(parameters.page) || 0;
  const next = () => (page() + 1 >= SLIDE_COUNT ? 0 : page() + 1);
  const previous = () => (page() - 1 < 0 ? SLIDE_COUNT - 1 : page() - 1);

  console.log("Page", typeof page);
  return (
    <aside class="absolute right-0 bottom-0 flex gap-4 p-4">
      <a
        href={`/slides/${previous()}`}
        class="text-white border-white border rounded-full p-3 place-items-center grid"
      >
        <NavigateBeforeIcon />
      </a>
      <a
        href={`/slides/${next()}`}
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
      <IconButton>
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
