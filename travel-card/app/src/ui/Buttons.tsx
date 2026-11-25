import React from 'react';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { colors, MIN_TARGET, radius, spacing, type } from './theme';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Main action: 56 dp high. Otherwise 48 dp. */
  main?: boolean;
}

/** Filled button (primary). Disabled: faded and not tappable, never by colour alone. */
export function FilledButton({ label, onPress, disabled, style, main }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [styles.base, { minHeight: main ? 56 : MIN_TARGET }, styles.filled, pressed && !disabled && styles.filledPressed, disabled && styles.filledDisabled, style]}
    >
      <Text style={[styles.text, { color: disabled ? colors.disabledText : colors.onPrimary }]}>{label}</Text>
    </Pressable>
  );
}

/** Tonal button (secondary). */
export function TonalButton({ label, onPress, disabled, style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [styles.base, { minHeight: MIN_TARGET }, styles.tonal, pressed && styles.tonalPressed, disabled && styles.filledDisabled, style]}
    >
      <Text style={[styles.text, { color: disabled ? colors.disabledText : colors.onPrimaryContainer }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { paddingHorizontal: spacing.xl, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  text: { ...type.label },
  filled: { backgroundColor: colors.primary },
  filledPressed: { backgroundColor: colors.onPrimaryContainer },
  filledDisabled: { backgroundColor: colors.surfaceVariant },
  tonal: { backgroundColor: colors.primaryContainer },
  tonalPressed: { backgroundColor: colors.surfaceVariant },
});
