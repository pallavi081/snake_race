# Responsive Retro & Battle Royale Snake Game

A modern, feature-rich Snake game built with React, TypeScript, and Vite. It combines classic gameplay with a high-octane **Battle Royale mode**, RPG-like progression, and a full economic system.

## 🚀 Key Features

### 🎮 Game Modes
1.  **Classic Mode:** The timeless experience. Eat food, grow, and avoid walls.
2.  **Battle Royale:** Enter a massive persistent arena with smart bots.
    *   **Combat:** Cut off other snakes to kill them.
    *   **Progression:** Collect XP orbs to level up and increase size.
    *   **Power-Ups:** Shield, Magnet, Speed Boost, and Double XP.
3.  **Puzzle Mode:** specialized challenges with move limits and undo functionality.
4.  **Physics Mode:** Gravity, jumping, and platforms platformer-style mechanics.

### 🏆 Progression & Economy
*   **Global Leaderboard:** Track high scores across all modes locally.
*   **Shop System:** Earn coins to unlock **9 Unique Skins** and **6 Visual Themes**.
*   **Daily Challenges:** 3 new quests every day (e.g., "Get 5 kills") to earn rewards and keep a streak.
*   **Achievements:** Over 50 unlockable achievements with toast notifications.
*   **Player Stats:** Comprehensive tracking of kills, win rate, total score, and play time.

### 📱 Mobile Experience
*   **PWA Support:** Installable as a native app on iOS and Android.
*   **Touch Controls:** Optimized swipe gestures for smooth movement.
*   **Responsive UI:** all menus, modals, and game canvases scale perfectly to phone screens.

## 🛠️ Technologies Used
-   **Frontend:** React 18, TypeScript, Vite
-   **Styling:** Tailwind CSS, Lucide React (Icons)
-   **State/Storage:** LocalStorage (Persistence), Custom Hooks
-   **Audio:** Web Audio API (Synthesized sound effects)

## 📦 Installation
1.  **Clone the repo**
    ```sh
    git clone https://github.com/your_username_/project_repo.git
    cd snake_race-main
    ```
2.  **Install dependencies**
    ```sh
    npm install
    # Also install dev dependencies if needed
    npm install -D vite @vitejs/plugin-react tailwindcss autoprefixer postcss
    ```
3.  **Run Development Server**
    ```sh
    npm run dev
    ```

## 🎮 How to Play

### Controls
| Action | Desktop | Mobile |
| :--- | :--- | :--- |
| **Move** | Arrow Keys / WASD | Swipe |
| **Boost** | Spacebar (Hold) | Double Tap (Hold) |
| **Pause** | 'P' or ESC | Menu Button |

### Battle Tips
*   **Kill:** Boost in front of an opponent's head to make them crash into your body.
*   **Survive:** Use Shields to protect yourself in crowded areas.
*   **Grow:** Magnet power-ups are the fastest way to gather XP orbs.

## 🔮 Future Roadmap
- [ ] Online Multiplayer (WebSocket server)
- [ ] Account Cloud Sync
- [ ] Team Battle Mode

## 👤 Developer
-   **Pallavi** - [https://github.com/pallavi081](https://github.com/pallavi081)
