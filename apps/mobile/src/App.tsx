import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { RepositoryContext } from '@comic-catalog/ui';
import type { IComicRepository } from '@comic-catalog/core';
import { getRepository } from './db';
import { RootNavigator } from './navigation/root-navigator';
import { ActivityIndicator, View } from 'react-native';

export default function App() {
  const [repo, setRepo] = useState<IComicRepository | null>(null);

  useEffect(() => {
    getRepository().then(setRepo);
  }, []);

  if (!repo) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
        <ActivityIndicator size="large" color="#4c6ef5" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <RepositoryContext.Provider value={repo}>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
        <StatusBar style="dark" />
      </RepositoryContext.Provider>
    </SafeAreaProvider>
  );
}
