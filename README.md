# 🐍 Snake Race: Global Battle Royale

A modern, high-performance Snake game built with **React**, **TypeScript**, and **Vite**. Features a high-octane **Battle Royale mode** with real-time P2P multiplayer, RPG-like progression, and an explosive "Nova Blast" mechanic.

## 🚀 Key Features
--

### 🌐 Real-time Multiplayer
- **Global Arena**: Use **"Quick Play"** to join global public rooms instantly.
- **P2P Networking**: Powered by **PeerJS** for low-latency peer-to-peer gameplay.
- **Private Rooms**: Create custom lobbies and share invite links with friends.

### 🔥 Nova Mode (Boom Blaster)
- **Rage Meter**: Fill your Nova meter by eating food and getting kills.
- **Nova Blast**: Once fully charged, press **Space** to trigger a massive shockwave.
- **Golden Gems**: Blasted snakes turn into high-value gems for massive XP gains.

### 🎮 Game Modes
1.  **Battle Royale:** Multiplayer arena with smart bots and real players.
2.  **Classic Mode:** The timeless survival experience.
3.  **Boss Battles:** 🐉 Defeat unique kings with specialized abilities.
4.  **Zombie Survival:** 🧟 Survive waves of undead snakes.
5.  **Puzzle & Physics:** Move-limited challenges and platformer mechanics.
6.  **Creative Mode:** 🏗️ Built-in Level Editor to design and share maps.

### 🏆 Economy & Auth
- **Google Sign-In**: Securely save your coins, level, and stats to the cloud.
- **Shop & Creator**: Unlock premium skins or design your own pattern.
- **Daily Rewards**: Building streaks and completing 3 daily quests.
- **Leaderboard**: Global real-time rankings powered by Firebase.

## 🛠️ Tech Stack
-   **Core:** React 18, TypeScript, Vite
-   **Multiplayer:** PeerJS (WebRTC)
-   **Backend:** Firebase Firestore (Cloud Sync & Global Rooms)
-   **Graphics:** HTML5 Canvas API
-   **Audio:** Web Audio API (Synthesized SFX)
-   **Styling:** Tailwind CSS + Lucide Icons

## 📦 Installation & Setup
1.  **Clone the Repository**
    ```bash
    git clone https://github.com/pallavi081/snake_race.git
    cd snake_race
    ```
2.  **Install Dependencies**
    ```bash
    npm install
    ```
3.  **Environment Setup**
    Create a `.env` file with your Firebase and PeerJS configurations:
    ```env
    VITE_FIREBASE_API_KEY=your_key
    VITE_FIREBASE_AUTH_DOMAIN=your_domain
    VITE_FIREBASE_PROJECT_ID=your_id
    VITE_FIREBASE_STORAGE_BUCKET=your_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
    VITE_FIREBASE_APP_ID=your_id
    ```
4.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 🎮 Controls
| Action | Desktop | Mobile |
| :--- | :--- | :--- |
| **Move** | Arrow Keys / WASD | Swipe |
| **Boost** | Hold Left Shift | Hold Screen |
| **Nova Blast** | Spacebar | Tap Nova Button |
| **Pause** | ESC | Menu Icon |

## 👤 Credits
Developed by **Pallavi Kumari** - [GitHub Profile](https://github.com/pallavi081)
