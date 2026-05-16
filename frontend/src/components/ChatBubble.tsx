import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { ChatMessage } from "../types";
import { COLORS, SPACING, FONT_FAMILY } from "../constants/theme";

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
      {!isUser && <Text style={styles.byline}>Jules ·</Text>}
      <View style={isUser ? styles.userBlock : styles.assistantBlock}>
        <Text style={isUser ? styles.userText : styles.assistantText}>
          {message.content}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.lg,
  },
  wrapperUser: {
    alignItems: "flex-end",
    paddingLeft: SPACING.xxl,
  },
  wrapperAssistant: {
    alignItems: "flex-start",
    paddingRight: SPACING.xxl,
  },
  byline: {
    color: COLORS.gold,
    fontFamily: FONT_FAMILY.serif,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  assistantBlock: {
    paddingLeft: SPACING.sm,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.gold,
  },
  assistantText: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.serif,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  userBlock: {
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.hairline,
  },
  userText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
});
