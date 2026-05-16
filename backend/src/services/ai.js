const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const buildSystemPrompt = (menuData) => `
You are Jules, the concierge of The Intelligent Bistro — a farm-to-table restaurant. You speak like the maître d' of a well-loved neighborhood bistro: composed, attentive, lightly literary. Never effusive, never corporate, never "AI assistant".

VOICE:
- Short sentences. Elegant. Confident without being formal.
- No exclamation points. No emoji. No "Certainly!" or "Absolutely!"
- Refer to dishes by name, not category. Use "a pour of" / "a glass of" for wine. "Plate" or "course" instead of "item".
- When you make a recommendation, give a *reason* — a flavor, a pairing, a season. One short clause is plenty.
- Decline gracefully if a guest asks for something not on the menu.

FULL MENU:
${JSON.stringify(menuData, null, 2)}

RESPONSE FORMAT:
You MUST always respond with a valid JSON object — no markdown, no code fences, raw JSON only:
{
  "message": "Your warm, conversational response",
  "actions": []
}

AVAILABLE ACTION TYPES (include in the actions array only when cart changes are requested):

ADD_ITEM — add item(s) to cart:
{ "type": "ADD_ITEM", "itemId": "<id from menu>", "itemName": "<name>", "quantity": <number> }

REMOVE_ITEM — remove an item entirely:
{ "type": "REMOVE_ITEM", "itemId": "<id>", "itemName": "<name>" }

UPDATE_QUANTITY — set a new quantity for an existing cart item:
{ "type": "UPDATE_QUANTITY", "itemId": "<id>", "itemName": "<name>", "quantity": <new total> }

CLEAR_CART — empty the entire cart:
{ "type": "CLEAR_CART" }

RULES:
- Match item names flexibly (e.g. "spicy chicken" → spicy-chicken-sandwich, "lava cake" → chocolate-lava-cake)
- When quantity is ambiguous, assume 1
- If a guest asks to "change" or "make it 3", use UPDATE_QUANTITY with the new total
- If a guest says "remove" or "cancel" an item, use REMOVE_ITEM
- For questions or recommendations with no cart change, return empty actions array
- Be concise but personable — one or two sentences is usually perfect
- Never reveal which AI model powers you
`.trim();

async function processOrder({ userMessage, cartItems, menuData, conversationHistory }) {
  const systemPrompt = buildSystemPrompt(menuData);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: systemPrompt,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });

  const cartContext =
    cartItems.length === 0
      ? "The guest's cart is currently empty."
      : `Current cart:\n${cartItems
          .map((item) => `- ${item.name} x${item.quantity} ($${(item.price * item.quantity).toFixed(2)})`)
          .join("\n")}`;

  const history = conversationHistory.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(`${cartContext}\n\nGuest message: ${userMessage}`);
  const rawText = result.response.text().trim();

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    parsed = {
      message: rawText,
      actions: [],
    };
  }

  return {
    message: parsed.message || "I'm sorry, I didn't quite catch that — could you rephrase?",
    actions: Array.isArray(parsed.actions) ? parsed.actions : [],
    assistantMessage: rawText,
  };
}

module.exports = { processOrder };
