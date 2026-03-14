import { useState, useEffect, useCallback, useRef } from "react";
import confetti from "canvas-confetti";
import TypewriterText from "@/components/TypewriterText";
import LoveLetter from "@/components/LoveLetter";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Container, Engine } from "tsparticles-engine";

type Section = "landing" | "letters" | "promises" | "final" | "result";
type Result = "yes" | "No really" | null;

const poem = `
Tuzae watoto wangapi asweeto,
Ni mimi pekee naeza ongea kichinku huko kwetu,


You're the most beautiful soul
I think I’ve ever known.

Sometimes I feel like
you must be God's favorite creation,
because everything about you
feels so rare.

Baby, I don’t want to lose you.
If there’s something about me
that pushes you away,
tell me what to change ...
maybe ni tabia yangu.

If you ever doubt my words,
you can even give me the Bible
and I will swear on it,
because what I feel for you
comes straight from my heart.

Being with you makes
ordinary moments feel special.
The smallest things with you
turn into memories I keep replaying.

Deep down, I feel like
you are the one for me.

And honestly…

I just want to call you
my love.
`;

const loveLetters = [
  {
    label: "Ama nijaribu na kifrench ?",
    message: `Sagina,

Peut-être que je devrais m’en vouloir.
Chaque jour, je me dis de ne pas tomber amoureux trop facilement de quelqu’un, mais d’une façon ou d’une autre, ça arrive quand même. Et cette fois… c’est arrivé avec toi.

I like your eyes, the way they look when you're listening. I like your personality, the way you naturally make people feel comfortable around you.

You're just a really good person to be around.

We've been hanging out for some time now, talking, sharing random moments… and somewhere along the way my feelings quietly grew.`,
  },
  {
  label: "Mmh",
  message: `Sagina,

Utanipenda ama utanidanganya?🥹
Unafanya silali binti,

I didn't wake up one morning deciding I would fall for you. 
I'll be your umbrella when you see rain. 

At first it was just liking your presence.  
Then it became noticing the small things about you.  
Then somehow my mind started circling back to you when I wasn't even trying.

Now here I am admitting something I didn't expect.
My feelings for you didn't ask for permission.

And honestly… I wouldn't stop them even if I could.`
},
{
  label: "Will you be my wife ?",
  message: `Sagina,

I'll always be at your service Princess,
Just say the word and I'll cool the sun for you,

No prison can hold the way I feel about you.
It is 1:38 am nikitype hizi,

I trust you with my heart in a way that feels reckless and calm at the same time.

Like jumping from a plane  
and somehow knowing the parachute will open.

That's what you feel like to me.
I'll give you my love till the day I die,

Risk… and safety… at the same time.`
},
];

const promises = [
  "I will always choose you, on easy days and hard ones.",
  "I will never let you question how I feel about you.",
  "I will protect your peace and guard your heart like it's my own.",
  "I will celebrate you, not just on special days, but every day.",
  "I will listen when words are hard and stay when things get heavy.",
  "I will grow with you, not away from you.",
  "I will make you laugh even when the world feels serious.",
];

const Index = () => {
  const [section, setSection] = useState<Section>("landing");
  const [poemDone, setPoemDone] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);
  const [result, setResult] = useState<Result>(null);
  const [showFinalQuestion, setShowFinalQuestion] = useState(false);
  const [visiblePromises, setVisiblePromises] = useState(0);
  const [showPromiseContinue, setShowPromiseContinue] = useState(false);
  const [showExpectationsForm, setShowExpectationsForm] = useState(false);
  const [expectations, setExpectations] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const playerRef = useRef<any>(null);
  const playerReadyRef = useRef(false);
  const userInteractedRef = useRef(false);
  const landingRef = useRef<HTMLDivElement>(null);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    console.log("Particles loaded", container);
  }, []);

  const transition = useCallback((next: Section) => {
    setFadeIn(false);
    setTimeout(() => {
      setSection(next);
      setShowFinalQuestion(false);
      setVisiblePromises(0);
      setShowPromiseContinue(false);
      setFadeIn(true);
    }, 600);
  }, []);

  const fireConfetti = () => {
    const duration = 4000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors: ["#c8913e", "#d4766b", "#e8b960", "#ffffff"],
        shapes: ["star", "circle"],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors: ["#c8913e", "#d4766b", "#e8b960", "#ffffff"],
        shapes: ["star", "circle"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const handleResult = (r: Result) => {
    setFadeIn(false);
    setTimeout(() => {
      setResult(r);
      setSection("result");
      setFadeIn(true);
      if (r === "yes") setTimeout(fireConfetti, 400);
      setTimeout(() => setShowExpectationsForm(true), 1000);
    }, 600);
  };

  const handleExpectationsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expectations.trim() || !result) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("https://gall-backend.onrender.com/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer: result,
          expectationsHtml: expectations,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit");
      }

      setFormSubmitted(true);
    } catch (error: any) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePlayPause = () => {
    if (playerRef.current && playerReadyRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  };

  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player("youtube-audio-player", {
        height: "0",
        width: "0",
        videoId: "2zfTPxaX5ss",
        playerVars: {
          autoplay: 1,
          mute: 1,
          start: 20,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: (event: any) => {
            playerReadyRef.current = true;
            event.target.setVolume(50);
            setDuration(event.target.getDuration());
            if (userInteractedRef.current) {
              event.target.unMute();
              event.target.playVideo();
            } else {
              event.target.playVideo();
            }
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
            }
          },
        },
      });
    };

    return () => {
      window.onYouTubeIframeAPIReady = null;
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!userInteractedRef.current) {
        userInteractedRef.current = true;
        if (playerRef.current && playerReadyRef.current) {
          playerRef.current.unMute();
          playerRef.current.playVideo();
        }
      }
    };

    window.addEventListener("click", handleFirstInteraction, { once: true });
    window.addEventListener("touchstart", handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    if (isPlaying && playerRef.current && playerReadyRef.current) {
      progressInterval.current = setInterval(() => {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
      }, 500);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    }
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    if (section === "final") {
      setTimeout(() => setShowFinalQuestion(true), 5000);
    }
    if (section === "promises") {
      const interval = setInterval(() => {
        setVisiblePromises((prev) => {
          if (prev >= promises.length) {
            clearInterval(interval);
            setTimeout(() => setShowPromiseContinue(true), 800);
            return prev;
          }
          return prev + 1;
        });
      }, 600);
      return () => clearInterval(interval);
    }
  }, [section]);

  const sectionClass = `min-h-screen flex items-center justify-center px-6 py-16 transition-all duration-1000 ease-out-expo ${
    fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
  }`;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]">
      {/* Particle Background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        className="absolute inset-0 -z-10"
        options={{
          background: { color: { value: "transparent" } },
          fpsLimit: 60,
          particles: {
            color: { value: ["#c8913e", "#d4766b", "#e8b960", "#ffffff"] },
            links: { enable: false },
            move: {
              enable: true,
              direction: "none",
              random: true,
              speed: 0.5,
              straight: false,
            },
            number: { density: { enable: true, area: 800 }, value: 80 },
            opacity: { value: 0.3, random: true },
            shape: { type: ["circle", "heart"] },
            size: { value: { min: 1, max: 3 }, random: true },
          },
          detectRetina: true,
        }}
      />

      {/* Hidden YouTube Player */}
      <div
        id="youtube-audio-player"
        style={{ position: "absolute", width: 0, height: 0, opacity: 0, pointerEvents: "none" }}
      />

      {/* Modern Music Player */}
      <div className="fixed top-6 left-6 z-50 group">
        <div className="relative flex items-center space-x-3">
          <div className="relative w-14 h-14">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="4"
              />
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="289.03"
                strokeDashoffset={289.03 * (1 - progress / 100)}
                style={{ transition: "stroke-dashoffset 0.2s" }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#c8913e" />
                  <stop offset="100%" stopColor="#d4766b" />
                </linearGradient>
              </defs>
            </svg>
            <button
              onClick={togglePlayPause}
              className="absolute inset-0 flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-amber-400/20 to-rose-400/20 backdrop-blur-md border border-white/20 shadow-2xl transition-all duration-300 hover:scale-110 hover:border-white/40 group"
            >
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center shadow-lg ${
                  isPlaying ? "animate-spin-slow" : ""
                }`}
              >
                {isPlaying ? (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </div>
            </button>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-mono text-white/70 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <span className="text-xs text-white/50 mt-1">Hero – Faouzia</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {section === "landing" && (
        <div ref={landingRef} className={sectionClass}>
          <div className="max-w-3xl w-full text-center space-y-12">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 text-xs tracking-[0.3em] uppercase bg-white/5 backdrop-blur-md rounded-full text-amber-300 border border-white/10">
                A letter for Sagina
              </span>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-light text-white leading-[1.1] tracking-wide">
                You Changed{" "}
                <span className="bg-gradient-to-r from-amber-300 via-rose-300 to-amber-300 bg-clip-text text-transparent italic animate-gradient">
                  Everything
                </span>
              </h1>
            </div>
            <div className="w-24 h-px mx-auto bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
            <div className="glass-card-strong p-8 md:p-12 text-left rounded-3xl border border-white/10 shadow-2xl">
              <TypewriterText
                text={poem}
                speed={30}
                onComplete={() => setPoemDone(true)}
                className="text-white/80 leading-[2] text-base md:text-lg font-light"
              />
            </div>
            {poemDone && (
              <button
                onClick={() => transition("letters")}
                className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-medium overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/25"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>Click Here</span>
                  <span className="text-2xl group-hover:animate-pulse">❤️</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            )}
          </div>
        </div>
      )}

      {section === "letters" && (
        <div className={sectionClass}>
          <div className="max-w-2xl w-full text-center space-y-10">
            <div className="space-y-3">
              <span className="inline-block px-3 py-1 text-xs tracking-[0.3em] uppercase bg-white/5 backdrop-blur-md rounded-full text-amber-300 border border-white/10">
                Unsent letters
              </span>
              <h2 className="text-4xl md:text-6xl font-display font-light text-white tracking-wide">
                Things I Never{" "}
                <span className="bg-gradient-to-r from-amber-300 to-rose-300 bg-clip-text text-transparent italic">
                  Said
                </span>
              </h2>
              <p className="text-white/50 text-sm tracking-wide mt-2">
                Open each one. They've been waiting for you.
              </p>
            </div>
            <div className="w-24 h-px mx-auto bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
            <div className="space-y-4">
              {loveLetters.map((letter, i) => (
                <LoveLetter
                  key={i}
                  label={letter.label}
                  message={letter.message}
                  number={i + 1}
                />
              ))}
            </div>
            <button
              onClick={() => transition("promises")}
              className="group relative px-8 py-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white font-medium overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-amber-400/50"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <span>Keep Going</span>
                <span className="group-hover:translate-x-1 transition-transform">✦</span>
              </span>
            </button>
          </div>
        </div>
      )}

      {section === "promises" && (
        <div className={sectionClass}>
          <div className="max-w-2xl w-full text-center space-y-10">
            <div className="space-y-3">
              <span className="inline-block px-3 py-1 text-xs tracking-[0.3em] uppercase bg-white/5 backdrop-blur-md rounded-full text-amber-300 border border-white/10">
                My promises to you
              </span>
              <h2 className="text-4xl md:text-6xl font-display font-light text-white tracking-wide leading-snug">
                If You Let Me{" "}
                <span className="bg-gradient-to-r from-amber-300 to-rose-300 bg-clip-text text-transparent italic">
                  Stay
                </span>
              </h2>
              <p className="text-white/50 text-sm tracking-wide mt-2">
                These aren't just words, Sagina. These are commitments.
              </p>
            </div>
            <div className="w-24 h-px mx-auto bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
            <div className="space-y-3 text-left max-w-lg mx-auto">
              {promises.map((promise, i) => (
                <div
                  key={i}
                  className={`promise-item-modern transition-all duration-700 ${
                    i < visiblePromises
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-4"
                  }`}
                >
                  <div className="flex items-start space-x-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-amber-400/30 hover:bg-white/10 transition-all group">
                    <span className="text-amber-400 text-2xl leading-none mt-0.5 group-hover:rotate-12 transition-transform">
                      ✦
                    </span>
                    <p className="text-white/80 font-light leading-relaxed">{promise}</p>
                  </div>
                </div>
              ))}
            </div>
            {showPromiseContinue && (
              <button
                onClick={() => transition("final")}
                className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-medium overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/25"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>One Last Thing</span>
                  <span className="text-2xl group-hover:animate-pulse">❤️</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            )}
          </div>
        </div>
      )}

      {section === "final" && (
        <div className={`${sectionClass} final-bg`}>
          <div className="max-w-2xl w-full text-center space-y-12">
            <div className="glass-card-strong p-10 md:p-14 space-y-6 rounded-3xl border border-white/10 shadow-2xl">
              <p className="text-xl text-white/80 font-light leading-[1.9]">
                Sagina, I love you. You know it, and it's true.
              </p>
              <p className="text-xl text-white/80 font-light leading-[1.9]">
                Being with you makes every moment brighter, every laugh sweeter, every day feel
                lighter. I fall for you every time I see your smile, every time we talk, every
                time you just exist.
              </p>
              <p className="text-xl text-white/80 font-light leading-[1.9]">
                I promise to cherish you, to be there through everything, and to love you with my
                whole heart.
              </p>
            </div>
            {showFinalQuestion && (
              <div className="space-y-8 animate-fade-up">
                <h2 className="text-5xl md:text-7xl lg:text-8xl font-display font-light text-white tracking-wide leading-[1.2]">
                  Sagina, will you be my{" "}
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-amber-300 to-rose-300 bg-clip-text text-transparent italic">
                      girlfriend?
                    </span>
                    <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-rose-400 rounded-full animate-pulse" />
                  </span>
                </h2>
                <div className="flex flex-col sm:flex-row gap-6 justify-center flex-wrap">
                  <button
                    onClick={() => handleResult("yes")}
                    className="group relative px-10 py-5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-lg font-medium overflow-hidden transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-amber-500/25"
                  >
                    <span className="relative z-10 flex items-center space-x-3">
                      <span>Yes</span>
                      <span className="text-2xl">🥺❤️</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                  <button
                    onClick={() => handleResult("No really")}
                    className="group relative px-10 py-5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white text-lg font-medium overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-rose-400/50"
                  >
                    <span className="relative z-10 flex items-center space-x-3">
                      <span>Not Really</span>
                      <span className="text-2xl">😌</span>
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {section === "result" && (
        <div className={`${sectionClass} ${result === "yes" ? "final-bg" : ""}`}>
          <div className="max-w-2xl w-full text-center space-y-10 animate-celebration">
            {result === "yes" && (
              <>
                <div className="text-8xl md:text-9xl animate-bounce">🥹</div>
                <h2 className="text-5xl md:text-7xl font-display font-light text-white tracking-wide leading-tight">
                  You just made me the{" "}
                  <span className="bg-gradient-to-r from-amber-300 to-rose-300 bg-clip-text text-transparent italic">
                    happiest
                  </span>{" "}
                  man alive.
                </h2>
                <p className="text-2xl text-white/60 font-light tracking-wide">
                  I'll love you more every second my patootie.
                </p>
              </>
            )}
            {result === "No really" && (
              <>
                <div className="text-8xl md:text-9xl animate-pulse">😀</div>
                <h2 className="text-5xl md:text-7xl font-display font-light text-white tracking-wide leading-tight">
                  Decision{" "}
                  <span className="bg-gradient-to-r from-amber-300 to-rose-300 bg-clip-text text-transparent italic">
                    respected
                  </span>
                </h2>
                <p className="text-2xl text-white/60 font-light tracking-wide">Anaku rahisi</p>
              </>
            )}

            {showExpectationsForm && !formSubmitted && (
              <div className="mt-16 glass-card-strong p-8 md:p-10 max-w-lg mx-auto rounded-3xl border border-white/10 shadow-2xl">
                <h3 className="text-3xl font-display font-light text-white mb-4">
                  What do you expect from me?
                </h3>
                <p className="text-white/60 text-sm mb-6">
                  Share your heart ... I'm listening.
                </p>
                <form onSubmit={handleExpectationsSubmit} className="space-y-5">
                  <ReactQuill
                    theme="snow"
                    value={expectations}
                    onChange={setExpectations}
                    placeholder="e.g., I need honesty, quality time, adventure, peace..."
                    modules={{
                      toolbar: [
                        ["bold", "italic", "underline"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["clean"],
                      ],
                    }}
                    className="bg-white text-black rounded-lg [&_.ql-toolbar]:bg-white/10 [&_.ql-toolbar]:border-white/20 [&_.ql-container]:border-white/20 [&_.ql-editor]:text-w [&_.ql-editor]:min-h-[120px]"
                  />
                  {submitError && <p className="text-rose-400 text-sm">{submitError}</p>}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-4 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Submitting..." : "Click here to submit ✨"}
                  </button>
                </form>
              </div>
            )}

            {formSubmitted && (
              <div className="mt-16 glass-card-strong p-8 md:p-10 max-w-lg mx-auto rounded-3xl border border-white/10 shadow-2xl animate-fade-in">
                <div className="text-6xl mb-4 animate-float">💌</div>
                <h3 className="text-3xl font-display font-light text-white mb-2">
                  Thank you for trusting me
                </h3>
                <p className="text-white/60">
                  Your response has been saved. I'll read it with all my heart.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full-screen loader */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-xl">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl animate-pulse">❤️</span>
              </div>
            </div>
            <p className="text-white text-xl font-light tracking-wide">Submitting your response...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;