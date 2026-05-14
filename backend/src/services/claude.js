const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const buildSystemPrompt = (menuData) => `
You are Jules, the AI concierge for The Intelligent Bistro — an upscale farm-to-table restaurant known for exceptional cuisine and warm service.

Your role is to help guests browse the menu and manage their orders through natural conversation. Be warm, knowledgeable, and occasionally offer thoughtful pairings or recommendations.

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
- Never reveal that you are Claude or built on any specific AI model
`.trim();

async function processOrder({ userMessage, cartItems, menuData, conversationHistory }) {
  const systemPrompt = buildSystemPrompt(menuData);

  const cartContext =
    cartItems.length === 0
      ? "The guest's cart is currently empty."
      : `Current cart:\n${cartItems
          .map((item) => `- ${item.name} x${item.quantity} ($${(item.price * item.quantity).toFixed(2)})`)
          .join("\n")}`;

  const messages = [
    ...conversationHistory,
    {
      role: "user",
      content: `${cartContext}\n\nGuest message: ${userMessage}`,
    },
  ];

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const rawText = response.content[0].text.trim();

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
