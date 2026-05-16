import { MenuItem, CartItem, ChatResponse } from "../types";

// Backend URL. Use ngrok tunnel for physical-device testing when LAN isn't usable.
// Swap back to your Mac's LAN IP (e.g. http://192.168.50.216:3000) once on the same network.
const BASE_URL = "https://climatic-screen-swizzle.ngrok-free.dev";

// ngrok-free serves an HTML interstitial unless this header is present.
const NGROK_HEADERS = { "ngrok-skip-browser-warning": "true" };

export async function fetchMenu(): Promise<MenuItem[]> {
  const res = await fetch(`${BASE_URL}/api/menu`, { headers: NGROK_HEADERS });
  if (!res.ok) throw new Error("Failed to fetch menu");
  return res.json();
}

export async function sendChatMessage(
  message: string,
  cartItems: CartItem[],
  conversationHistory: { role: "user" | "assistant"; content: string }[]
): Promise<ChatResponse> {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...NGROK_HEADERS },
    body: JSON.stringify({ message, cartItems, conversationHistory }),
  });
  if (!res.ok) throw new Error("Chat request failed");
  return res.json();
}
