import { useEffect, useState, useRef } from "react";
import "../leaves.css";

export default function TreeExperience() {
  const [leaves, setLeaves] = useState([]);
  const [grabbedLeaf, setGrabbedLeaf] = useState(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    const handleMotion = (e) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;

      const strength =
        Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);

      if (strength > 28) {
        spawnLeaves();
        playSound();
      }
    };

    window.addEventListener("devicemotion", handleMotion);
    return () =>
      window.removeEventListener("devicemotion", handleMotion);
  }, []);

  const spawnLeaves = () => {
    const batch = Array.from({ length: 15 }).map((_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 100,
      size: 20 + Math.random() * 25,
      rotate: Math.random() * 360,
      duration: 1.5 + Math.random() * 1.5,
      fallDelay: Math.random() * 0.5,
    }));

    setLeaves((prev) => [...prev, ...batch]);

    // Faster cleanup to reduce hanging
    setTimeout(() => {
      setLeaves((prev) => prev.slice(batch.length));
    }, 2500);
  };

  const playSound = () => {
    const audio = new Audio("/leaves.mp3");
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const handleLeafGrab = (e, leafId) => {
    e.preventDefault();
    setGrabbedLeaf(leafId);
  };

  const handleLeafRelease = () => {
    setGrabbedLeaf(null);
  };

  const handleLeafMove = (e) => {
    if (!grabbedLeaf) return;
    
    const sceneRect = sceneRef.current.getBoundingClientRect();
    const x = ((e.touches?.[0].clientX || e.clientX) - sceneRect.left) / sceneRect.width * 100;
    const y = ((e.touches?.[0].clientY || e.clientY) - sceneRect.top) / sceneRect.height * 100;
    
    setLeaves(prev => prev.map(leaf => 
      leaf.id === grabbedLeaf 
        ? { ...leaf, left: Math.max(0, Math.min(100, x)), top: Math.max(0, Math.min(100, y)) }
        : leaf
    ));
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
          className={`leaf ${grabbedLeaf === leaf.id ? 'grabbing' : ''}`}
          style={{
            left: `${leaf.left}%`,
            top: leaf.top ? `${leaf.top}%` : 'unset',
            width: leaf.size,
            animationDuration: `${leaf.duration}s`,
            animationDelay: `${leaf.fallDelay}s`,
            transform: `rotate(${leaf.rotate}deg)`,
            pointerEvents: 'auto',
            position: leaf.top ? 'absolute' : 'fixed',
          }}
          onMouseDown={(e) => handleLeafGrab(e, leaf.id)}
          onTouchStart={(e) => handleLeafGrab(e, leaf.id)}
        />
      ))}
    </div>
  );
}