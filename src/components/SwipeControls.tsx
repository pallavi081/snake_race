import React, { useRef } from 'react';
import { Direction } from '../types/game';

interface SwipeControlsProps {
  onSwipe: (direction: Direction) => void;
  children: React.ReactNode;
}

const SwipeControls: React.FC<SwipeControlsProps> = ({ onSwipe, children }) => {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const dx = touchEndX - touchStartX.current;
    const dy = touchEndY - touchStartY.current;

    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swipe
      if (dx > 0) {
        onSwipe('RIGHT');
      } else {
        onSwipe('LEFT');
      }
    } else {
      // Vertical swipe
      if (dy > 0) {
        onSwipe('DOWN');
      } else {
        onSwipe('UP');
      }
    }
  };

  return (
    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {children}
    </div>
  );
};

export default SwipeControls;
