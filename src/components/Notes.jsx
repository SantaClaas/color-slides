import { Dynamic, Show } from "solid-js/web";
import { SLIDES, SLIDE_COUNT } from "./Presentation";
import { useGlobalPageContext } from "./PresentationContext";
import Controls from "./Controls";

export default function Control() {
  const [globalPage, setPage] = useGlobalPageContext();
  const page = () => globalPage() ?? 0;
  return (
    <main>
      <p class="text-white">
        {page() + 1}/{SLIDE_COUNT}
      </p>
      {/* Show presentation page and next page */}
      <article class="aspect-video w-50">
        <Dynamic component={SLIDES[page()]} />
      </article>
      <article>
        <Show
          when={page() < SLIDE_COUNT - 1}
          fallback={<p>End of presentation</p>}
        >
          <Dynamic component={SLIDES[page() + 1]} />
        </Show>
      </article>
      <Controls currentPath="/notes" />
    </main>
  );
}
