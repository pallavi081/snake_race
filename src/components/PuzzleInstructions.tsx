import React from 'react';

const PuzzleInstructions = () => {
  return (
    <div>
      <h3 className="font-bold mb-3 text-white">How to Play Puzzle Mode</h3>
      <ul className="text-sm space-y-1 text-gray-300">
        <li>• The goal is to eat all the food in a limited number of moves.</li>
        <li>• Use the arrow keys or swipe to move the snake.</li>
        <li>• Avoid hitting walls, obstacles, or yourself.</li>
        <li>• Plan your moves carefully to solve the puzzle.</li>
      </ul>
    </div>
  );
};

export default PuzzleInstructions;
