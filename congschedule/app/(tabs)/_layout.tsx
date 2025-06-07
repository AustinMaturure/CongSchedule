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
    paddingVertical: 20,
   paddingHorizontal:10,
    boxSizing: "border-box",
    marginBottom: 15,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  labelText: {
    fontWeight: "bold",
    fontSize: Platform.OS === "ios" ? 16 : 13,
    borderRadius: 25,
    height:20,
    paddingHorizontal: 40,
   
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
            borderRadius: 30,
          marginBottom:20,
          marginHorizontal:15,
            boxSizing: "border-box",
            display:"flex",
            flexDirection:"column",
            justifyContent:"center",
            alignItems:"center",
            height:60
         
         
          },
          tabBarIconStyle: { display: "none" },
          tabBarLabel: (props) => <CustomTabLabel {...props} label="Midweek" />,
          
        }}
      />
      <Tabs.Screen
        name="weekend"
        options={{
          title: "Weekend",
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Platform.OS === "ios" ? "black" : "#1f1f1f",
            borderRadius: 30,
          marginBottom:20,
          marginHorizontal:15,
            boxSizing: "border-box",
            display:"flex",
            flexDirection:"column",
            justifyContent:"center",
            alignItems:"center",
            height:60
         
         
          },
          tabBarIconStyle: { display: "none" },
          tabBarLabel: (props) => <CustomTabLabel {...props} label="Weekend" />,
          
        }}
      />
    </Tabs>
  );
}
