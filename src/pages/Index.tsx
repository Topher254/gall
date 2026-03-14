import { useState, useEffect, useCallback, useRef } from "react";
import confetti from "canvas-confetti";
import FloatingHearts from "@/components/FloatingHearts";
import TypewriterText from "@/components/TypewriterText";
import LoveLetter from "@/components/LoveLetter";

type Section = "landing" | "letters" | "promises" | "final" | "result";
type Result = "yes" | "No really" | null;

const poem = `Sikumbuki vile tulianza kuongea,
but meeting you felt like fate.

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
    label: "Maybe It's My Fault",
    message: `Sagina,

Maybe I should blame myself.

Every day I tell myself not to fall too easily for someone, but somehow it still happens. And this time… it happened with you.

I like your eyes, the way they look when you're listening. I like your personality, the way you naturally make people feel comfortable around you.

You're just a really good person to be around.

We've been hanging out for some time now, talking, sharing random moments… and somewhere along the way my feelings quietly grew.`,
  },
  {
    label: "What Happened To Me",
    message: `Sagina,

I didn't expect it to happen this way.

At first it was just enjoying your company. Then it became looking forward to seeing you. Then it became thinking about you even when you're not around.

Maybe it's my problem for falling too fast.

But the truth is, when I'm around you things feel lighter, calmer… like the world slows down for a moment.

And lately I can't even concentrate on much, because my mind somehow finds its way back to you.`,
  },
  {
    label: "Just Me Being Honest",
    message: `Sagina,

Maybe I'm just emotional right now.

Maybe I'm overthinking everything. Maybe I'm the one who let my heart run ahead of logic.

But I didn't want to hide it anymore.

You're someone special to me... not just because of how you look, but because of who you are.

I just wanted you to know the truth from my heart.

I fell for you.`,
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
  const [isPlaying, setIsPlaying] = useState(false); // Start as false, will be updated when player starts
  // Progress tracking
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Refs for YouTube player
  const playerRef = useRef<any>(null);
  const playerReadyRef = useRef(false);
  const userInteractedRef = useRef(false);
  const playOnReadyRef = useRef(false); // Flag to auto-play after ready if interaction already happened

  // Helper to open default mail client with recipient
  const openMailTo = (subject: string, body: string) => {
    const mailtoLink = `mailto:raphaelsarota@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

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
      confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors: ["#c8913e", "#d4766b", "#e8b960", "#ffffff"] });
      confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors: ["#c8913e", "#d4766b", "#e8b960", "#ffffff"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const handleResult = (r: Result) => {
    setFadeIn(false);
    // Store the result, but DO NOT send email yet
    setTimeout(() => {
      setResult(r);
      setSection("result");
      setFadeIn(true);
      if (r === "yes") setTimeout(fireConfetti, 400);
      // Show expectations form after a short delay
      setTimeout(() => setShowExpectationsForm(true), 1000);
    }, 600);
  };

  const handleExpectationsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expectations.trim() || !result) return;

    // Send ONE email with both the result and expectations to the fixed recipient
    const subject = "My Answer and Expectations for You";
    const answerText = result === "yes" ? "YES 🎉" : "Not really 😏";
    const body = `My answer: ${answerText}\n\nMy expectations for you:\n${expectations}`;
    openMailTo(subject, body);

    // Hide form and show thank you
    setFormSubmitted(true);
  };

  const togglePlayPause = () => {
    if (playerRef.current && playerReadyRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
      // isPlaying will be updated by onStateChange event
    }
  };

  // Load YouTube IFrame API and create hidden player
  useEffect(() => {
    // Load the IFrame Player API script
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Define callback when API is ready
    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-audio-player', {
        height: '0',
        width: '0',
        videoId: '2zfTPxaX5ss', // Faouzia - Hero
        playerVars: {
          autoplay: 1,          // Try to autoplay (will be muted initially)
          mute: 1,               // Start muted to satisfy browser autoplay policies
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
            // If user already interacted, unmute and play
            if (userInteractedRef.current) {
              event.target.unMute();
              event.target.playVideo();
            } else {
              // Otherwise it's already playing muted, we'll unmute on first interaction
              // Ensure it's playing muted
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

    // Cleanup
    return () => {
      window.onYouTubeIframeAPIReady = null;
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, []);

  // Unmute and play on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!userInteractedRef.current) {
        userInteractedRef.current = true;
        if (playerRef.current && playerReadyRef.current) {
          playerRef.current.unMute();
          playerRef.current.playVideo(); // Ensure it's playing
        }
      }
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  // Progress tracking
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

  const sectionClass = `min-h-screen flex items-center justify-center px-6 py-16 transition-all duration-700 ${fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`;

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="cinematic-bg min-h-screen relative overflow-hidden">
      <FloatingHearts />

      {/* Hidden YouTube Audio Player */}
      <div id="youtube-audio-player" style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }} />

      {/* Spinning Compact Disc with Progress Ring */}
      <div className="fixed bottom-4 left-4 z-50 flex flex-col items-center">
        {/* Container for disc and ring */}
        <div className="relative w-16 h-16">
          {/* Progress ring background (grey) */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="#4a4a4a"
              strokeWidth="4"
              opacity="0.3"
            />
            {/* Progress ring */}
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="#c8913e"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="289.03" // 2 * pi * 46 ≈ 289.03
              strokeDashoffset={289.03 * (1 - (progress || 0) / 100)}
              style={{ transition: 'stroke-dashoffset 0.2s' }}
              transform="rotate(-90 50 50)" // Start from top
            />
          </svg>
          {/* CD Button */}
          <button
            onClick={togglePlayPause}
            className="absolute inset-0 w-full h-full rounded-full focus:outline-none transition-transform hover:scale-105"
            aria-label={isPlaying ? "Pause music" : "Play music"}
          >
            <div
              className={`w-full h-full rounded-full bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 shadow-lg flex items-center justify-center border-2 border-gray-400 ${
                isPlaying ? "animate-spin" : ""
              }`}
              style={{ animationDuration: "4s" }}
            >
              <div className="w-4 h-4 rounded-full bg-gray-500 border-2 border-gray-600"></div>
            </div>
          </button>
        </div>
        {/* Time display */}
        <div className="mt-1 text-xs text-white/80 font-mono bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* LANDING — Poem */}
      {section === "landing" && (
        <div className={sectionClass}>
          <div className="max-w-2xl w-full text-center space-y-10">
            <div className="space-y-3">
              <p className="text-primary text-sm tracking-[0.3em] uppercase font-medium">A letter for Sagina</p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-light text-foreground leading-[1.15] tracking-wide">
                You Changed <span className="text-gradient-gold italic">Everything</span>
              </h1>
            </div>
            <div className="divider-gold" />
            <div className="glass-card p-8 md:p-10 text-left">
              <TypewriterText
                text={poem}
                speed={30}
                onComplete={() => setPoemDone(true)}
                className="text-foreground/70 leading-[2] text-base md:text-lg font-light"
              />
            </div>
            {poemDone && (
              <button
                onClick={() => transition("letters")}
                className="glow-button animate-pulse-glow"
              >
                Click Here ❤️
              </button>
            )}
          </div>
        </div>
      )}

      {/* LOVE LETTERS */}
      {section === "letters" && (
        <div className={sectionClass}>
          <div className="max-w-2xl w-full text-center space-y-8">
            <div className="space-y-3">
              <p className="text-primary text-sm tracking-[0.3em] uppercase font-medium">Unsent letters</p>
              <h2 className="text-3xl md:text-5xl font-display font-light text-foreground tracking-wide">
                Things I Never <span className="italic text-gradient-gold">Said</span>
              </h2>
              <p className="text-muted-foreground text-sm tracking-wide mt-2">Open each one. They've been waiting for you.</p>
              <p className="text-muted-foreground text-sm tracking-wide mt-2">I wrote each of them after tumetoka out.</p>
            </div>
            <div className="divider-gold" />
            <div className="space-y-4">
              {loveLetters.map((letter, i) => (
                <LoveLetter key={i} label={letter.label} message={letter.message} number={i + 1} />
              ))}
            </div>
            <button onClick={() => transition("promises")} className="glow-button mt-4">
              Keep Going ✦
            </button>
          </div>
        </div>
      )}

      {/* PROMISES */}
      {section === "promises" && (
        <div className={sectionClass}>
          <div className="max-w-2xl w-full text-center space-y-8">
            <div className="space-y-3">
              <p className="text-primary text-sm tracking-[0.3em] uppercase font-medium">My promises to you</p>
              <h2 className="text-3xl md:text-5xl font-display font-light text-foreground tracking-wide leading-snug">
                If You Let Me <span className="italic text-gradient-gold">Stay</span>
              </h2>
              <p className="text-muted-foreground text-sm tracking-wide mt-2">These aren't just words, Sagina. These are commitments.</p>
            </div>
            <div className="divider-gold" />
            <div className="space-y-3 text-left">
              {promises.map((promise, i) => (
                <div
                  key={i}
                  className={`promise-item transition-all duration-700 ${i < visiblePromises ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                >
                  <span className="text-primary font-display text-2xl leading-none mt-0.5">✦</span>
                  <p className="text-foreground/80 font-light leading-relaxed">{promise}</p>
                </div>
              ))}
            </div>
            {showPromiseContinue && (
              <button
                onClick={() => transition("final")}
                className="glow-button animate-pulse-glow"
              >
                One Last Thing ❤️
              </button>
            )}
          </div>
        </div>
      )}

      {/* FINAL QUESTION */}
      {section === "final" && (
        <div className={`${sectionClass} final-bg`}>
          <div className="max-w-2xl w-full text-center space-y-10">
            <div className="glass-card p-8 md:p-10 space-y-6">
              <p className="text-lg text-foreground/70 font-light leading-[1.9]">
                Sagina, I love you. You know it, and it’s true.
              </p>
              <p className="text-lg text-foreground/70 font-light leading-[1.9]">
                Being with you makes every moment brighter, every laugh sweeter, every day feel lighter.
                I fall for you every time I see your smile, every time we talk, every time you just exist.
              </p>
              <p className="text-lg text-foreground/70 font-light leading-[1.9]">
                I promise to cherish you, to be there through everything, and to love you with my whole heart.
              </p>
            </div>
            {showFinalQuestion && (
              <div className="space-y-8 animate-[celebration_0.8s_ease-out]">
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-light text-foreground tracking-wide leading-[1.2]">
                  Sagina, will you be my <span className="italic text-gradient-gold">girlfriend?</span>
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
                  <button onClick={() => handleResult("yes")} className="glow-button text-base">Yes 🥺❤️</button>
                  <button onClick={() => handleResult("No really")} className="option-button">Not Really 😌</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RESULT with combined Expectations Form */}
      {section === "result" && (
        <div className={`${sectionClass} ${result === "yes" ? "final-bg" : ""}`}>
          <div className="max-w-2xl w-full text-center space-y-8 animate-celebration">
            {result === "yes" && (
              <>
                <div className="text-7xl md:text-9xl">🥹</div>
                <h2 className="text-4xl md:text-6xl font-display font-light text-foreground tracking-wide leading-tight">
                  You just made me the <span className="italic text-gradient-gold">happiest</span> man alive.
                </h2>
                <p className="text-xl text-muted-foreground font-light tracking-wide">
                  I'll love you more every second my patootie.
                </p>
              </>
            )}
            {result === "No really" && (
              <>
                <div className="text-7xl md:text-9xl">😀</div>
                <h2 className="text-3xl md:text-5xl font-display font-light text-foreground tracking-wide leading-tight">
                  Decision  <span className="italic text-gradient-gold">respected</span>
                </h2>
                <p className="text-xl text-muted-foreground font-light tracking-wide">
                  Anaku rahisi
                </p>
              </>
            )}

            {/* Expectations Form (only shown before submission) */}
            {showExpectationsForm && !formSubmitted && (
              <div className="mt-12 glass-card p-6 md:p-8 max-w-lg mx-auto">
                <h3 className="text-2xl font-display font-light text-foreground mb-4">
                  What do you expect from me?
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Share your heart ... I'm listening. (Clicking submit will open your email client with your answer and expectations.)
                </p>
                <form onSubmit={handleExpectationsSubmit} className="space-y-4">
                  <textarea
                    value={expectations}
                    onChange={(e) => setExpectations(e.target.value)}
                    placeholder="e.g., I need honesty, quality time, adventure, peace..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    required
                  />
                  <button
                    type="submit"
                    className="glow-button w-full justify-center"
                  >
                    Click here to submit ✨
                  </button>
                </form>
              </div>
            )}

            {formSubmitted && (
              <div className="mt-12 glass-card p-6 md:p-8 max-w-lg mx-auto animate-fade-in">
                <div className="text-5xl mb-4">💌</div>
                <h3 className="text-2xl font-display font-light text-foreground mb-2">
                  Thank you for trusting me
                </h3>
                <p className="text-muted-foreground">
                  Your email client should open — please send it so I can read your answer and expectations.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;