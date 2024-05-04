import Controls from "./Controls";
import Presentation from "./Presentation";

/**
 * The default landing page for when opening the presentation app
 * Should show the presentation and controls
 * @returns {import("solid-js").JSX.Element}
 */
export default function () {
  return (
    <>
      <Presentation />
      <Controls currentPath="/" />
    </>
  );
}
