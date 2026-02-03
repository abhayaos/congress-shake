import { useEffect, useState } from "react";
import "./leaves.css";

export default function TreeExperience() {
  const [leaves, setLeaves] = useState([]);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!enabled) return;

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
  }, [enabled]);

  const spawnLeaves = () => {
    const batch = Array.from({ length: 20 }).map((_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 100,
      size: 20 + Math.random() * 25,
      rotate: Math.random() * 360,
      duration: 2 + Math.random() * 2,
    }));

    setLeaves((prev) => [...prev, ...batch]);

    // auto cleanup
    setTimeout(() => {
      setLeaves((prev) => prev.slice(batch.length));
    }, 4000);
  };

  const playSound = () => {
    const audio = document.getElementById("leafSound");
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
  };

  const enableExperience = async () => {
    if (
      typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function"
    ) {
      await DeviceMotionEvent.requestPermission();
    }
    setEnabled(true);
  };

  return (
    <div className="scene">
      {!enabled && (
        <button className="start-btn" onClick={enableExperience}>
          Start Experience 🌳
        </button>
      )}

      <img src="/tree.svg" className="tree" />

      {leaves.map((leaf) => (
        <img
          key={leaf.id}
          src="/leaf.png"
          className="leaf"
          style={{
            left: `${leaf.left}%`,
            width: leaf.size,
            animationDuration: `${leaf.duration}s`,
            transform: `rotate(${leaf.rotate}deg)`,
          }}
        />
      ))}

      <audio id="leafSound" src="/leaves.mp3" preload="auto" />
    </div>
  );
}
