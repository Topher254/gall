import { useEffect, useState } from "react";

interface Particle {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  char: string;
}

const chars = ["✦", "♥", "·", "✧", "♡", "·", "✦"];

const FloatingHearts = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generated: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 8 + Math.random() * 16,
      duration: 10 + Math.random() * 15,
      delay: Math.random() * 12,
      opacity: 0.1 + Math.random() * 0.2,
      char: chars[Math.floor(Math.random() * chars.length)],
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute text-primary"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            animation: `float-particle ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        >
          {p.char}
        </div>
      ))}
    </div>
  );
};

export default FloatingHearts;
