export type DietaryTag = "vegetarian" | "vegan" | "gluten-free";
export type Category = "starters" | "mains" | "desserts" | "beverages";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  emoji: string;
  popular: boolean;
  dietary: DietaryTag[];
  spicyLevel: 0 | 1 | 2 | 3;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
}

export type CartActionType = "ADD_ITEM" | "REMOVE_ITEM" | "UPDATE_QUANTITY" | "CLEAR_CART";

export interface CartAction {
  type: CartActionType;
  itemId?: string;
  itemName?: string;
  quantity?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  message: string;
  actions: CartAction[];
}
