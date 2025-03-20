import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Button,
  Image,
  Pressable,
  TextInput,
  TouchableOpacity,
} from "react-native";

import axios from "axios";
import { useEffect, useState } from "react";

export default function Upcoming() {
  return (
    <>
      <View className="items-center h-screen  gap-6 p-6">
        <View className="">
          <View className="flex-col justify-between gap-6 mt-6">
            <View>
              <Text className="text-5xl font-bold text-lightblue">Create</Text>
              <Text className="text-5xl font-bold"> an Account</Text>

              <Text className="p-2">
                Creating an allows you to see your upcoming parts and get
                notified when a new Schedule is up.
              </Text>
            </View>

            <View className=" flex-col   gap-4">
              <View className="gap-2">
                <TextInput
                  className="text-2xl border-hairline rounded-md border-primary p-2"
                  placeholder="Name"
                ></TextInput>

                <TextInput
                  className="text-2xl border-hairline rounded-md border-primary p-2"
                  placeholder="Surname"
                ></TextInput>

                <TextInput
                  className="text-2xl border-hairline rounded-md border-primary p-2"
                  secureTextEntry={true}
                  placeholder="Password"
                ></TextInput>
              </View>
              <View className="gap-2 mt-3">
                <TouchableOpacity
                  activeOpacity={0.64}
                  className="bg-lightblue p-5 rounded-lg"
                >
                  <Text className="text-white text-center ">Sign Up</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="p-5 rounded-lg border-2 border-lightblue"
                  activeOpacity={0.64}
                >
                  <Text className="text-lightblue  text-center">Log In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}
