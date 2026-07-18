import React, { useEffect, useState } from 'react';

export default function AnimatedCounter({ value, prefix = '', suffix = '' }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const cleanVal = value !== undefined && value !== null ? value : 0;
    const end = parseFloat(cleanVal.toString().replace(/[^0-9.]/g, ''));
    if (isNaN(end)) {
      setDisplayValue(cleanVal);
      return;
    }
    if (end === 0) {
      setDisplayValue(0);
      return;
    }

    const duration = 800; // 800ms animation
    const frameRate = 1000 / 60; // 60 fps
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const easeProgress = progress * (2 - progress); // quadratic easing out
      const current = Math.round(end * easeProgress);

      if (frame >= totalFrames) {
        clearInterval(timer);
        setDisplayValue(end);
      } else {
        setDisplayValue(current);
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [value]);

  const formatted = typeof displayValue === 'number' 
    ? displayValue.toLocaleString(undefined, { maximumFractionDigits: 0 }) 
    : displayValue;

  return <span>{prefix}{formatted}{suffix}</span>;
}
