<img max-width="1200" height="auto" alt="APIT_logico" src="https://github.com/user-attachments/assets/a7220e15-7b22-40de-88c0-279debe87814" />

# 🐾 Point-and-Click Adventure Frontend

A Paws in Time is a narrative-driven point-and-click adventure where players must navigate a world frozen
in a temporal glitch to rescue their kidnapped feline companion. Players must infiltrate a mad scientist's
mansion to disrupt a machine designed to halt history forever. Shifting between the Past and Present,
players interact with a dynamic 2D environment, collect puzzle items, and trigger story events handled by
the API game engine.

This repository contains the React SPA frontend for the project. It connects to the Laravel API,
renders the rooms as draggable SVG environments, sends player actions to the backend, and reflects the
saved game state returned by the server.

# 🛠 Technologies

- **Framework:** React 19
- **Bundler:** Vite 8
- **Routing:** React Router 7
- **HTTP Client:** Axios
- **Styling:** Tailwind CSS 4 + custom retro CSS
- **Game UI:** SVG room rendering, draggable scenes, responsive HUD layout
- **Authentication:** Bearer token flow connected to the API

## 🗂️ Project Structure

**`src/api`**  
Axios configuration and API communication.  
The frontend uses a running backend and sends all gameplay interactions to the API instead of resolving logic locally.


**`src/context`**  
Authentication state, protected routes, and user session persistence.

**`src/pages`**  
Contains the main screens of the application:
- `Auth` for login / register
- `GameLobby` for save-slot management
- `GameRoom` for active gameplay
- `Profile` for account management
- `AdminDashboard` and `AdminUserDetail` for admin tools

**`src/components`**  
Shared and page-specific interface pieces such as:
- `Navbar`
- retro UI elements like `PixelBox`, `PixelButton`, and `PixelInput`
- game-specific controls like `PlayRoom`, `PocketItems`, `ActionVerbMenu`, and `GameRoomMenu`


**`public/assets`**  
Static assets used by the SPA:
- logos and UI images
- room SVGs & room-linked item images
- inventory icons
- music tracks

# 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm
- A running A Paws in Time API backend

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/clara-cdp/APIT-frontend.git
```

```bash
cd APIT-frontend
```

#### 2. Install dependencies

```bash
npm install
```

#### 3. Configure the environment

Create a `.env` file in the project root and add:

```properties
VITE_API_BASE_URL=http://localhost:8000/api
```

> Adjust the URL if your backend is running on a different host or port.

#### 4. Start the frontend

```bash
npm run dev
```

The app will usually be available at:

```text
http://localhost:5173
```

### Production build

```bash
npm run build
```

```bash
npm run preview
```

## Backend Dependency

This frontend is designed to work together with the Laravel API 
> [https://github.com/clara-cdp/A-Paws-In-Time-API]


The API is responsible for:
- authentication
- game-saving / persistence
- game progress
- room transitions
- inventory updates
- items visibility
- puzzle interaction rules



---
## Author
Clara Cerda de Palou

## Acknowledgments
Barcelona Activa Fullstack PHP Bootcamp (2025/2026)
