"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

type CommandLine = {
  id: number;
  kind: "input" | "output" | "system" | "error";
  text: string;
};

const BOOT_LINES = [
  "initializing modules...",
  "loading memory...",
  "mounting drives...",
  "verifying i/o...",
  "binding shell...",
] as const;

const PROMPT_LINE = "boot> open portfolio --mode=ascii";
const SPINNER = ["|", "/", "-", "\\"];

const PROJECTS = [
  {
    title: "AIML based Mental Health Personalizer",
    stack: "Python / Flask / Nextjs",
    points: [
      "Worked on creating a website for personalizing resources based on a quiz which was powered by AIML for privacy first and offline results.",
      "The whole backend and API was written in Python with a dashboard for the whole project by integrating Streamlit.",
    ],
    githubUrl:
      "https://www.linkedin.com/posts/yashpandey0031_hackathon-coding-finalists-activity-7310696354056450049-XdoK?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEZM14kBihFQTxo6XhBJlaNqWrDUa0esv58",
    imageSrc: "/mentalhealth.gif",
  },
  {
    title: "Live Digit Recognition System",
    stack: "Python / TensorFlow / OpenCV",
    points: [
      "Built a real-time digit recognition system using the MNIST dataset, integrating deep-learning inference with live camera input for on-screen handwritten digit prediction.",
      "Performed preprocessing, normalization, and augmentation, and implemented a neural network model for robust digit classification with smooth OpenCV-based visualization.",
    ],
    githubUrl: "https://github.com/yashpandey0031/digit-recognizer/tree/main",
    imageSrc: "/neuralnetwork.gif",
  },
  {
    title: "Image To Sound Convertor",
    stack: "Python / Streamlit / wave",
    points: [
      "Built a system that converts images into sound by mathematically mapping pixel intensity and position to audio frequency values.",
      "Processed image data at the pixel level and generated corresponding waveform outputs, delivering an interactive conversion tool through Streamlit.",
    ],
    githubUrl:
      "https://github.com/yashpandey0031/image-to-music-convertor-using-python/tree/master",
    imageSrc: "/soundwave.gif",
  },
  {
    title: "Deep learning based GNSS clock bias prediction",
    stack: "Python / HTML / JS / CSS",
    points: [
      "Built the complete deep-learning pipeline for GNSS clock-bias prediction, including dataset preparation and the GRU-based model workflow.",
      "The working prototype was developed using HTML, CSS, and JavaScript for high customization.",
    ],
    githubUrl: "https://github.com/yashpandey0031/GNSS-CLK",
    imageSrc: "/satellite.gif",
  },
] as const;

const ACHIEVEMENTS = [
  {
    title: "Achievement 01",
    detail: "Winner of HackX Hackathon organized by Chandigarh University.",
  },
  {
    title: "Achievement 02",
    detail:
      "Published patent for an integrated advertisement blocking eye wearable device.",
  },
  {
    title: "Achievement 03",
    detail:
      "Contributed to open-source projects at Gethackly and WOC (Winter of Code Social).",
  },
  {
    title: "Achievement 04",
    detail: "Secured 4th position at IDEASTORM 2025.",
  },
  {
    title: "Achievement 05",
    detail: "Qualified for SIH Level 2 at ANVESHAN 2025.",
  },
  {
    title: "Achievement 06",
    detail:
      "Finalist at Hansraj College's Innovate Hackathon, Delhi, where I built a personalized mental health platform.",
  },
  {
    title: "Achievement 07",
    detail: "Secured 3rd position at CodeBidz by Shyam Lal College.",
  },
] as const;

const ACHIEVEMENT_LINES = [
  "fetching achievements...",
  "parsing milestones...",
  "loading recognitions...",
  "calibrating metrics...",
] as const;

const COMMAND_HINTS = [
  "/contact us",
  "/projects",
  "/achievements",
  "/about us",
  "/time",
] as const;

function randomizeCharacters(source: string) {
  const ascii = "#@%&*+=?-_01[]{}<>/\\";

  return source
    .split("")
    .map((char) => {
      if (char === " " || Math.random() > 0.35) {
        return char;
      }

      return ascii[Math.floor(Math.random() * ascii.length)] ?? char;
    })
    .join("");
}

function DistortText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [rendered, setRendered] = useState(text);
  const glitchTimerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (glitchTimerRef.current !== null) {
      window.clearInterval(glitchTimerRef.current);
      glitchTimerRef.current = null;
    }
  };

  useEffect(() => {
    setRendered(text);
  }, [text]);

  useEffect(() => clearTimer, []);

  const startDistortion = () => {
    clearTimer();
    let cycles = 0;

    glitchTimerRef.current = window.setInterval(() => {
      cycles += 1;
      setRendered(randomizeCharacters(text));
      if (cycles > 6) {
        clearTimer();
        setRendered(text);
      }
    }, 45);
  };

  return (
    <span
      className={className}
      onMouseEnter={startDistortion}
      onMouseLeave={() => setRendered(text)}
    >
      {rendered}
    </span>
  );
}

export function TerminalLanding() {
  const [progress, setProgress] = useState(0);
  const [bootLinesShown, setBootLinesShown] = useState<string[]>([]);
  const [bootDone, setBootDone] = useState(false);
  const [showMainSection, setShowMainSection] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [typedChars, setTypedChars] = useState(0);
  const [spinnerIndex, setSpinnerIndex] = useState(0);
  const [liveTime, setLiveTime] = useState("");
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [hoveringInteractive, setHoveringInteractive] = useState(false);
  const [cursorReady, setCursorReady] = useState(false);
  const terminalPanelRef = useRef<HTMLElement | null>(null);
  const [achievementLinesShown, setAchievementLinesShown] = useState<string[]>(
    [],
  );
  const [achievementRevealCount, setAchievementRevealCount] = useState(0);
  const [achievementSequenceStarted, setAchievementSequenceStarted] =
    useState(false);
  const [hoveredProject, setHoveredProject] = useState<
    (typeof PROJECTS)[number] | null
  >(null);
  const [isFloatingTerminalOpen, setIsFloatingTerminalOpen] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [commandInput, setCommandInput] = useState("");
  const [commandLines, setCommandLines] = useState<CommandLine[]>([
    { id: 1, kind: "system", text: "type /help for more info" },
  ]);
  const glitchOverlayRef = useRef<HTMLDivElement | null>(null);
  const commandLineIdRef = useRef(1);
  const commandOutputEndRef = useRef<HTMLDivElement | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const mainSectionRef = useRef<HTMLElement | null>(null);
  const heroModuleRef = useRef<HTMLDivElement | null>(null);
  const aboutSectionRef = useRef<HTMLElement | null>(null);
  const hoveredTextRef = useRef<HTMLElement | null>(null);
  const hoverGlitchTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const lineTimers = BOOT_LINES.map((line, index) =>
      window.setTimeout(
        () => {
          setBootLinesShown((previous) => [...previous, line]);
        },
        450 + index * 520,
      ),
    );

    const progressHolder = { value: 0 };
    const progressTween = gsap.to(progressHolder, {
      value: 100,
      duration: 3.8,
      ease: "none",
      onUpdate: () => {
        setProgress(Math.round(progressHolder.value));
      },
    });

    const readyTimer = window.setTimeout(() => {
      setBootLinesShown((previous) => [...previous, "system ready."]);
    }, 3200);

    const transitionTimer = window.setTimeout(() => {
      setBootDone(true);
    }, 4300);

    return () => {
      lineTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(readyTimer);
      window.clearTimeout(transitionTimer);
      progressTween.kill();
    };
  }, []);

  useEffect(() => {
    if (!bootDone) {
      return;
    }

    const typer = window.setInterval(() => {
      setTypedChars((count) => {
        if (count >= PROMPT_LINE.length) {
          window.clearInterval(typer);
          return count;
        }

        return count + 1;
      });
    }, 34);

    return () => window.clearInterval(typer);
  }, [bootDone]);

  useEffect(() => {
    const spinner = window.setInterval(() => {
      setSpinnerIndex((index) => (index + 1) % SPINNER.length);
    }, 120);

    return () => window.clearInterval(spinner);
  }, []);

  useEffect(() => {
    const formatTime = () => {
      const stamp = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata",
        timeZoneName: "short",
      }).format(new Date());

      setLiveTime(`NEW DELHI, IN - ${stamp}`);
    };

    formatTime();
    const clock = window.setInterval(formatTime, 1000);
    return () => window.clearInterval(clock);
  }, []);

  useEffect(() => {
    const clearHoverTimer = () => {
      if (hoverGlitchTimerRef.current !== null) {
        window.clearTimeout(hoverGlitchTimerRef.current);
        hoverGlitchTimerRef.current = null;
      }
    };

    const triggerHoverGlitch = (node: HTMLElement) => {
      node.classList.remove("terminal-hover-flicker");
      void node.offsetWidth;
      node.classList.add("terminal-hover-flicker");
    };

    const scheduleHoverGlitch = (node: HTMLElement) => {
      clearHoverTimer();
      const jitterDelay = 260 + Math.random() * 1350;

      hoverGlitchTimerRef.current = window.setTimeout(() => {
        if (hoveredTextRef.current !== node) {
          return;
        }

        triggerHoverGlitch(node);
        scheduleHoverGlitch(node);
      }, jitterDelay);
    };

    const moveCursor = (event: MouseEvent) => {
      setCursorPos({ x: event.clientX, y: event.clientY });
      setCursorReady(true);

      const target = document.elementFromPoint(
        event.clientX,
        event.clientY,
      ) as HTMLElement | null;
      const isHoverTarget = Boolean(
        target?.closest("a, button, [data-cursor='interactive']"),
      );
      setHoveringInteractive(isHoverTarget);

      const nextTextNode = target?.closest(
        "p, span, h1, h2, h3, h4, h5, h6, a, button, li, label, small, strong, em, pre, code",
      ) as HTMLElement | null;

      if (hoveredTextRef.current !== nextTextNode) {
        if (hoveredTextRef.current) {
          hoveredTextRef.current.classList.remove("terminal-hover-flicker");
        }
        clearHoverTimer();
      }

      if (nextTextNode && nextTextNode.textContent?.trim()) {
        if (hoveredTextRef.current !== nextTextNode) {
          hoveredTextRef.current = nextTextNode;
          triggerHoverGlitch(nextTextNode);
          scheduleHoverGlitch(nextTextNode);
        }
      } else {
        hoveredTextRef.current = null;
      }
    };

    window.addEventListener("mousemove", moveCursor);
    return () => {
      window.removeEventListener("mousemove", moveCursor);
      clearHoverTimer();
      if (hoveredTextRef.current) {
        hoveredTextRef.current.classList.remove("terminal-hover-flicker");
      }
    };
  }, []);

  const loadingBar = useMemo(() => {
    const width = 28;
    const filled = Math.round((progress / 100) * width);
    const cells = "#".repeat(filled) + " ".repeat(Math.max(width - filled, 0));

    return `[${cells}]`;
  }, [progress]);

  const typedPrompt = PROMPT_LINE.slice(0, typedChars);

  const scrollToSection = useCallback((id: string) => {
    const section = document.getElementById(id);
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const appendCommandLine = useCallback(
    (kind: CommandLine["kind"], text: string) => {
      const nextId = commandLineIdRef.current + 1;
      commandLineIdRef.current = nextId;
      setCommandLines((previous) => [...previous, { id: nextId, kind, text }]);
    },
    [],
  );

  const runCommand = useCallback(
    (rawCommand: string) => {
      const normalized = rawCommand.trim().toLowerCase().replace(/\s+/g, " ");
      if (!normalized) {
        return;
      }

      appendCommandLine("input", rawCommand.trim());

      if (normalized === "/help") {
        appendCommandLine("system", "available commands:");
        COMMAND_HINTS.forEach((command) =>
          appendCommandLine("output", command),
        );
        return;
      }

      if (normalized === "/contact us" || normalized === "/contact") {
        appendCommandLine("system", "contact links:");
        appendCommandLine("output", "email: yashpandey1556@gmail.com");
        appendCommandLine(
          "output",
          "linkedin: https://www.linkedin.com/in/yashppandey/",
        );
        appendCommandLine(
          "output",
          "github: https://github.com/yashpandey0031",
        );
        return;
      }

      if (normalized === "/projects") {
        appendCommandLine("system", "project module loaded:");
        PROJECTS.forEach((project) =>
          appendCommandLine("output", project.title),
        );
        return;
      }

      if (normalized === "/achievements") {
        appendCommandLine("system", "achievements feed:");
        ACHIEVEMENTS.forEach((achievement) =>
          appendCommandLine("output", achievement.detail),
        );
        return;
      }

      if (normalized === "/about us" || normalized === "/about") {
        appendCommandLine(
          "output",
          "AI/ML enthusiast and backend developer building practical web and research-backed tools.",
        );
        return;
      }

      if (normalized === "/time") {
        appendCommandLine(
          "output",
          new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: "Asia/Kolkata",
            hour12: false,
          }).format(new Date()),
        );
        return;
      }

      appendCommandLine("error", "unknown command. type /help");
    },
    [appendCommandLine],
  );

  useEffect(() => {
    commandOutputEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [commandLines, isFloatingTerminalOpen]);

  useEffect(() => {
    const audio = musicAudioRef.current;
    if (!audio) {
      return;
    }

    const handlePlay = () => setIsMusicPlaying(true);
    const handlePause = () => setIsMusicPlaying(false);
    const handleEnded = () => setIsMusicPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const handleToggleMusicPlayback = useCallback(async () => {
    const audio = musicAudioRef.current;
    if (!audio) {
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setIsMusicPlaying(false);
      }
      return;
    }

    audio.pause();
  }, []);

  const handleEnterShell = () => {
    if (isTransitioning || showMainSection) {
      return;
    }

    setIsTransitioning(true);

    const panel = terminalPanelRef.current;
    const overlay = glitchOverlayRef.current;

    if (!panel || !overlay) {
      setShowMainSection(true);
      setIsTransitioning(false);
      return;
    }

    const timeline = gsap.timeline({
      onComplete: () => {
        gsap.set(panel, { clearProps: "all" });
        gsap.set(overlay, { opacity: 0 });
        setShowMainSection(true);
        setIsTransitioning(false);
      },
    });

    timeline
      .set(overlay, { opacity: 0.1 })
      .to(
        panel,
        {
          x: 8,
          y: -2,
          skewX: 2,
          filter: "contrast(1.25)",
          duration: 0.04,
          repeat: 8,
          yoyo: true,
          ease: "none",
        },
        0,
      )
      .to(
        overlay,
        {
          opacity: 0.95,
          duration: 0.12,
          ease: "power2.in",
        },
        0,
      )
      .to(
        overlay,
        {
          backgroundPosition: "180px 0, -150px 0, 0 0",
          duration: 0.24,
          repeat: 2,
          yoyo: true,
          ease: "none",
        },
        0,
      )
      .to(
        panel,
        {
          opacity: 0,
          scale: 1.015,
          duration: 0.2,
          ease: "power2.in",
        },
        0.16,
      )
      .to(
        overlay,
        {
          opacity: 0,
          duration: 0.26,
          ease: "power2.out",
        },
        0.28,
      );
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!showMainSection || !mainSectionRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-project-card]");

      if (heroModuleRef.current && aboutSectionRef.current) {
        gsap.fromTo(
          heroModuleRef.current,
          { y: 0, scale: 1, opacity: 1 },
          {
            y: -170,
            scale: 0.9,
            opacity: 0.25,
            ease: "none",
            scrollTrigger: {
              trigger: aboutSectionRef.current,
              start: "top bottom",
              end: "top top",
              scrub: 1.5,
            },
          },
        );

        gsap.fromTo(
          aboutSectionRef.current,
          { y: 120, opacity: 0.35 },
          {
            y: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: aboutSectionRef.current,
              start: "top bottom",
              end: "top center",
              scrub: 1.2,
            },
          },
        );
      }

      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0.25, y: 110, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top 92%",
              end: "top 50%",
              scrub: true,
            },
          },
        );
      });
    }, mainSectionRef);

    return () => ctx.revert();
  }, [showMainSection]);

  useEffect(() => {
    if (!showMainSection || !achievementSequenceStarted) {
      return;
    }

    setAchievementLinesShown([]);
    setAchievementRevealCount(0);

    const lineTimers = ACHIEVEMENT_LINES.map((line, index) =>
      window.setTimeout(
        () => {
          setAchievementLinesShown((previous) => [...previous, line]);
        },
        800 + index * 520,
      ),
    );

    const revealTimerStart = 1100 + ACHIEVEMENT_LINES.length * 520;
    const revealTimers = ACHIEVEMENTS.map((_, index) =>
      window.setTimeout(
        () => {
          setAchievementRevealCount(index + 1);
        },
        revealTimerStart + index * 500,
      ),
    );

    return () => {
      lineTimers.forEach((timer) => window.clearTimeout(timer));
      revealTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [showMainSection, achievementSequenceStarted]);

  return (
    <main
      className={`relative flex min-h-screen flex-1 flex-col scroll-smooth bg-[#020202] text-white ${showMainSection ? "snap-y snap-mandatory overflow-x-hidden overflow-y-auto" : "overflow-hidden"}`}
    >
      <div className="pointer-events-none absolute inset-0 ascii-noise opacity-25" />
      <div
        ref={glitchOverlayRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30 glitch-overlay opacity-0"
      />

      {!bootDone ? (
        <section className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-between px-6 py-8 sm:px-10 sm:py-10">
          <header className="text-xs uppercase tracking-[0.18em] text-zinc-300 sm:text-sm">
            system bios // v0.1.7
          </header>

          <div className="space-y-6 sm:space-y-8">
            <p className="text-[11px] leading-relaxed text-zinc-300 sm:text-sm">
              cold boot sequence engaged {SPINNER[spinnerIndex]}
            </p>

            <div className="space-y-2 border border-zinc-700 p-4 sm:p-5">
              {bootLinesShown.map((line) => (
                <p
                  key={line}
                  className="terminal-flicker text-[12px] text-zinc-200 sm:text-sm"
                >
                  &gt; {line}
                </p>
              ))}
              <p className="text-[12px] text-zinc-500 sm:text-sm">&gt; _</p>
            </div>

            <div className="space-y-1 text-[11px] text-zinc-300 sm:text-sm">
              <p>{loadingBar}</p>
              <p>progress: {progress}%</p>
            </div>
          </div>

          <footer className="text-[11px] uppercase tracking-[0.2em] text-zinc-500 sm:text-xs">
            no color mode // monochrome output only
          </footer>
        </section>
      ) : (
        <motion.section
          ref={terminalPanelRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: showMainSection ? 0 : 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className={`${showMainSection ? "pointer-events-none hidden" : ""} relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-8 sm:px-10 sm:py-10`}
        >
          <div className="flex items-center justify-between border border-zinc-700 bg-[#060606] px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-zinc-400 sm:text-xs">
            <span>terminal://portfolio/root</span>
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="signal-dot" />
              connected
            </span>
          </div>

          <div className="mt-4 flex-1 border border-t-0 border-zinc-700 bg-[#040404] px-4 py-5 sm:px-6 sm:py-8">
            <pre className="text-[10px] leading-tight text-zinc-300 sm:text-xs">
              {String.raw`__   __    _    ____  _   _ 
\ \ / /   / \  / ___|| | | |
 \ V /   / _ \ \___ \| |_| |
  | |   / ___ \ ___) |  _  |
  |_|  /_/   \_\____/|_| |_|

 ____   _    _   _ ____  _______   __
|  _ \ / \  | \ | |  _ \| ____\ \ / /
| |_) / _ \ |  \| | | | |  _|  \ V / 
|  __/ ___ \| |\  | |_| | |___  | |  
|_| /_/   \_\_| \_|____/|_____| |_|  
`}
            </pre>

            <div className="mt-5 space-y-4 sm:mt-6">
              <p className="text-[12px] text-zinc-100 sm:text-sm">
                {typedPrompt}
                <span className="ascii-blink">_</span>
              </p>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.28 }}
                className="max-w-2xl text-[12px] leading-relaxed text-zinc-300 sm:text-sm"
              >
                minimal monochrome terminal interface loaded. older sections
                stay offline for now. navigation modules will be mounted in
                later revisions.
              </motion.p>

              <motion.button
                data-cursor="interactive"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.25 }}
                className="ascii-hover-invert border border-zinc-500 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-zinc-100 sm:text-xs"
                type="button"
                onClick={handleEnterShell}
              >
                <DistortText text="enter shell" />
              </motion.button>
            </div>
          </div>
        </motion.section>
      )}

      {showMainSection ? (
        <motion.section
          ref={mainSectionRef}
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative z-20 mx-auto flex w-full max-w-350 flex-col px-6 py-8 sm:px-10 sm:py-10"
        >
          <div
            ref={heroModuleRef}
            className="flex min-h-screen snap-start flex-col"
          >
            <div className="grid grid-cols-2 items-center text-[11px] uppercase tracking-[0.16em] text-zinc-400 sm:grid-cols-3 sm:text-xs">
              <div className="font-semibold text-zinc-100">YASH PANDEY</div>
              <div className="hidden text-center sm:block">{liveTime}</div>
              <nav className="relative z-40 ml-auto flex items-center gap-4 font-semibold text-zinc-200 pointer-events-auto">
                <a
                  href="#projects-section"
                  data-cursor="interactive"
                  className="transition-colors hover:text-white"
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToSection("projects-section");
                  }}
                >
                  PROJECTS
                </a>
                <a
                  href="#achievements-section"
                  data-cursor="interactive"
                  className="transition-colors hover:text-white"
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToSection("achievements-section");
                  }}
                >
                  ACHIEVEMENTS
                </a>
                <a
                  href="#about-section"
                  data-cursor="interactive"
                  className="transition-colors hover:text-white"
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToSection("about-section");
                  }}
                >
                  ABOUT
                </a>
                <a
                  href="#contact-section"
                  data-cursor="interactive"
                  className="transition-colors hover:text-white"
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToSection("contact-section");
                  }}
                >
                  CONTACT
                </a>
              </nav>
            </div>

            <div className="relative mt-10 flex flex-1 -translate-y-30 items-center justify-center overflow-hidden">
              <div className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[36%] md:block">
                <Image
                  src="/Untitled design (2).png"
                  alt="Portrait background"
                  fill
                  className="object-contain object-bottom-right opacity-35 grayscale"
                  priority
                />
              </div>

              <div className="relative z-10 w-full max-w-5xl">
                <div>
                  <div className="pointer-events-none absolute -left-14 top-0 z-20 hidden h-44 w-64 border border-zinc-500/70 bg-black/60 p-1 md:block">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      src="/eee.mp4"
                      className="h-full w-full object-cover grayscale opacity-80"
                    />
                  </div>

                  <p className="text-center text-[11px] uppercase tracking-[0.28em] text-zinc-500 sm:text-xs">
                    NAVIGATING THE UNKNOWN, PIXEL BY PIXEL.
                  </p>

                  <div className="main-name-box mt-4 border border-zinc-700/90 px-4 py-3 sm:px-8 sm:py-4">
                    <h1 className="main-name-solid text-center leading-[0.9] text-zinc-100">
                      YASH
                    </h1>
                  </div>

                  <h2 className="main-name-outline mt-3 text-center leading-[0.88] text-zinc-300">
                    PANDEY
                  </h2>

                  <p className="mt-8 text-center text-base text-zinc-500 sm:text-3xl">
                    Building the web, one project at a time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <section
            ref={aboutSectionRef}
            id="about-section"
            className="mt-12 grid min-h-screen snap-start gap-10 border-t border-zinc-800 pt-12 pb-16 lg:grid-cols-[1.05fr_1fr] lg:items-start"
          >
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.25 }}
              className="relative h-90 w-full overflow-hidden border border-zinc-700 bg-zinc-100 lg:mt-3"
            >
              <Image
                src="/busy.png"
                alt="About section visual"
                fill
                className="object-cover grayscale"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.06 }}
              viewport={{ once: true, amount: 0.25 }}
              className="space-y-8"
            >
              <div>
                <h3 className="main-name-solid text-6xl! tracking-[0.04em] text-zinc-200 sm:text-7xl!">
                  About Me
                </h3>
                <div className="mt-3 h-px w-full bg-zinc-700" />
              </div>

              <p className="max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg">
                A Backend developer and AI/ML enthusiast passionate about
                building clean, user-friendly applications. I work across modern
                web technologies and machine learning, with experience ranging
                from practical utilities to research-oriented deep learning
                projects. My interests span recommendation systems, coding
                tools, and engineering solutions that blend technical depth with
                great user experience.
                <br />
                <br />
                Outside of coding, I explore photography, nature, and music.
                I&apos;m always excited to collaborate on innovative projects or
                discuss emerging technologies.
              </p>

              <p className="text-sm text-zinc-400 sm:text-base">
                For business inquiries, email at yashpandey1556@gmail.com
              </p>
            </motion.div>
          </section>

          <section
            id="achievements-section"
            className="relative min-h-screen snap-start border-t border-zinc-800 pt-12 pb-20 overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              viewport={{ once: true, amount: 0.3 }}
              className="pointer-events-none absolute top-8 left-4 z-0 hidden h-115 w-90 md:block"
            >
              <Image
                src="/davinchi.jpg"
                alt="DaVinci inspiration"
                fill
                className="object-cover opacity-55 grayscale"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true, amount: 0.3 }}
              className="pointer-events-none absolute -bottom-6 right-0 z-0 hidden h-80 w-80 md:block"
            >
              <Image
                src="/donut.gif"
                alt="Rotating donut"
                fill
                className="object-contain opacity-55"
              />
            </motion.div>

            <div className="relative z-20">
              <div className="mb-10">
                <h3 className="main-name-solid text-6xl! tracking-[0.04em] text-zinc-200 sm:text-7xl!">
                  Achievements
                </h3>
                <div className="mt-3 h-px w-full bg-zinc-700" />
              </div>

              <motion.div
                initial={{ opacity: 0, filter: "blur(4px)", y: 16 }}
                whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: 0.55 }}
                viewport={{ once: true, amount: 0.25 }}
                onViewportEnter={() => {
                  setAchievementSequenceStarted((started) => started || true);
                }}
                className="mx-auto w-full max-w-4xl border border-zinc-700 bg-[#040404]/95 p-5 sm:p-6 min-h-110"
              >
                <div className="flex items-center justify-between border-b border-zinc-700 pb-4 text-[10px] uppercase tracking-[0.2em] text-zinc-400 sm:text-xs">
                  <span>terminal://achievements/root</span>
                  <span className="flex items-center gap-2">
                    <span aria-hidden="true" className="signal-dot" />
                    connected
                  </span>
                </div>

                <div className="mt-5 space-y-2 text-[11px] text-zinc-300 sm:text-sm">
                  <p className="text-zinc-400">
                    &gt; /fetch-achievements --latest --stream
                  </p>
                  {achievementLinesShown.map((line) => (
                    <p key={line} className="terminal-flicker">
                      &gt; {line}
                    </p>
                  ))}
                  <p className="text-zinc-500">&gt; stream achievements.log</p>
                </div>

                <div className="mt-6 space-y-4 border-t border-zinc-800 pt-4 text-[11px] sm:text-sm">
                  {ACHIEVEMENTS.slice(0, achievementRevealCount).map((item) => (
                    <div
                      key={item.title}
                      className="terminal-flicker border-l-2 border-emerald-500/60 bg-emerald-500/5 px-3 py-2"
                    >
                      <p className="text-emerald-300">{item.detail}</p>
                    </div>
                  ))}
                  {achievementRevealCount < ACHIEVEMENTS.length ? (
                    <p className="text-zinc-500 ascii-blink">
                      loading next achievement_
                    </p>
                  ) : (
                    <p className="text-zinc-500">end of file.</p>
                  )}
                </div>
              </motion.div>
            </div>
          </section>
          <section
            id="projects-section"
            className="relative min-h-screen snap-start border-t border-zinc-800 pt-12 pb-28"
          >
            <div className="mb-10">
              <h3 className="main-name-solid text-6xl! tracking-[0.04em] text-zinc-200 sm:text-7xl!">
                Projects
              </h3>
              <div className="mt-3 h-px w-full bg-zinc-700" />
            </div>

            <div className="flex flex-wrap items-start justify-center gap-8 lg:gap-10">
              {PROJECTS.map((project, index) => (
                <motion.article
                  key={project.title}
                  data-project-card
                  className="relative w-72"
                  style={{ rotate: `${-8 + index * 5}deg` }}
                  whileHover={{ y: -22, scale: 1.08, rotate: 0 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  onHoverStart={() => setHoveredProject(project)}
                  onHoverEnd={() =>
                    setHoveredProject((active) =>
                      active?.title === project.title ? null : active,
                    )
                  }
                >
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block overflow-hidden rounded-2xl border border-zinc-400/65 bg-zinc-100 shadow-[0_16px_30px_rgba(0,0,0,0.35)]"
                  >
                    <div className="relative aspect-3/4">
                      <Image
                        src={project.imageSrc}
                        alt={`${project.title} preview`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />

                      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/35 to-transparent px-4 pb-4 pt-12 transition-opacity duration-300 group-hover:opacity-0">
                        <p className="text-lg font-semibold lowercase tracking-[0.02em] text-zinc-100">
                          {project.title}
                        </p>
                      </div>

                      <div className="absolute inset-0 flex flex-col justify-end bg-black/78 p-4 text-zinc-100 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <p className="text-xs uppercase tracking-[0.14em] text-zinc-300">
                          {project.stack}
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-zinc-100">
                          {project.points[0]}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-zinc-300">
                          {project.points[1]}
                        </p>
                        <p className="mt-4 text-xs uppercase tracking-[0.18em] text-emerald-300">
                          open project
                        </p>
                      </div>
                    </div>
                  </a>
                </motion.article>
              ))}
            </div>

            <AnimatePresence>
              {hoveredProject ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="pointer-events-none absolute inset-0 z-50 hidden items-center justify-center md:flex"
                >
                  <div className="absolute inset-0 bg-black/35" />
                  <motion.div
                    initial={{ scale: 0.62, y: 44, rotate: -8 }}
                    animate={{ scale: 1, y: 0, rotate: 0 }}
                    exit={{ scale: 0.62, y: 44, rotate: -8 }}
                    transition={{ duration: 0.24, ease: "easeOut" }}
                    className="relative w-full max-w-xl px-6"
                  >
                    <div className="overflow-hidden rounded-2xl border border-zinc-300/70 bg-zinc-100 shadow-[0_40px_90px_rgba(0,0,0,0.7)]">
                      <div className="relative aspect-3/4">
                        <Image
                          src={hoveredProject.imageSrc}
                          alt={`${hoveredProject.title} preview`}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 flex flex-col justify-end bg-black/68 p-6 text-zinc-100">
                          <p className="text-sm uppercase tracking-[0.16em] text-zinc-300">
                            {hoveredProject.stack}
                          </p>
                          <h4 className="mt-2 text-2xl font-semibold lowercase tracking-[0.02em] text-white">
                            {hoveredProject.title}
                          </h4>
                          <p className="mt-3 text-sm leading-relaxed text-zinc-100">
                            {hoveredProject.points[0]}
                          </p>
                          <p className="mt-2 text-xs leading-relaxed text-zinc-300">
                            {hoveredProject.points[1]}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </section>

          <footer
            id="contact-section"
            className="min-h-[65vh] snap-start border-t border-zinc-800 pt-14 pb-20"
          >
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.2 }}
              className="space-y-12"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.2 }}
                className="border-b border-zinc-800 pb-10"
              >
                <h2 className="main-name-solid leading-[0.9] text-zinc-100">
                  Contact Me
                </h2>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.16, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.2 }}
                className="space-y-8"
              >
                <p className="text-4xl font-semibold uppercase tracking-[0.08em] text-zinc-200 sm:text-5xl">
                  Say hi
                </p>

                <div className="space-y-4 text-lg text-zinc-300 sm:text-xl">
                  <p>
                    <a
                      href="https://www.linkedin.com/in/yashppandey/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-b border-zinc-600 pb-0.5 transition-colors hover:text-white"
                    >
                      LinkedIn
                    </a>
                  </p>
                  <p>
                    <a
                      href="https://github.com/yashpandey0031"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-b border-zinc-600 pb-0.5 transition-colors hover:text-white"
                    >
                      GitHub
                    </a>
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </footer>
        </motion.section>
      ) : null}

      {showMainSection ? (
        <div className="pointer-events-none fixed bottom-6 right-5 z-60">
          <audio
            ref={musicAudioRef}
            src="/Off World [YMlWeP2HkI0].mp3"
            preload="none"
          />

          <button
            type="button"
            data-cursor="interactive"
            aria-label={isMusicPlaying ? "Pause Off World" : "Play Off World"}
            className={`pointer-events-auto h-24 w-24 rounded-3xl border border-white/85 bg-white/10 text-4xl text-white shadow-[0_0_24px_rgba(255,255,255,0.2)] transition-colors hover:bg-white/20 ${isMusicPlaying ? "animate-pulse" : ""}`}
            onClick={handleToggleMusicPlayback}
          >
            ♫
          </button>
        </div>
      ) : null}

      {showMainSection ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-60 flex justify-center px-4">
          <motion.div
            className={`pointer-events-auto w-full rounded-3xl border border-emerald-400/70 bg-[#07150d]/95 shadow-[0_20px_50px_rgba(16,185,129,0.32)] backdrop-blur ${isFloatingTerminalOpen ? "max-w-3xl" : "max-w-lg"}`}
            initial={false}
            animate={{ height: isFloatingTerminalOpen ? 430 : 86 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            onClick={() => setIsFloatingTerminalOpen(true)}
          >
            <div className="flex h-full flex-col overflow-hidden rounded-3xl">
              <div className="flex items-center justify-between border-b border-emerald-500/35 px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-emerald-200 sm:text-xs">
                <span>command-shell</span>
                <button
                  type="button"
                  className="rounded-full border border-emerald-400/70 px-2 py-1 text-[10px] text-emerald-100 transition-colors hover:bg-emerald-400/20"
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsFloatingTerminalOpen((open) => !open);
                  }}
                >
                  {isFloatingTerminalOpen ? "_" : "[ ]"}
                </button>
              </div>

              {isFloatingTerminalOpen ? (
                <>
                  <div className="px-4 pt-3 text-[11px] text-emerald-300/80 sm:text-sm">
                    type /help for more info
                  </div>

                  <div className="px-4 pt-2">
                    <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs">
                      {COMMAND_HINTS.map((command) => (
                        <button
                          key={command}
                          type="button"
                          className="rounded-full border border-emerald-400/60 px-2 py-1 text-emerald-100 transition-colors hover:border-emerald-200 hover:bg-emerald-400/15"
                          onClick={(event) => {
                            event.stopPropagation();
                            runCommand(command);
                          }}
                        >
                          {command}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 flex-1 space-y-2 overflow-y-auto px-4 pb-3 text-[11px] sm:text-sm">
                    {commandLines.map((line) => (
                      <p
                        key={line.id}
                        className={
                          line.kind === "input"
                            ? "text-emerald-300"
                            : line.kind === "system"
                              ? "text-emerald-300"
                              : line.kind === "error"
                                ? "text-rose-300"
                                : "text-emerald-100"
                        }
                      >
                        {line.kind === "input" ? "> " : ""}
                        {line.text}
                      </p>
                    ))}
                    <div ref={commandOutputEndRef} />
                  </div>
                </>
              ) : (
                <div className="flex flex-1 items-center px-4 text-[11px] text-emerald-200/85 sm:text-sm">
                  &gt; type /help for more info
                </div>
              )}

              <form
                className="border-t border-emerald-500/30 px-4 py-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  runCommand(commandInput);
                  setCommandInput("");
                }}
              >
                <label className="flex items-center gap-2 text-[11px] sm:text-sm">
                  <span className="text-emerald-300">&gt;</span>
                  <input
                    data-cursor="interactive"
                    value={commandInput}
                    onFocus={() => setIsFloatingTerminalOpen(true)}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => setCommandInput(event.target.value)}
                    placeholder="/help"
                    className="w-full bg-transparent text-emerald-50 outline-none placeholder:text-emerald-300/60"
                  />
                </label>
              </form>
            </div>
          </motion.div>
        </div>
      ) : null}

      <div
        aria-hidden="true"
        className={`custom-cursor ${cursorReady ? "opacity-100" : "opacity-0"}`}
        style={{
          left: cursorPos.x,
          top: cursorPos.y,
        }}
      >
        <span className="ascii-blink">{hoveringInteractive ? "_" : "▉"}</span>
      </div>
    </main>
  );
}
