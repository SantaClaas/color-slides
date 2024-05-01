import { useParams } from "@solidjs/router";
import { Show } from "solid-js";
import Controls from "./Controls";

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

  return (
    <>
      <Show
        when={parameters.page && parameters.page < SLIDES.length}
        fallback={Slide0}
      >
        {SLIDES[parameters.page]}
      </Show>
      <Controls />
    </>
  );
}

export const SLIDE_COUNT = SLIDES.length;
