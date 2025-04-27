import { Tabs } from "expo-router";
import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
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
          backgroundColor: focused
            ? "white"
            : Platform.OS === "ios"
            ? "black"
            : "#1f1f1f",
        },
      ]}
    >
      <Text
        style={[
          styles.labelText,
          {
            color: focused ? "black" : "white",
          },
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
    fontSize: Platform.OS === "ios" ? 16 : 13,
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
            backgroundColor: Platform.OS === "ios" ? "black" : "#1f1f1f",
            borderRadius: 25,
            paddingVertical: 50,
            boxSizing: "border-box",
            marginVertical: 10,
            marginHorizontal: 10,
          },
          tabBarIconStyle: { display: "none" },
          tabBarLabel: (props) => <CustomTabLabel {...props} label="Midweek" />,
          tabBarItemStyle: {
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: Platform.OS === "ios" ? "black" : "#1f1f1f",
            borderRadius: 25,
          },
        }}
      />
      <Tabs.Screen
        name="weekend"
        options={{
          title: "Weekend",
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Platform.OS === "ios" ? "black" : "#1f1f1f",
            borderRadius: 25,
            padding: 0,
            boxSizing: "border-box",
            marginVertical: 10,
            marginHorizontal: 10,
          },
          tabBarIconStyle: { display: "none" },
          tabBarLabel: (props) => <CustomTabLabel {...props} label="Weekend" />,
          tabBarItemStyle: {
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: Platform.OS === "ios" ? "black" : "#1f1f1f",
            borderRadius: 25,
          },
        }}
      />
    </Tabs>
  );
}
