import { createSignal } from "solid-js";

export function useFullscreeen() {
  const [isFullscreen, setIsFullscreen] = createSignal(
    document.fullscreenElement !== null
  );

  async function toggleFullscreen() {
    if (!document.fullscreenEnabled) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      setIsFullscreen(false);
      return;
    }

    await document.documentElement.requestFullscreen({
      //TODO enable setting other screen as seen on MDN
    });
    setIsFullscreen(true);
  }

  return { isFullscreen, toggleFullscreen };
}
