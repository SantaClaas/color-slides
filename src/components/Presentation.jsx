import { useParams } from "@solidjs/router";
import { Show, createEffect } from "solid-js";
import { Dynamic } from "solid-js/web";
import { useGlobalPageContext } from "./PresentationContext";

function Slide0() {
  return (
    <main class="dark:bg-black h-screen grid place-items-center">
      <h1 class="font-serif text-9xl dark:text-white font-extrabold uppercase tracking-widest">
        <span class="text-black bg-white">C</span>o
        <span class="text-black bg-white">l</span>o
        <span class="text-black bg-white">r</span>
      </h1>
    </main>
  );
}

function Slide1() {
  return (
    <main class="dark:bg-black h-screen grid place-items-center">
      <h1 class="font-serif text-9xl dark:text-white font-extrabold uppercase tracking-widest">
        <span class="text-black bg-white">C</span>o
        <span class="text-black bg-white">l</span>o
        <span class="text-black bg-white">u</span>r
        <span class="text-black bg-white">?</span>
      </h1>
    </main>
  );
}

export const SLIDES = [Slide0, Slide1];

export default function () {
  const [globalPage, setPage] = useGlobalPageContext();
  const page = () => globalPage() ?? 0;
  return (
    <>
      {/* Temporary div to have element containing slides */}
      <div id="presentation">
        <Show when={page() < SLIDES.length} fallback={<Slide0 />}>
          <Dynamic component={SLIDES[page()]} />
        </Show>
      </div>
    </>
  );
}

export const SLIDE_COUNT = SLIDES.length;
