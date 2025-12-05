"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  originalVx: number;
  originalVy: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  twinkleOffset: number;
  twinkleSpeed: number;
}

interface Mouse {
  x: number;
  y: number;
}

export const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<Mouse>({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const timeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      const colors = ["#ff2d95", "#00f5ff", "#bf5fff", "#ccff00"];
      const particleCount = Math.min(50, Math.floor(window.innerWidth / 30));

      particlesRef.current = [];
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 4 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          originalVx: (Math.random() - 0.5) * 0.3,
          originalVy: (Math.random() - 0.5) * 0.3,
        });
      }
    };

    const createStars = () => {
      const starCount = Math.min(30, Math.floor(window.innerWidth / 50));

      starsRef.current = [];
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          twinkleOffset: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.02 + 0.01,
        });
      }
    };

    const drawParticle = (particle: Particle) => {
      // Pixel-style particle
      ctx.fillStyle = particle.color;
      ctx.fillRect(
        Math.floor(particle.x),
        Math.floor(particle.y),
        Math.ceil(particle.size),
        Math.ceil(particle.size)
      );

      // Glow effect
      const gradient = ctx.createRadialGradient(
        particle.x + particle.size / 2,
        particle.y + particle.size / 2,
        0,
        particle.x + particle.size / 2,
        particle.y + particle.size / 2,
        particle.size * 4
      );
      gradient.addColorStop(0, particle.color + "80");
      gradient.addColorStop(1, particle.color + "00");

      ctx.fillStyle = gradient;
      ctx.fillRect(
        particle.x - particle.size * 3,
        particle.y - particle.size * 3,
        particle.size * 8,
        particle.size * 8
      );
    };

    const drawStar = (star: Star, time: number) => {
      const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
      const opacity = 0.3 + twinkle * 0.7;
      const size = star.size * (0.5 + twinkle * 0.5);

      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;

      // Draw cross pattern for sparkle
      const crossSize = size * 2;
      ctx.fillRect(star.x - crossSize / 2, star.y - size / 2, crossSize, size);
      ctx.fillRect(star.x - size / 2, star.y - crossSize / 2, size, crossSize);

      // Glow
      ctx.shadowBlur = 10;
      ctx.shadowColor = `rgba(255, 255, 255, ${opacity})`;
      ctx.fillRect(star.x - size / 2, star.y - size / 2, size, size);
      ctx.shadowBlur = 0;
    };

    const updateParticle = (particle: Particle) => {
      const mouse = mouseRef.current;
      const dx = mouse.x - particle.x;
      const dy = mouse.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = 200;

      if (distance < maxDistance) {
        const force = (maxDistance - distance) / maxDistance;
        particle.vx = particle.originalVx - (dx / distance) * force * 2;
        particle.vy = particle.originalVy - (dy / distance) * force * 2;
      } else {
        particle.vx += (particle.originalVx - particle.vx) * 0.05;
        particle.vy += (particle.originalVy - particle.vy) * 0.05;
      }

      particle.x += particle.vx;
      particle.y += particle.vy;

      // Wrap around screen
      if (particle.x < -particle.size) particle.x = canvas.width;
      if (particle.x > canvas.width) particle.x = -particle.size;
      if (particle.y < -particle.size) particle.y = canvas.height;
      if (particle.y > canvas.height) particle.y = -particle.size;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      timeRef.current++;

      // Draw and update particles
      particlesRef.current.forEach((particle) => {
        updateParticle(particle);
        drawParticle(particle);
      });

      // Draw stars
      starsRef.current.forEach((star) => {
        drawStar(star, timeRef.current);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };

      // Update mouse glow
      const mouseGlow = document.getElementById("mouse-glow");
      const mouseX = (e.clientX / window.innerWidth) * 100;
      const mouseY = (e.clientY / window.innerHeight) * 100;

      if (mouseGlow) {
        mouseGlow.style.background = `
          radial-gradient(circle 800px at ${mouseX}% ${mouseY}%, rgba(255, 45, 149, 0.15) 0%, transparent 60%),
          radial-gradient(circle 600px at ${100 - mouseX}% ${100 - mouseY}%, rgba(0, 245, 255, 0.12) 0%, transparent 60%),
          radial-gradient(ellipse 1000px 600px at 50% 0%, rgba(191, 95, 255, 0.08) 0%, transparent 50%)
        `;
      }

      // Update gradient orbs
      const orbs = document.querySelectorAll(".gradient-orb");
      orbs.forEach((orb, index) => {
        const speed = 0.05 + index * 0.02;
        const x = (e.clientX - window.innerWidth / 2) * speed;
        const y = (e.clientY - window.innerHeight / 2) * speed;
        (orb as HTMLElement).style.transform = `translate(${x}px, ${y}px)`;
      });
    };

    const handleResize = () => {
      resize();
      createParticles();
      createStars();
    };

    // Initialize
    resize();
    createParticles();
    createStars();
    animate();

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};
