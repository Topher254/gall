import { useState, useEffect } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

const TypewriterText = ({ text, speed = 40, onComplete, className = "" }: TypewriterTextProps) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    setDisplayed("");
    setDone(false);
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setDone(true);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <p className={className} style={{ whiteSpace: "pre-wrap" }}>
      {displayed}
      {!done && (
        <span
          className="inline-block w-0.5 h-5 bg-primary ml-0.5 align-middle"
          style={{ animation: "typewriter-cursor 0.8s infinite" }}
        />
      )}
    </p>
  );
};

export default TypewriterText;
