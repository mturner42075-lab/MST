import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LibraryScreen } from '../screens/library';
import { ComicDetailScreen } from '../screens/comic-detail';
import { ComicFormScreen } from '../screens/comic-form';
import { ScannerScreen } from '../screens/scanner';
import { SettingsScreen } from '../screens/settings';
import { Ionicons } from './icons';

export type RootStackParamList = {
  Tabs: undefined;
  ComicDetail: { id: string };
  ComicForm: { id?: string; barcode?: string };
  Scanner: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4c6ef5',
        tabBarInactiveTintColor: '#868e96',
        tabBarStyle: {
          borderTopColor: '#dee2e6',
        },
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#212529',
        headerShadowVisible: false,
      }}
    >
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          title: 'Library',
          tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Scan"
        component={ScannerScreen}
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size }) => <Ionicons name="barcode" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#212529',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="ComicDetail" component={ComicDetailScreen} options={{ title: 'Comic Details' }} />
      <Stack.Screen name="ComicForm" component={ComicFormScreen} options={{ title: 'Comic' }} />
      <Stack.Screen name="Scanner" component={ScannerScreen} options={{ title: 'Scan Barcode' }} />
    </Stack.Navigator>
  );
}
