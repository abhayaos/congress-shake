import { useEffect, useState, useRef } from "react";
import "../leaves.css";


export default function TreeExperience() {
  const [leaves, setLeaves] = useState([]);
  const [grabbedLeaf, setGrabbedLeaf] = useState(null);
  const [treeShake, setTreeShake] = useState(0);
  const sceneRef = useRef(null);
  const lastShakeTime = useRef(0);
  const shakeCooldown = 150;

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
        // Add tree shake effect
        setTreeShake(strength);
        setTimeout(() => setTreeShake(0), 300);
      }
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, []);

  const spawnLeaves = (countMultiplier = 1) => {
    const batchSize = (window.innerWidth < 768 ? 8 : 12) * countMultiplier;
    const batch = Array.from({ length: batchSize }).map((_, i) => ({
      id: Date.now() + i,
      left: 35 + Math.random() * 30, // Start from tree area
      top: -10 - Math.random() * 20, // Start above viewport
      size: 15 + Math.random() * 20,
      rotate: Math.random() * 360,
      tilt: -45 + Math.random() * 90,
      duration: 2 + Math.random() * 1.5, // Proper fall duration
      fallDelay: Math.random() * 0.3,
      gravity: 0.5 + Math.random() * 0.3, // Gravity factor
      sway: -2 + Math.random() * 4, // Horizontal sway
    }));

    setLeaves((prev) => {
      const maxLeaves = window.innerWidth < 768 ? 50 : 80;
      const newLeaves = [...prev, ...batch];
      return newLeaves.length > maxLeaves
        ? newLeaves.slice(newLeaves.length - maxLeaves)
        : newLeaves;
    });
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
      <img 
        src="/tree.svg" 
        className={`tree ${treeShake ? 'shaking' : ''}`}
        style={{
          transform: treeShake ? `rotate(${(Math.random() - 0.5) * (treeShake / 5)}deg)` : 'none',
          transition: treeShake ? 'transform 0.1s ease' : 'transform 0.3s ease'
        }}
      />
      {leaves.map((leaf) => (
        <img
          key={leaf.id}
          src="/leaf.png"
          className={`leaf ${grabbedLeaf === leaf.id ? "grabbing" : ""}`}
          style={{
            left: `${leaf.left + (leaf.sway || 0)}%`,
            top: leaf.top ? `${leaf.top}%` : "-15%",
            width: leaf.size,
            animationDuration: `${leaf.duration}s`,
            animationDelay: `${leaf.fallDelay}s`,
            transform: `rotate(${leaf.rotate}deg) rotateZ(${leaf.tilt}deg)`
          }}
          onMouseDown={(e) => handleLeafGrab(e, leaf.id)}
          onTouchStart={(e) => handleLeafGrab(e, leaf.id)}
        />
      ))}
    </div>
  );
}
