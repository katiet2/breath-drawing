
import React, { useEffect, useRef, useState } from "react";

export default function SandDrawingOptimized() {
  const canvasRef = useRef(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const motionData = useRef({ x: 0, y: 0 });
  const particles = useRef([]);

  const requestPermission = () => {
    if (
      typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function"
    ) {
      DeviceMotionEvent.requestPermission()
        .then((response) => {
          if (response === "granted") {
            window.addEventListener("devicemotion", handleMotion);
            setPermissionGranted(true);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener("devicemotion", handleMotion);
      setPermissionGranted(true);
    }
  };

  const handleMotion = (event) => {
    const { x, y } = event.accelerationIncludingGravity || {};
    if (x !== undefined && y !== undefined) {
      motionData.current = { x, y };
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight;
    const maxParticles = 300;

    const spawnParticles = () => {
      const x = width / 2;
      const y = height / 2;
      const hue = ((motionData.current.x + motionData.current.y) * 30 + 360) % 360;
      const count = Math.random() < 0.7 ? 1 : 2;
      for (let i = 0; i < count; i++) {
        const speed = Math.random() * 1.0;
        const angle = Math.random() * 2 * Math.PI;
        particles.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: `hsl(${hue}, 80%, 50%)`,
          size: Math.random() * 1.2 + 0.3
        });
      }

      if (particles.current.length > maxParticles) {
        particles.current.splice(0, particles.current.length - maxParticles);
      }
    };

    const animate = () => {
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.fillRect(0, 0, width, height);

      spawnParticles();

      particles.current.forEach(p => {
        p.vx += motionData.current.x * 0.015;
        p.vy -= motionData.current.y * 0.015;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <canvas
        ref={canvasRef}
        className="block"
      />
      {!permissionGranted && (
        <div
          onClick={requestPermission}
          style={{
            position: 'absolute', top: 0, left: 0,
            width: '100vw', height: '100vh',
            background: 'white', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            fontSize: '24px', fontWeight: 'bold', color: 'black'
          }}
        >
          Tap to Start
        </div>
      )}
    </div>
  );
}
