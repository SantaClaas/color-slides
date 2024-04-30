import { Show, createEffect, createSignal } from "solid-js";
import { useFullscreeen } from "./fullscreen";
import { usePresentationApi } from "./presentation";
import {
  CancelPresentationIcon,
  FullscreenExitIcon,
  FullscreenIcon,
  PresentToAllIcon,
} from "./icons";

function Controls() {
  const { isFullscreen, toggleFullscreen } = useFullscreeen();
  const { present, isConnected, isAvailable, close, terminate } =
    usePresentationApi();

  return (
    <aside class="absolute right-0 bottom-0 flex gap-4 p-4">
      {document.fullscreenEnabled && (
        <button
          id="fullscreen"
          class="text-white outline-white outline-1 outline-double rounded-full p-3 place-items-center grid"
          onClick={toggleFullscreen}
        >
          <Show when={isFullscreen()} fallback={<FullscreenIcon />}>
            <FullscreenExitIcon />
          </Show>
          <span class="sr-only">Fullscreen</span>
        </button>
      )}
      <Show when={isAvailable()}>
        <Show
          when={isConnected()}
          fallback={
            <button
              class="text-white outline-white outline-1 outline-double rounded-full p-3 place-items-center grid"
              onClick={present}
            >
              <PresentToAllIcon />
              <span class="sr-only">Present to all</span>
            </button>
          }
        >
          <button
            class="text-white outline-white outline-1 outline-double rounded-full p-3 place-items-center grid"
            onClick={terminate}
          >
            <CancelPresentationIcon />
          </button>
        </Show>
      </Show>
    </aside>
  );
}

function App() {
  return (
    <>
      <main class="dark:bg-black h-screen grid place-items-center">
        <h1 class="font-serif text-9xl dark:text-white font-extrabold uppercase tracking-widest">
          <span class="text-black bg-white">C</span>o
          <span class="text-black bg-white">l</span>o
          <span class="text-black bg-white">r</span>
        </h1>
      </main>
      <Controls />
    </>
  );
}

export default App;
