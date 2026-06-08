import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/colors';

interface DashboardCardProps {
  title: string;
  description: string;
  onPress: () => void;
}

export default function DashboardCard({
  title,
  description,
  onPress,
}: DashboardCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.topRow}>
        <View style={styles.iconBadge}>
          <Text style={styles.iconText}>➜</Text>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Toque para acessar</Text>
        <Text style={styles.arrow}>›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  pressed: {
    backgroundColor: '#FDEEEE',
    borderColor: '#E7B4B4',
    transform: [{ scale: 0.995 }],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FBE9E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: colors.textLight,
    lineHeight: 22,
  },
  footer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  arrow: {
    fontSize: 22,
    color: colors.primary,
    fontWeight: '700',
    marginTop: -2,
  },
});