import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './CanvasTestPage.css';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];

const createParticles = (count: number, width: number, height: number): Particle[] => {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 3,
    vy: (Math.random() - 0.5) * 3,
    radius: Math.random() * 4 + 2,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
};

export default function CanvasTestPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [particleCount, setParticleCount] = useState(1000);
  const [fps, setFps] = useState(0);
  const [animationType, setAnimationType] = useState<'particles' | 'waves' | 'bars'>('particles');
  const fpsCounterRef = useRef({ frames: 0, lastTime: performance.now() });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    particlesRef.current = createParticles(particleCount, canvas.width, canvas.height);
  }, [particleCount]);

  const animateParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particlesRef.current.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();
    });

    // Draw connections
    for (let i = 0; i < particlesRef.current.length; i += 1) {
      for (let j = i + 1; j < particlesRef.current.length; j += 1) {
        const p1 = particlesRef.current[i];
        const p2 = particlesRef.current[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance / 100})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  };

  const animateWaves = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const waveCount = 5;
    const amplitude = 50;

    for (let wave = 0; wave < waveCount; wave += 1) {
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);

      for (let x = 0; x < canvas.width; x += 1) {
        const y =
          canvas.height / 2 +
          Math.sin((x + time * (wave + 1)) / 50) * amplitude +
          Math.cos((x + time * (wave + 1)) / 30) * (amplitude / 2);
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = colors[wave % colors.length];
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  };

  const animateBars = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barCount = 100;
    const barWidth = canvas.width / barCount;

    for (let i = 0; i < barCount; i += 1) {
      const height =
        Math.abs(Math.sin((time / 500 + i / 10) * Math.PI)) * canvas.height * 0.8;
      const x = i * barWidth;
      const y = canvas.height - height;

      const gradient = ctx.createLinearGradient(x, y, x, canvas.height);
      gradient.addColorStop(0, colors[i % colors.length]);
      gradient.addColorStop(1, '#000000');

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth - 2, height);
    }
  };

  const animate = (time: number) => {
    if (animationType === 'particles') {
      animateParticles();
    } else if (animationType === 'waves') {
      animateWaves(time);
    } else if (animationType === 'bars') {
      animateBars(time);
    }

    // FPS calculation
    fpsCounterRef.current.frames += 1;
    const now = performance.now();
    if (now >= fpsCounterRef.current.lastTime + 1000) {
      setFps(fpsCounterRef.current.frames);
      fpsCounterRef.current.frames = 0;
      fpsCounterRef.current.lastTime = now;
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  const startAnimation = () => {
    setIsAnimating(true);
    fpsCounterRef.current = { frames: 0, lastTime: performance.now() };
    animationRef.current = requestAnimationFrame(animate);
  };

  const stopAnimation = () => {
    setIsAnimating(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="container canvas-container">
      <div className="page-header">
        <h1>🎨 Canvas анимации</h1>
        <Link to="/">
          <button type="button" className="back-button">
            ← Назад
          </button>
        </Link>
      </div>

      <div className="canvas-controls">
        <div className="control-row">
          <div className="control-group">
            <label htmlFor="animation-type">
              Тип анимации:
              <select
                id="animation-type"
                value={animationType}
                onChange={(e) =>
                  setAnimationType(e.target.value as 'particles' | 'waves' | 'bars')
                }
                disabled={isAnimating}
              >
                <option value="particles">Частицы с соединениями</option>
                <option value="waves">Волны</option>
                <option value="bars">Частотные полосы</option>
              </select>
            </label>
          </div>

          {animationType === 'particles' && (
            <div className="control-group">
              <label htmlFor="particle-count">
                Количество частиц:
                <select
                  id="particle-count"
                  value={particleCount}
                  onChange={(e) => setParticleCount(Number(e.target.value))}
                  disabled={isAnimating}
                >
                  <option value={100}>100</option>
                  <option value={500}>500</option>
                  <option value={1000}>1,000</option>
                  <option value={2000}>2,000</option>
                  <option value={3000}>3,000</option>
                </select>
              </label>
            </div>
          )}

          <div className="button-group">
            {!isAnimating ? (
              <button type="button" onClick={startAnimation}>
                ▶ Запустить
              </button>
            ) : (
              <button type="button" onClick={stopAnimation} className="secondary">
                ⏸ Остановить
              </button>
            )}
          </div>
        </div>

        <div className="fps-display">
          <span className="fps-label">FPS:</span>
          <span className={`fps-value ${fps < 30 ? 'low' : fps < 50 ? 'medium' : 'high'}`}>
            {fps}
          </span>
        </div>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} className="animation-canvas" />
      </div>

      <div className="performance-tips">
        <h3>💡 Советы по оценке производительности:</h3>
        <ul>
          <li>
            <strong>60 FPS и выше:</strong> Отличная производительность
          </li>
          <li>
            <strong>30-60 FPS:</strong> Приемлемая производительность
          </li>
          <li>
            <strong>Ниже 30 FPS:</strong> Низкая производительность, система перегружена
          </li>
        </ul>
      </div>
    </div>
  );
}
