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
import { COLORS, RADIUS, SPACING } from "../constants/theme";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Good evening! I'm Jules, your personal bistro concierge. 🍽️\n\nI can help you explore our menu, answer questions about dishes, or add items to your cart — just ask naturally. For example:\n\n• \"What do you recommend for starters?\"\n• \"Add two ribeyes and a red wine\"\n• \"I'd like to try something vegetarian\"\n• \"Remove the scallops from my cart\"",
  timestamp: new Date(),
};

const QUICK_PROMPTS = [
  "What's popular tonight?",
  "I'm vegetarian — any suggestions?",
  "Add the wagyu burger",
  "What pairs well with salmon?",
  "Clear my cart",
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>J</Text>
          <View style={styles.onlineDot} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>Jules</Text>
          <Text style={styles.headerStatus}>Your AI bistro concierge</Text>
        </View>
        {cartItems.length > 0 && (
          <Animated.View entering={FadeInDown} style={styles.cartChip}>
            <Ionicons name="bag" size={14} color={COLORS.gold} />
            <Text style={styles.cartChipText}>
              {cartItems.reduce((s, i) => s + i.quantity, 0)} items
            </Text>
          </Animated.View>
        )}
        <Pressable
          onPress={() => Keyboard.dismiss()}
          style={({ pressed }) => [styles.dismissBtn, pressed && { opacity: 0.6 }]}
          hitSlop={8}
        >
          <Ionicons name="chevron-down" size={20} color={COLORS.textMuted} />
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
          <View style={styles.typingAvatar}>
            <Text style={styles.typingAvatarText}>J</Text>
          </View>
          <View style={styles.typingBubble}>
            <ActivityIndicator size="small" color={COLORS.gold} />
            <Text style={styles.typingText}>Jules is typing…</Text>
          </View>
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
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  headerAvatarText: {
    color: COLORS.bg,
    fontSize: 18,
    fontWeight: "700",
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.bg,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },
  headerStatus: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  cartChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.gold + "22",
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.gold + "44",
  },
  dismissBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cartChipText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: "600",
  },
  messageList: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  typingAvatar: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  typingAvatarText: {
    color: COLORS.bg,
    fontSize: 14,
    fontWeight: "700",
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typingText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  quickPromptsContainer: {
    marginBottom: SPACING.sm,
  },
  quickPromptsScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  quickPrompt: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickPromptPressed: {
    opacity: 0.7,
  },
  quickPromptText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  inputGradient: {
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 4,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.surfaceElevated,
  },
  sendBtnPressed: {
    opacity: 0.85,
  },
});
