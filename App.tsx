import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DatabaseProvider } from '@nozbe/watermelondb/DatabaseProvider';
import { database } from './src/data/local/database';
import { AppNavigator } from './src/navigation/AppNavigator';
import { StyleSheet } from 'react-native';

/**
 * Root component.
 * Wraps the whole app with:
 * 1. GestureHandlerRootView — required by React Navigation
 * 2. SafeAreaProvider — for safe area insets
 * 3. DatabaseProvider — makes WatermelonDB available to all screens via withDatabase()
 */
export default function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <DatabaseProvider database={database}>
          <AppNavigator />
        </DatabaseProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
