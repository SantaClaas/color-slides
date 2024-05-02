import { useParams } from "@solidjs/router";
import { Show, onMount } from "solid-js";
import Controls, { channel } from "./Controls";
import { Dynamic } from "solid-js/web";

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

const SLIDES = [Slide0, Slide1];

export default function () {
  const parameters = useParams();
  const page = () => Number(parameters.page) || 0;

  return (
    <>
      {/* Temporary div to have element containing slides */}
      <div id="presentation">
        <Show
          when={parameters.page && page() < SLIDES.length}
          fallback={<Slide0 />}
        >
          <Dynamic component={SLIDES[page()]} />
        </Show>
      </div>
    </>
  );
}

export const SLIDE_COUNT = SLIDES.length;
