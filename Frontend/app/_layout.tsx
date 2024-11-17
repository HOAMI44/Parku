import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="Login" options={{ title: "Login" }} />
        <Stack.Screen name="SignUpDetail" />
        <Stack.Screen name="SignUp" options={{ title: "Sign Up" }} />
        <Stack.Screen name="Verify" />
        <Stack.Screen name="ParkingDetails" options={{ title: "Details" }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
