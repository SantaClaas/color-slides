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
import { useNavigate, useParams } from "@solidjs/router";

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

  const page = parameters.page || 0;

  return (
    <aside class="absolute right-0 bottom-0 flex gap-4 p-4">
      {/* TODO replace with A element */}
      <IconButton onClick={() => page > 0 && navigate(`/slides/${page - 1}`)}>
        <NavigateBeforeIcon />
      </IconButton>
      <IconButton onClick={() => navigate(`/slides/${page + 1}`)}>
        <NavigateNextIcon />
      </IconButton>
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
