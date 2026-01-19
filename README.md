# Responsive Retro Snake Game

A classic snake game built with a modern tech stack, featuring power-ups, a scoring system, and a responsive design for both desktop and mobile devices. Now with PWA support!

## Features

- **Game Modes:** Choose between three different game modes:
    - **Classic Mode:** The timeless snake game experience.
    - **Puzzle Mode:** Solve challenging puzzles by eating all the food within a limited number of moves. Includes an **Undo** feature.
    - **Physics Mode:** A unique challenge with gravity, platforms, jumping mechanics, and physics-based movement.
- **Progressive Web App (PWA):** Install the game on your device for offline play and a native app-like experience.
- **Classic Snake Gameplay:** Enjoy the timeless fun of the snake game with **Pause** functionality.
- **Power-ups:** Spice up the game with exciting power-ups like speed boost, slow motion, double points, and shrink.
- **Scoring System:** Compete for the high score with a combo and level-based scoring system.
- **Difficulty Levels:** Choose between Easy, Medium, and Hard difficulty levels.
- **Sound Effects & Haptics:** Immersive sound effects and haptic feedback (vibration) on supported devices.
- **Dark Mode:** Switch between light and dark themes for a comfortable viewing experience.
- **Responsive Design:** Fully responsive layout for all screen sizes, with a special focus on mobile experience. The game canvas and controls adapt to the screen size for optimal gameplay.
- **Customizable Colors:** Change the colors of the food and the snake in the settings menu.
- **How to Play:** A handy guide to get you started with the game rules and controls.
- **Back Button:** Easily navigate back to the game mode selection screen from any game mode.
- **Extensive Levels:** Over 50 levels available in Puzzle and Physics modes.

## Technologies Used

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/your_username_/project_repo.git
   ```
2. Navigate to the project directory
    ```sh
    cd snake_race-main
    ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Run the development server
    ```sh
    npm run dev
    ```

## Deployment

This project can be easily deployed to [Vercel](https://vercel.com/).

1. Sign up for a [Vercel](https://vercel.com/) account.
2. Install the Vercel CLI.
    ```sh
    npm install -g vercel
    ```
3. From the project root, run the `vercel` command.
    ```sh
    vercel
    ```
4. Follow the on-screen instructions to link your project to Vercel and deploy it.

## Developer

- **Pallavi** - [https://github.com/pallavi081](https://github.com/pallavi081)

## Future Enhancements

Here are some ideas for future features that could be added to the game:

- **Leaderboard:** Implement a leaderboard to store and display high scores.
- **Different Game Modes:**
    - **Wall-less mode:** The snake can go through the walls and appear on the opposite side.
    - **Obstacle mode:** Add obstacles on the map that the snake has to avoid.
    - **Time attack mode:** See how many points the player can get in a limited time.
- **Snake Skins:** Allow the player to choose different skins or colors for their snake.
- **Achievements:** Add achievements for reaching certain milestones (e.g., reaching a certain score, playing for a certain amount of time).
- **More Power-ups:**
    - **Invincibility:** The snake is invincible for a short period of time.
    - **Food magnet:** The food is drawn towards the snake.
    - **Portal:** Creates two portals on the map that the snake can go through.
- **Multiplayer:** A real-time multiplayer mode where two players can compete against each other.
