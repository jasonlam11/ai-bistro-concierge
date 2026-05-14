# The Intelligent Bistro

A high-fidelity mobile restaurant experience with an AI concierge (Jules) that manages your order through natural conversation — powered by Claude Sonnet.

## Architecture

```
intelligent-bistro/
├── backend/          Node.js + Express + Anthropic SDK
└── frontend/         React Native (Expo SDK 52) + Zustand
```

## Quick Start

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
npm run dev
```

Server runs at `http://localhost:3000`.

### 2. Frontend

```bash
cd frontend
npm install
npx expo start
```

- Press `i` for iOS Simulator, `a` for Android Emulator
- For a **physical device**, update `BASE_URL` in `src/services/api.ts` to your machine's local IP (e.g. `http://192.168.1.100:3000`)

## Features

| Feature | Details |
|---|---|
| Menu browsing | Grid view with category filters (Starters, Mains, Desserts, Drinks) |
| Cart management | Add / remove / adjust quantities via UI tap or AI voice |
| AI chat | Natural language ordering via Jules, your bistro AI concierge |
| Structured actions | Claude returns JSON `actions[]` that are applied directly to the Zustand cart |
| Haptic feedback | Tactile response on add-to-cart, checkout, and AI-driven cart changes |
| Dark mode | Premium dark UI with warm gold accents |

## Example AI commands

- *"Add two wagyu burgers and a red wine"*
- *"I'm vegetarian — what do you recommend?"*
- *"Change my salmon order to two"*
- *"Remove the lava cake"*
- *"What pairs well with the ribeye?"*
- *"Clear my cart and start over"*

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/menu` | Full menu (optional `?category=` filter) |
| `GET` | `/api/menu/:id` | Single item by ID |
| `POST` | `/api/chat` | Process natural language, returns `message` + `actions[]` |
| `GET` | `/health` | Health check |

### Chat request body

```json
{
  "message": "Add two wagyu burgers",
  "cartItems": [],
  "conversationHistory": []
}
```

### Chat response

```json
{
  "message": "Excellent choice! I've added 2 Wagyu Beef Burgers to your cart. Would you like anything else?",
  "actions": [
    { "type": "ADD_ITEM", "itemId": "wagyu-burger", "itemName": "Wagyu Beef Burger", "quantity": 2 }
  ]
}
```

## Tech Stack

- **Frontend**: React Native, Expo SDK 52, React Navigation v7, Zustand v5, Expo Haptics, Expo Blur, Expo Linear Gradient, React Native Reanimated
- **Backend**: Node.js, Express, `@anthropic-ai/sdk`, Claude Sonnet 4.6
- **AI**: Claude `claude-sonnet-4-6` with structured JSON output for cart actions
