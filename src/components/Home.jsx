import { createEffect } from "solid-js";
import Controls from "./Controls";
import Presentation from "./Presentation";
import { useGlobalPageContext } from "./PresentationContext";
import { useNavigate, useParams } from "@solidjs/router";

/**
 * The default landing page for when opening the presentation app
 * Should show the presentation and controls
 * @returns {import("solid-js").JSX.Element}
 */
export default function () {
  const [page, setPage] = useGlobalPageContext();
  const navigate = useNavigate();
  // Quick and dirty way to prevent infinite loop
  let isAppUpdate = false;

  const parameters = useParams();
  createEffect(() => {
    // Read the page from the URL
    if (parameters.page === undefined) return;

    const number = parseInt(parameters.page);
    if (isNaN(number)) return;

    // Only update if page number is set from outside the app through the user e.g. navigating back or setting url manually
    if (isAppUpdate) {
      isAppUpdate = false;
      return;
    }
    console.debug("Page from URL", number);
    setPage(number);
  });

  // The problem is:
  // if the page renders it sets the page from the URL
  // which causes the page signal to trigger which again updates the URL
  // causing an infinite loop

  console.debug("Full render");
  createEffect(() => {
    isAppUpdate = true;
    navigate(`/${page()}`);
  });
  return (
    <>
      <Presentation />
      <Controls currentPath="/" />
    </>
  );
}
