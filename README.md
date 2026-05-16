# The Intelligent Bistro

A high-fidelity mobile restaurant experience built around an AI concierge named **Jules**, who manages your order through natural conversation. The app is designed to look and feel like a real bistro — printed-menu typography, tableside check, a serif voice for the host — not another delivery template.

Powered by Google Gemini for the natural-language work and React Native (Expo) for the mobile experience.

---

## Architecture

```
intelligent-bistro/
├── backend/        Node.js + Express + Google Gemini
│   └── src/
│       ├── index.js            Server, helmet, rate limiting, payload caps
│       ├── routes/
│       │   ├── menu.js         GET /api/menu, /api/menu/:id, /api/menu/categories
│       │   └── chat.js         POST /api/chat — validated, sanitized, rate-limited
│       ├── services/
│       │   └── ai.js           Gemini system prompt + structured JSON output
│       └── data/menu.js        24 items across 4 categories
│
└── frontend/       React Native (Expo SDK 54) + Zustand
    └── src/
        ├── screens/
        │   ├── MenuScreen.tsx    Editorial section-list with serif typography
        │   ├── ChatScreen.tsx    Conversation with Jules
        │   └── CartScreen.tsx    Tableside-check layout
        ├── components/           MenuCard (row), CartItemCard (line), ChatBubble (quote)
        ├── store/cartStore.ts    Zustand store — same source of truth for UI + AI
        ├── services/api.ts       fetchMenu(), sendChatMessage()
        └── constants/theme.ts    Warm walnut/cream palette, Georgia serif
```

---

## Quick Start

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Open .env and paste your GEMINI_API_KEY
# Get one free at https://aistudio.google.com/apikey
npm run dev
```

Server runs at `http://localhost:3000`. The server refuses to start without `GEMINI_API_KEY` in the environment.

### 2. Frontend

```bash
cd frontend
npm install
npx expo start
```

- Press `i` for iOS Simulator or `a` for an Android Emulator.
- For a **physical device**, update `BASE_URL` in `src/services/api.ts` to your Mac's LAN IP (e.g. `http://192.168.1.100:3000`), or run `npx ngrok http 3000` and use the tunnel URL.

> **Node 20 LTS required.** Expo SDK 54 doesn't run on Node 24 because the experimental TypeScript stripping conflicts with Expo's `.ts` config plugins.

---

## Features

| | |
|---|---|
| **Editorial menu** | Section-list with serif type, hairline leaders to the price, ornamental dividers — designed to feel like a printed bistro menu, not a card grid |
| **Conversational ordering** | Talk to Jules in plain English: *"Add two wagyu burgers and a red wine"* and the cart updates in real time |
| **Same source of truth** | UI taps and AI actions both flow through one `applyActions` function on a single Zustand store — no divergence between input paths |
| **Tableside check** | Cart is rendered as a restaurant check with line items, dot leaders, and a serif total |
| **Haptics** | Tactile feedback on add-to-cart, AI-driven cart changes, and checkout |
| **Hardened backend** | Helmet headers, rate limiting, input sanitization, payload caps |

---

## Conversational examples

Jules understands variations on each of these:

- *"Add two wagyu burgers and a glass of red wine"* — multiple items in one shot
- *"Make it three burgers"* — quantity update on an existing item (not a re-add)
- *"What do you recommend for vegetarians?"* — recommendations with no cart change
- *"What pairs with the ribeye?"* — pairings
- *"Remove the lava cake"* — remove a specific item
- *"Clear the table"* — empty the cart
- *"Add a margarita"* — gracefully declines items not on the menu

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET`  | `/api/menu`              | Full menu (optional `?category=` filter) |
| `GET`  | `/api/menu/:id`          | Single item by ID |
| `GET`  | `/api/menu/categories`   | List of category keys |
| `POST` | `/api/chat`              | Natural-language input → `{ message, actions[] }` |
| `GET`  | `/health`                | Health check |

### Chat request body

```json
{
  "message": "Add two wagyu burgers and a red wine",
  "cartItems": [],
  "conversationHistory": []
}
```

### Chat response

```json
{
  "message": "Two Wagyu Beef Burgers and a pour of our House Red Wine, certainly.",
  "actions": [
    { "type": "ADD_ITEM", "itemId": "wagyu-burger",   "itemName": "Wagyu Beef Burger", "quantity": 2 },
    { "type": "ADD_ITEM", "itemId": "house-wine-red", "itemName": "House Red Wine",    "quantity": 1 }
  ]
}
```

### Supported action types

| Type | Fields | Meaning |
|---|---|---|
| `ADD_ITEM`        | `itemId`, `itemName`, `quantity`     | Add new item or increment quantity |
| `REMOVE_ITEM`     | `itemId`, `itemName`                 | Remove the item entirely |
| `UPDATE_QUANTITY` | `itemId`, `itemName`, `quantity`     | Set a new total quantity |
| `CLEAR_CART`      | —                                     | Empty the entire cart |

---

## Design decisions and tradeoffs

| Decision | Why |
|---|---|
| **Editorial list, not card grid** | Most AI-generated apps look identical (dark mode + gold accent + 2-col grid + glass blur). An editorial restaurant-menu layout makes this feel like a real bistro. |
| **Structured JSON output, not function calling** | Gemini returns `{ message, actions[] }` as raw JSON. Simpler to test, model-agnostic, and the action vocabulary is small enough that frontend validation in `applyActions` covers it. Trades a bit of schema robustness for simplicity. |
| **One Zustand store, two input paths** | The same `addItem` / `updateQuantity` / `removeItem` mutations are called whether you tap "+" on the menu or tell Jules to add something. Single source of truth, no drift. |
| **AI calls server-side only** | The frontend never talks to Gemini directly. All requests go through the Node backend, which holds the API key and enforces rate limits. |
| **Gemini, not Claude or GPT** | Free tier for the take-home. The system prompt is model-agnostic, so swapping providers is a one-line change. |
| **Zustand, not Redux or Context** | Minimal boilerplate for a feature this small. The action-based mutation pattern still applies. |

---

## Security

| Concern | Mitigation |
|---|---|
| API key exposure | `.env` is gitignored and never enters version control. Server refuses to boot without `GEMINI_API_KEY`. |
| Direct client → Gemini calls | All AI requests routed through the backend. Frontend never sees the API key. |
| Rate-limit abuse / cost drain | `express-rate-limit` caps `/api/chat` at 12 requests/min per IP and general traffic at 60/min. |
| Oversized payloads | `express.json({ limit: "32kb" })` rejects bloated bodies at parse time. |
| Bad input shape | Strict validators on `message` (1–500 chars), `conversationHistory` (max 20 turns × 2KB), and `cartItems` (max 50 items with bounded price/qty). |
| Control-character injection | User messages are stripped of control bytes (`\x00`–`\x1F` except `\t`/`\n`, plus `\x7F`) before going to Gemini. |
| Bad AI output mutating cart | `applyActions` on the frontend only mutates the store if the action's `itemId` matches a real menu item — unknown items are silently dropped. |
| Security response headers | `helmet()` adds HSTS, X-Frame-Options, X-Content-Type-Options, and friends. |
| Stack traces leaking to clients | All errors return generic `{ error: "..." }` — full details only on the server log. |

---

## Tech Stack

- **Frontend**: React Native, Expo SDK 54, React Navigation v7, Zustand v5, React Native Reanimated 4, Expo Haptics, Expo Linear Gradient
- **Backend**: Node.js, Express, `@google/generative-ai`, `helmet`, `express-rate-limit`
- **AI**: Google Gemini (`gemini-2.5-flash`) with structured JSON output for cart actions
- **Type**: Georgia (iOS) / serif (Android) for the editorial layer; system sans-serif for body text

---

## Built with

This project was pair-programmed end-to-end with **[Claude Code](https://claude.com/claude-code)** as the AI coding agent — backend, frontend redesign, security hardening, and all of the polish iterations.
