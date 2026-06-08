import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/colors';

interface MenuItem {
  label: string;
  onPress: () => void;
}

interface SideMenuProps {
  visible: boolean;
  title: string;
  subtitle: string;
  items: MenuItem[];
  onClose: () => void;
}

const MENU_WIDTH = 320;

export default function SideMenu({
  visible,
  title,
  subtitle,
  items,
  onClose,
}: SideMenuProps) {
  const [mounted, setMounted] = useState(visible);
  const translateX = useRef(new Animated.Value(-MENU_WIDTH)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(translateX, {
        toValue: 0,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(translateX, {
      toValue: -MENU_WIDTH,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setMounted(false);
      }
    });
  }, [translateX, visible]);

  if (!mounted) {
    return null;
  }

  return (
    <Modal visible={mounted} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.menu, { transform: [{ translateX }] }]}> 
          <View style={styles.headerRow}>
            <Pressable style={styles.toggleButton} onPress={onClose}>
              <Text style={styles.toggleButtonText}>☰</Text>
            </Pressable>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.divider} />

          {items.map((item) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
              onPress={() => {
                onClose();
                item.onPress();
              }}
            >
              <Text style={styles.itemText}>{item.label}</Text>
              <Text style={styles.itemChevron}>›</Text>
            </Pressable>
          ))}

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Fechar menu</Text>
          </Pressable>
        </Animated.View>

        <Pressable style={styles.backdrop} onPress={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  menu: {
    width: MENU_WIDTH,
    maxWidth: '86%',
    backgroundColor: colors.surface,
    paddingTop: 26,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
  },
  backdrop: {
    flex: 1,
  },
  headerRow: {
    marginBottom: 18,
  },
  toggleButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonText: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: '900',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primary,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textLight,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 18,
  },
  item: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemPressed: {
    opacity: 0.88,
    backgroundColor: '#FDEEEE',
  },
  itemText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  itemChevron: {
    fontSize: 20,
    color: colors.primary,
  },
  closeButton: {
    marginTop: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
});
