import React from 'react';
import {
  View,
  Text,
  UIManager,
  Platform,
  StyleSheet,
} from 'react-native';
import { nameToColor, extractInitials } from '../../data/sync/syncService';

interface AvatarViewProps {
  name: string;
  size?: number;
  style?: object;
}

function AvatarViewFallback({ name, size = 44 }: AvatarViewProps): React.JSX.Element {
  const initials = extractInitials(name);
  const backgroundColor = nameToColor(name);
  const fontSize = size * 0.38;

  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor },
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
    </View>
  );
}

// Verifica si el módulo nativo existe antes de intentar usarlo
const isNativeAvailable =
  Platform.OS !== 'web' &&
  UIManager.getViewManagerConfig != null &&
  (() => {
    try {
      return UIManager.getViewManagerConfig('AvatarView') != null;
    } catch {
      return false;
    }
  })();

let NativeAvatarView: React.ComponentType<AvatarViewProps> | null = null;
if (isNativeAvailable) {
  const { requireNativeComponent } = require('react-native');
  NativeAvatarView = requireNativeComponent<AvatarViewProps>(
    'AvatarView',
  ) as unknown as React.ComponentType<AvatarViewProps>;
}

export function AvatarView({ name, size = 44 }: AvatarViewProps): React.JSX.Element {
  if (NativeAvatarView !== null) {
    return (
      <NativeAvatarView
        name={name}
        size={size}
        style={{ width: size, height: size }}
      />
    );
  }
  return <AvatarViewFallback name={name} size={size} />;
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
    includeFontPadding: false,
  },
});