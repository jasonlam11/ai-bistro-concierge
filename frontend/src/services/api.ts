import { MenuItem, CartItem, ChatResponse } from "../types";

// For physical device testing, replace with your machine's local IP
// e.g. "http://192.168.1.100:3000"
const BASE_URL = "http://localhost:3000";

export async function fetchMenu(): Promise<MenuItem[]> {
  const res = await fetch(`${BASE_URL}/api/menu`);
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, cartItems, conversationHistory }),
  });
  if (!res.ok) throw new Error("Chat request failed");
  return res.json();
}
