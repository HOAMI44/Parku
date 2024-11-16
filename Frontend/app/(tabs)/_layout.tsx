import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuth } from '../../contexts/AuthContext';

export default function TabLayout() {
  const { session } = useAuth();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          headerTitle: undefined,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <Ionicons name="home-outline" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            headerTitle: "Map", // Set the title to "Map"
            tabBarIcon: ({ color }) => (
              <Ionicons name="search-outline" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: "Notifications",
            tabBarIcon: ({ color }) => (
              <Ionicons name="notifications-outline" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="CreateSpot"
          options={{
            title: "Create",
            tabBarIcon: ({ color }) => (
              <Ionicons name="add-circle-outline" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <Ionicons name="person-outline" size={22} color={color} />
            ),
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}
