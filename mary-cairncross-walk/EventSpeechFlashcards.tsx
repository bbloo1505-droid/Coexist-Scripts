import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "./utils";

type SpeechCard = {
  /** Used for structure / ordering only; not shown during presentation to keep UI minimal */
  section: string;
  lines: string[];
  bullets?: string[];
};

const SPEECH_CARDS: SpeechCard[] = [
  {
    section: "Intro / acknowledgement",
    lines: ["Hey everyone, thanks for coming out today."],
  },
  {
    section: "Intro / acknowledgement",
    lines: [
      "Before we start, I'd like to acknowledge that we're gathering today on Jinibara Country here on the Blackall Range, and pay my respects to Elders past and present.",
    ],
  },
  {
    section: "Intro / acknowledgement",
    lines: [
      "This landscape has been cared for for thousands of years and has deep cultural significance, including connections to the bunya gatherings that once brought thousands of people together across this region.",
    ],
  },
  {
    section: "Mary Cairncross history",
    lines: [
      "Mary Cairncross isn't just a nice bit of forest â€” it's one of the last remaining patches of subtropical rainforest left on the Blackall Range.",
    ],
  },
  {
    section: "Mary Cairncross history",
    lines: [
      "Around 88% of this ecosystem has been cleared since European settlement, so this reserve is basically a living remnant of what much of southeast Queensland once looked like.",
    ],
  },
  {
    section: "Mary Cairncross history",
    lines: [
      "Early settlers on the range heavily logged these forests for valuable red cedar timber.",
    ],
  },
  {
    section: "Mary Cairncross history",
    lines: [
      "The reason this patch still exists today is largely because the Thynne family â€” pronounced \"thin\" â€” chose to protect the land rather than clear it.",
    ],
  },
  {
    section: "Mary Cairncross history",
    lines: [
      "In 1941, Elizabeth, Mabel and Mary Thynne donated 100 acres of rainforest to council to preserve it permanently.",
    ],
  },
  {
    section: "Mary Cairncross history",
    lines: [
      "They named the reserve in honour of their mother, Mary Thynne, whose maiden name was Cairncross â€” pronounced \"care-n-cross.\"",
    ],
  },
  {
    section: "Biodiversity stats",
    lines: ["Even though the reserve is only about 55 hectares, it's packed with life:"],
    bullets: [
      "391 plant species",
      "141 bird species",
      "68 species of mammals, reptiles and amphibians",
      "plus countless invertebrates and fungi.",
    ],
  },
  {
    section: "Species examples",
    lines: ["Keep an eye and ear out for things like:"],
    bullets: [
      "eastern whipbirds",
      "wompoo fruit-doves",
      "red-legged pademelons",
      "southern angle-headed dragons",
      "marbled frogmouths",
      "strangler figs",
      "giant buttress roots",
      "fungi and epiphytes.",
    ],
  },
  {
    section: "Species examples",
    lines: [
      "A lot of species found in these rainforests only occur between southeast Queensland and northern New South Wales, which makes this whole region incredibly biodiverse.",
    ],
  },
  {
    section: "SCEP project",
    lines: [
      "What's also really exciting is the Sunshine Coast Ecological Park project right next to the reserve.",
    ],
  },
  {
    section: "SCEP project",
    lines: [
      "The project is aiming to restore around 65 hectares of cleared pasture back into rainforest and wetlands over the coming decades.",
    ],
  },
  {
    section: "SCEP project",
    lines: [
      "I've actually been lucky enough to work on parts of that project with ArborCare, so it's really cool seeing restoration happen at that scale.",
    ],
  },
  {
    section: "SCEP project",
    lines: ["They've already planted thousands of seedlings there, including species like:"],
    bullets: ["Maroochy nut", "Richmond birdwing butterfly vine", "red cedar", "strangler figs."],
  },
  {
    section: "SCEP project",
    lines: [
      "One of the coolest parts is that the rainforest is already naturally expanding outward through birds and animals dispersing seeds from Mary Cairncross into the surrounding landscape.",
    ],
  },
  {
    section: "Respecting the reserve",
    lines: [
      "While we're walking today, make sure we stay on the tracks and move respectfully through the reserve.",
    ],
  },
  {
    section: "Respecting the reserve",
    lines: [
      "Rainforest systems like this can be sensitive to disturbance, especially because this is a small fragmented remnant. One person stepping off track doesn't seem like much, but repeated trampling compacts soil, damages roots and slowly widens informal tracks.",
    ],
  },
  {
    section: "Co-Exist section",
    lines: [
      "For those who are new, Co-Exist was started to create environmental events that felt more welcoming and community-driven for younger people â€” less intimidating, more connection and more getting outdoors together.",
    ],
  },
  {
    section: "Co-Exist section",
    lines: [
      "We've also got the new Co-Exist app launching soon, which will make it easier to find events, track volunteer hours and stay connected with the community.",
    ],
  },
  {
    section: "Co-Exist section",
    lines: ["And our next event this month is [insert event]."],
  },
  {
    section: "Closing",
    lines: [
      "But yeah â€” take your time today, keep your eyes up in the canopy, ears open for whipbirds, and enjoy the forest.",
    ],
  },
];

type SpeakerMode = "normal" | "speaker";

function useWakeLock(active: boolean) {
  const lockRef = useRef<{ release: () => Promise<void> } | null>(null);

  useEffect(() => {
    if (!active || typeof navigator === "undefined" || !("wakeLock" in navigator)) return;

    let cancelled = false;

    const request = async () => {
      try {
        const sentinel = await navigator.wakeLock.request("screen");
        if (cancelled) {
          await sentinel.release();
          return;
        }
        lockRef.current = sentinel;
        sentinel.addEventListener("release", () => {
          lockRef.current = null;
        });
      } catch {
        /* user gesture / unsupported â€” ignore */
      }
    };

    void request();

    const onVisible = () => {
      if (document.visibilityState === "visible" && active && !lockRef.current) void request();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      void lockRef.current?.release();
      lockRef.current = null;
    };
  }, [active]);
}

function usePresentationViewportLock(enabled: boolean) {
  useLayoutEffect(() => {
    if (!enabled) return;
    const meta = document.querySelector('meta[name="viewport"]');
    if (!meta) return;
    const previous = meta.getAttribute("content") ?? "";
    meta.setAttribute(
      "content",
      "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
    );
    const theme = document.querySelector('meta[name="theme-color"]');
    const prevTheme = theme?.getAttribute("content") ?? null;
    theme?.setAttribute("content", "#0c0f0d");

    return () => {
      meta.setAttribute("content", previous || "width=device-width, initial-scale=1.0, viewport-fit=cover");
      if (theme && prevTheme !== null) theme.setAttribute("content", prevTheme);
      else if (theme) theme.setAttribute("content", "#FAF7F2");
    };
  }, [enabled]);
}

const SWIPE_PX = 48;

export default function EventSpeechFlashcards() {
  const [started, setStarted] = useState(false);
  const [speakerMode, setSpeakerMode] = useState<SpeakerMode>("normal");
  const [index, setIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const reduceMotion =
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  usePresentationViewportLock(started);
  useWakeLock(started);

  const total = SPEECH_CARDS.length;
  const atStart = index <= 0;
  const atEnd = index >= total - 1;

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(total - 1, next));
      if (clamped === index) return;
      if (reduceMotion) {
        setIndex(clamped);
        setDisplayIndex(clamped);
        return;
      }
      setFadeIn(false);
      window.setTimeout(() => {
        setIndex(clamped);
        setDisplayIndex(clamped);
        setFadeIn(true);
      }, 120);
    },
    [index, reduceMotion, total],
  );

  const next = useCallback(() => {
    if (atEnd) return;
    goTo(index + 1);
  }, [atEnd, goTo, index]);

  const prev = useCallback(() => {
    if (atStart) return;
    goTo(index - 1);
  }, [atStart, goTo, index]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start == null) return;
    const end = e.changedTouches[0]?.clientX ?? start;
    const dx = end - start;
    if (dx < -SWIPE_PX) next();
    else if (dx > SWIPE_PX) prev();
  };

  const card = SPEECH_CARDS[displayIndex]!;

  if (!started) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col bg-[#0c0f0d] text-[#f2efe6] antialiased"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          touchAction: "manipulation",
        }}
      >
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-10">
          <p className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-[#9aa69a]">Walk notes</p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-[#f2efe6] sm:text-4xl">
            Mary Cairncross
          </h1>
          <p className="mt-3 max-w-md font-sans text-base leading-relaxed text-[#c8cfc4]">
            Full-screen cue cards for speaking outdoors. Large type, high contrast, tap or swipe to move.
          </p>

          <div className="mt-10">
            <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-[#7a8578]">Text size</p>
            <div
              className="mt-3 grid grid-cols-2 gap-2 rounded-2xl border border-[#1e2620] bg-[#111613] p-1"
              role="group"
              aria-label="Text size mode"
            >
              <button
                type="button"
                onClick={() => setSpeakerMode("normal")}
                className={cn(
                  "rounded-xl px-3 py-3 font-sans text-sm font-medium transition-colors",
                  speakerMode === "normal"
                    ? "bg-[#1a221c] text-[#f2efe6]"
                    : "text-[#9aa69a] hover:text-[#c8cfc4]",
                )}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setSpeakerMode("speaker")}
                className={cn(
                  "rounded-xl px-3 py-3 font-sans text-sm font-medium transition-colors",
                  speakerMode === "speaker"
                    ? "bg-[#1a221c] text-[#f2efe6]"
                    : "text-[#9aa69a] hover:text-[#c8cfc4]",
                )}
              >
                Speaker
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIndex(0);
              setDisplayIndex(0);
              setFadeIn(true);
              setStarted(true);
            }}
            className="tap-target mt-10 w-full rounded-2xl bg-[#f2efe6] px-5 py-4 font-sans text-base font-semibold text-[#0c0f0d] active:scale-[0.99] motion-reduce:transition-none"
          >
            Start presentation
          </button>

          <a href="/" className="mt-6 text-center font-sans text-sm text-[#7a8578] underline-offset-4 hover:text-[#c8cfc4] hover:underline"
          >
            Back to app
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex select-none flex-col bg-[#0c0f0d] text-[#f2efe6] antialiased"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        userSelect: "none",
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <header className="relative z-20 flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-1">
        <button
          type="button"
          onClick={() => setStarted(false)}
          className="tap-target inline-flex min-w-[3rem] items-center justify-center rounded-xl font-sans text-sm font-medium text-[#9aa69a] hover:bg-[#141a16] hover:text-[#f2efe6]"
          aria-label="Exit presentation"
        >
          Exit
        </button>
        <p className="font-sans text-sm font-medium tabular-nums text-[#c8cfc4]">
          {index + 1} / {total}
        </p>
        <button
          type="button"
          onClick={() => setSpeakerMode((m) => (m === "normal" ? "speaker" : "normal"))}
          className="tap-target inline-flex min-w-[3rem] items-center justify-center rounded-xl font-sans text-sm font-medium text-[#9aa69a] hover:bg-[#141a16] hover:text-[#f2efe6]"
          aria-label={speakerMode === "speaker" ? "Switch to normal text size" : "Switch to speaker text size"}
        >
          {speakerMode === "speaker" ? "Aa+" : "Aa"}
        </button>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col px-4 pb-4">
        <div
          className={cn(
            "relative mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col",
            !reduceMotion && "transition-opacity duration-150 ease-out",
            fadeIn ? "opacity-100" : "opacity-0",
          )}
        >
          <article
            className={cn(
              "flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.35rem] border border-[#1e2620] bg-[#121814] px-5 py-6 shadow-none sm:px-7 sm:py-8",
            )}
          >
            <div
              className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <div
                className={cn(
                  "font-sans text-[#f2efe6]",
                  speakerMode === "speaker"
                    ? "text-[1.35rem] leading-[1.55] sm:text-[1.55rem] sm:leading-[1.6]"
                    : "text-[1.05rem] leading-[1.55] sm:text-[1.2rem] sm:leading-[1.6]",
                )}
              >
                {card.lines.map((line, i) => (
                  <p key={i} className={i > 0 ? "mt-4" : undefined}>
                    {line}
                  </p>
                ))}
                {card.bullets && card.bullets.length > 0 && (
                  <ul className="mt-5 list-disc space-y-2.5 pl-5 marker:text-[#7a8578]">
                    {card.bullets.map((b, i) => (
                      <li key={i} className="pl-1">
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </article>

          <div className="pointer-events-none absolute inset-0 z-10" aria-hidden>
            <button
              type="button"
              tabIndex={-1}
              onClick={prev}
              className="pointer-events-auto absolute inset-y-0 left-0 w-[28%] border-0 bg-transparent p-0 opacity-0"
              aria-label="Previous card"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={next}
              className="pointer-events-auto absolute inset-y-0 right-0 w-[28%] border-0 bg-transparent p-0 opacity-0"
              aria-label="Next card"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

