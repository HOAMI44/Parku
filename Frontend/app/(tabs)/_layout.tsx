import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { createTamagui, TamaguiProvider } from "tamagui";
import defaultConfig from "@tamagui/config/v3";

const config = createTamagui(defaultConfig);

export default function TabLayout() {
  return (
    <TamaguiProvider config={config}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
          }}
          sceneContainerStyle={{ marginTop: 35 }}
        >
          <Tabs.Screen
            name="Home"
            options={{
              title: "Home",
              tabBarIcon: ({ color }) => (
                <Ionicons name="home-outline" size={22} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="Explore"
            options={{
              headerTitle: "Map", // Set the title to "Map"
              tabBarIcon: ({ color }) => (
                <Ionicons name="search-outline" size={22} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="BookingHistory"
            options={{
              title: "Bookings",
              tabBarIcon: ({ color }) => (
                <Ionicons name="calendar-outline" size={22} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="CreateSpace"
            options={{
              title: "Create",
              tabBarIcon: ({ color }) => (
                <Ionicons name="add-circle-outline" size={22} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="Profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color }) => (
                <Ionicons name="person-outline" size={22} color={color} />
              ),
            }}
          />
        </Tabs>
      </GestureHandlerRootView>
    </TamaguiProvider>
  );
}
