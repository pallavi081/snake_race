import React from 'react';

const PhysicsInstructions = () => {
  return (
    <div>
      <h3 className="font-bold mb-3 text-white">How to Play Physics Mode</h3>
      <ul className="text-sm space-y-1 text-gray-300">
        <li>• Gravity is active! Don't fall off the screen.</li>
        <li>• Use Left/Right arrows to move horizontally.</li>
        <li>• Press SPACE or UP Arrow to JUMP.</li>
        <li>• Land on platforms and eat all food to win.</li>
      </ul>
    </div>
  );
};

export default PhysicsInstructions;
