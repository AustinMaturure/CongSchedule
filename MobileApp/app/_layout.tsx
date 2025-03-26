import { Stack } from "expo-router";
import "./globals.css";

import { Provider } from "react-redux";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
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
