import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { ChatMessage } from "../types";
import { COLORS, RADIUS, SPACING } from "../constants/theme";

interface ChatBubbleProps {
  message: ChatMessage;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <Animated.View
      entering={FadeInUp.springify().damping(16)}
      style={[styles.wrapper, isUser ? styles.wrapperUser : styles.wrapperAssistant]}
    >
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>J</Text>
        </View>
      )}

      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text style={[styles.text, isUser ? styles.textUser : styles.textAssistant]}>
          {message.content}
        </Text>
        <Text style={[styles.time, isUser ? styles.timeUser : styles.timeAssistant]}>
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  wrapperUser: {
    flexDirection: "row-reverse",
    paddingLeft: 60,
  },
  wrapperAssistant: {
    paddingRight: 60,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    marginBottom: 4,
  },
  avatarText: {
    color: COLORS.bg,
    fontSize: 14,
    fontWeight: "700",
  },
  bubble: {
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    maxWidth: "100%",
    flex: 1,
  },
  bubbleUser: {
    backgroundColor: COLORS.gold,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
  textUser: {
    color: COLORS.bg,
    fontWeight: "500",
  },
  textAssistant: {
    color: COLORS.text,
  },
  time: {
    fontSize: 10,
    marginTop: 4,
  },
  timeUser: {
    color: COLORS.bg + "99",
    textAlign: "right",
  },
  timeAssistant: {
    color: COLORS.textDim,
  },
});
