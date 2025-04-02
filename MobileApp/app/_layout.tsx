import { Stack } from "expo-router";
import "./globals.css";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="accounts"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="upcoming"
        options={{ headerShown: false, presentation: "modal" }}
      />
    </Stack>
  );
}
