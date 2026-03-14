import { useState } from "react";

interface LoveLetterProps {
  label: string;
  message: string;
  number: number;
}

const LoveLetter = ({ label, message, number }: LoveLetterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full letter-card p-6 flex items-center gap-5 text-left"
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center border border-primary/30 text-primary font-display text-xl flex-shrink-0">
            {number}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-lg text-foreground tracking-wide">{label}</p>
            <p className="text-muted-foreground text-sm mt-0.5 tracking-wide">Tap to open this letter</p>
          </div>
          <div className="text-2xl flex-shrink-0 opacity-40">✉️</div>
        </button>
      ) : (
        <div className="animate-unfold">
          <div className="letter-open rounded-2xl border p-8 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <span className="text-primary text-sm tracking-[0.2em] uppercase font-medium">Letter {number}</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            </div>
            <p className="text-foreground/80 leading-[1.9] text-base md:text-lg whitespace-pre-wrap font-light">
              {message}
            </p>
            <div className="pt-2 text-right">
              <span className="text-primary/60 text-sm italic tracking-wide">— For you, always ✦</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoveLetter;
