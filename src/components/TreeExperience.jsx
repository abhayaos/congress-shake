import { useEffect, useState, useRef } from "react";
import "../leaves.css";


export default function TreeExperience() {
  const [leaves, setLeaves] = useState([]);
  const [grabbedLeaf, setGrabbedLeaf] = useState(null);
  const sceneRef = useRef(null);
  const lastShakeTime = useRef(0);
  const shakeCooldown = 150; // faster response

  useEffect(() => {
    const handleMotion = (e) => {
      const now = Date.now();
      if (now - lastShakeTime.current < shakeCooldown) return;

      const acc = e.accelerationIncludingGravity;
      if (!acc) return;

      const strength = Math.abs(acc.x || 0) + Math.abs(acc.y || 0) + Math.abs(acc.z || 0);

      if (strength > 15) {
        lastShakeTime.current = now;
        // Spawn more leaves if stronger shake
        const multiplier = Math.min(Math.floor(strength / 5), 5);
        spawnLeaves(multiplier);
        playSound();
      }
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, []);

  const spawnLeaves = (countMultiplier = 1) => {
    const batchSize = (window.innerWidth < 768 ? 8 : 12) * countMultiplier;
    const batch = Array.from({ length: batchSize }).map((_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 100,
      size: 15 + Math.random() * 20,
      rotate: Math.random() * 360,
      tilt: -45 + Math.random() * 90,
      duration: 0.8 + Math.random() * 0.7, // faster fall
      fallDelay: Math.random() * 0.2,
    }));

    setLeaves((prev) => {
      const maxLeaves = window.innerWidth < 768 ? 50 : 80;
      const newLeaves = [...prev, ...batch];
      return newLeaves.length > maxLeaves
        ? newLeaves.slice(newLeaves.length - maxLeaves)
        : newLeaves;
    });

    setTimeout(() => {
      setLeaves((prev) => prev.slice(batch.length));
    }, 2500);
  };

  const playSound = () => {
    if (typeof window !== "undefined" && !window.soundPlaying) {
      window.soundPlaying = true;
      const audio = new Audio("/leaves.mp3");
      audio.volume = 0.2;
      audio.play().catch(() => {});
      setTimeout(() => (window.soundPlaying = false), 200);
    }
  };

  const handleLeafGrab = (e, leafId) => {
    e.preventDefault();
    setGrabbedLeaf(leafId);
  };

  const handleLeafRelease = () => setGrabbedLeaf(null);

  const handleLeafMove = (e) => {
    if (!grabbedLeaf) return;

    if (!window.moveTimeout) {
      window.moveTimeout = setTimeout(() => {
        const sceneRect = sceneRef.current.getBoundingClientRect();
        const x =
          ((e.touches?.[0].clientX || e.clientX) - sceneRect.left) /
          sceneRect.width *
          100;
        const y =
          ((e.touches?.[0].clientY || e.clientY) - sceneRect.top) /
          sceneRect.height *
          100;

        setLeaves((prev) =>
          prev.map((leaf) =>
            leaf.id === grabbedLeaf
              ? {
                  ...leaf,
                  left: Math.max(0, Math.min(100, x)),
                  top: Math.max(0, Math.min(100, y)),
                }
              : leaf
          )
        );
        window.moveTimeout = null;
      }, 16);
    }
  };

  return (
    <div
      className="scene"
      ref={sceneRef}
      onMouseMove={handleLeafMove}
      onTouchMove={handleLeafMove}
      onMouseUp={handleLeafRelease}
      onTouchEnd={handleLeafRelease}
    >
      <img src="/tree.svg" className="tree" />
      {leaves.map((leaf) => (
        <img
          key={leaf.id}
          src="/leaf.png"
          className={`leaf ${grabbedLeaf === leaf.id ? "grabbing" : ""}`}
          style={{
            left: `${leaf.left}%`,
            top: leaf.top ? `${leaf.top}%` : "unset",
            width: leaf.size,
            animationDuration: `${leaf.duration}s`,
            animationDelay: `${leaf.fallDelay}s`,
            transform: `rotate(${leaf.rotate}deg) rotateZ(${leaf.tilt}deg)`,
          }}
          onMouseDown={(e) => handleLeafGrab(e, leaf.id)}
          onTouchStart={(e) => handleLeafGrab(e, leaf.id)}
        />
      ))}
    </div>
  );
}
