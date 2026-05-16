import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import ChatBubble from "../components/ChatBubble";
import { useCartStore } from "../store/cartStore";
import { sendChatMessage, fetchMenu } from "../services/api";
import { ChatMessage, MenuItem } from "../types";
import { COLORS, RADIUS, SPACING, FONT_FAMILY } from "../constants/theme";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Good evening. I'm Jules — at your service for the menu, for pairings, and for the small art of putting a table together. Tell me what you're in the mood for, and I'll see it done.",
  timestamp: new Date(),
};

const QUICK_PROMPTS = [
  "What's the chef sending out tonight?",
  "Something vegetarian, please",
  "A burger and a red wine",
  "What pairs with the ribeye?",
  "Clear the table",
];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const listRef = useRef<FlatList>(null);
  const { items: cartItems, applyActions } = useCartStore();

  useEffect(() => {
    fetchMenu()
      .then(setMenuItems)
      .catch(() => {});
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const conversationHistoryForAPI = useCallback(() => {
    return messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({ role: m.role, content: m.content }));
  }, [messages]);

  const handleSend = useCallback(
    async (text?: string) => {
      const messageText = (text ?? input).trim();
      if (!messageText || loading) return;

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setInput("");

      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: messageText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);
      scrollToBottom();

      try {
        const response = await sendChatMessage(
          messageText,
          cartItems,
          conversationHistoryForAPI()
        );

        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.message,
          timestamp: new Date(),
        };

        if (response.actions?.length > 0) {
          applyActions(response.actions, menuItems);
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        const errMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please make sure the server is running and try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setLoading(false);
        scrollToBottom();
      }
    },
    [input, loading, cartItems, menuItems, applyActions, conversationHistoryForAPI, scrollToBottom]
  );

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => <ChatBubble message={item} />,
    []
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { paddingTop: insets.top }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {/* Editorial header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.eyebrow}>The Concierge</Text>
          <Text style={styles.headerTitle}>Jules</Text>
          <Text style={styles.headerSub}>
            On duty {cartItems.length > 0
              ? `·  ${cartItems.reduce((s, i) => s + i.quantity, 0)} on the table`
              : "·  awaiting your order"}
          </Text>
        </View>
        <Pressable
          onPress={() => Keyboard.dismiss()}
          style={({ pressed }) => [styles.dismissBtn, pressed && { opacity: 0.6 }]}
          hitSlop={8}
        >
          <Ionicons name="chevron-down" size={18} color={COLORS.textMuted} />
        </Pressable>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(m) => m.id}
        contentContainerStyle={[
          styles.messageList,
          { paddingBottom: SPACING.md },
        ]}
        onContentSizeChange={scrollToBottom}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      />

      {/* Typing indicator */}
      {loading && (
        <Animated.View entering={FadeInDown} style={styles.typingContainer}>
          <ActivityIndicator size="small" color={COLORS.gold} />
          <Text style={styles.typingText}>Jules is composing a reply…</Text>
        </Animated.View>
      )}

      {/* Quick prompts (only when input is empty) */}
      {!input && messages.length <= 2 && (
        <View style={styles.quickPromptsContainer}>
          <FlatList
            horizontal
            data={QUICK_PROMPTS}
            keyExtractor={(p) => p}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickPromptsScroll}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSend(item)}
                style={({ pressed }) => [styles.quickPrompt, pressed && styles.quickPromptPressed]}
              >
                <Text style={styles.quickPromptText}>{item}</Text>
              </Pressable>
            )}
          />
        </View>
      )}

      {/* Input bar */}
      <LinearGradient
        colors={[COLORS.bg + "00", COLORS.bg]}
        style={[styles.inputGradient, { paddingBottom: tabBarHeight + SPACING.sm }]}
      >
        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask Jules anything…"
            placeholderTextColor={COLORS.textDim}
            style={styles.input}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
            blurOnSubmit={false}
          />
          <Pressable
            onPress={() => handleSend()}
            disabled={!input.trim() || loading}
            style={({ pressed }) => [
              styles.sendBtn,
              (!input.trim() || loading) && styles.sendBtnDisabled,
              pressed && styles.sendBtnPressed,
            ]}
          >
            <Ionicons
              name="arrow-up"
              size={20}
              color={!input.trim() || loading ? COLORS.textDim : COLORS.bg}
            />
          </Pressable>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.hairline,
    gap: SPACING.sm,
  },
  headerLeft: {
    flex: 1,
  },
  eyebrow: {
    color: COLORS.textDim,
    fontSize: 10,
    letterSpacing: 3,
    textTransform: "uppercase",
    fontWeight: "600",
    marginBottom: 2,
  },
  headerTitle: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.serif,
    fontSize: 26,
    letterSpacing: 0.3,
  },
  headerSub: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontStyle: "italic",
    marginTop: 2,
    letterSpacing: 0.4,
  },
  dismissBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.hairline,
    alignItems: "center",
    justifyContent: "center",
  },
  messageList: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  typingText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontStyle: "italic",
    letterSpacing: 0.3,
  },
  quickPromptsContainer: {
    marginBottom: SPACING.sm,
  },
  quickPromptsScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  quickPrompt: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.hairline,
  },
  quickPromptPressed: {
    opacity: 0.6,
  },
  quickPromptText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontStyle: "italic",
    letterSpacing: 0.3,
  },
  inputGradient: {
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: SPACING.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.hairline,
    paddingHorizontal: 0,
    paddingTop: SPACING.sm + 2,
    paddingBottom: 4,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 4,
    fontFamily: FONT_FAMILY.serif,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    backgroundColor: "transparent",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.hairline,
  },
  sendBtnPressed: {
    opacity: 0.85,
  },
});
