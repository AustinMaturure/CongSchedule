import { Tabs } from "expo-router";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useState } from "react";
import "../globals.css";

interface CustomTabLabelProps {
  focused: boolean;
  label: string;
}

const CustomTabLabel: React.FC<CustomTabLabelProps> = ({ focused, label }) => {
  return (
    <View
      style={[
        styles.labelContainer,
        {
          backgroundColor: focused ? "white" : "transparent", // Change background color when selected
        },
      ]}
    >
      <Text
        style={[
          styles.labelText,
          { color: focused ? "black" : "white" }, // Change text color when selected
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  labelContainer: {
    paddingVertical: 5,
    paddingHorizontal: 55,
    boxSizing: "border-box",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  labelText: {
    fontWeight: "bold",
    fontSize: 13,
    borderRadius: 25,
  },
});

export default function RootLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Midweek",
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "black", // Tab background color
            borderRadius: 25, // Pill shape
            paddingVertical: 50,

            boxSizing: "border-box",
            gap: 0,

            marginVertical: 10,
            marginHorizontal: 10,
          },
          tabBarIconStyle: { display: "none" },
          tabBarLabel: (props) => <CustomTabLabel {...props} label="Midweek" />, // Use custom label
          tabBarItemStyle: {
            flexDirection: "row", // Center items horizontally
            justifyContent: "center", // Center horizontally
            alignItems: "center", // Center vertically
            // Padding to make the pill shape
            // Padding for pill shape
            backgroundColor: "black", // Set the background color to black for pill shape
            borderRadius: 25, // Pill shape
          },
        }}
      />
      <Tabs.Screen
        name="weekend"
        options={{
          title: "Weekend",
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "black", // Tab background color
            borderRadius: 25, // Pill shape
            padding: 0,
            boxSizing: "border-box",
            marginVertical: 10,
            marginHorizontal: 10,
          },
          tabBarIconStyle: { display: "none" },
          tabBarLabel: (props) => <CustomTabLabel {...props} label="Weekend" />, // Use custom label
          tabBarItemStyle: {
            flexDirection: "row", // Center items horizontally
            justifyContent: "center", // Center horizontally
            alignItems: "center", // Center vertically
            // Padding to make the pill shape
            // Padding for pill shape
            backgroundColor: "black", // Set the background color to black for pill shape
            borderRadius: 25, // Pill shape
          },
        }}
      />
    </Tabs>
  );
}
