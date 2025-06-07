import {
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { registerIndieID } from 'native-notify';
import { useState } from "react";
import { useNavigation } from '@react-navigation/native';
import { AuthProvider, useAuth } from './context/authContext';
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { userInfo } from "./interfaces";
export default function Upcoming() {
  
  const { user } = useAuth();

  const [action, setAction] = useState<"login" | "signup">("login");
  const [status, setStatus] = useState<string>("Login");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<userInfo>({
    first_name: "",
    last_name: "",
    password: "",
  });

  const navigation = useNavigation();

  const saveData = async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving data", error);
    }
  };

  const registerDevice = async (user: { first_name: string; last_name: string }) => {
    if (!Device.isDevice) {
      console.log("❌ Must use physical device for push notifications");
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("❌ Notification permission not granted.");
      return;
    }}

  const handleSubmit = async () => {
    setStatus("Loading...");
    setError(null);
  
    try {
      const response = await axios.post(
        `https://congschedules.pythonanywhere.com/accounts/api/${action}/`,
        userInfo
      );
  
      const data = response.data;
  
      await saveData("first_name", data.user.first_name);
      await saveData("last_name", data.user.last_name);
      await saveData("access_token", data.access_token);
  
      login({
        first_name: data.user.first_name,
        last_name: data.user.last_name,
        access_token: data.access_token
      });
  
      
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;
      console.log("✅ Expo Push Token:", token);

      const res = await axios.post(
        "https://congschedules.pythonanywhere.com/schedular/api/adddevice/",
        {
          username: `${data.user.first_name} ${data.user.last_name}`,
          fcm_token: token,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("📲 Device registered:", res.data);
    } catch (err) {
      console.error("❌ Failed to register device:", err);
    }

  
      setStatus(action === "signup" ? "Account Created" : "Login Successful");
      setMessage(
        action === "signup"
          ? `Account created... Hi, ${data.user.first_name}`
          : `Welcome Back, ${data.user.first_name}`
      );
  
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          if (err.response.status === 400) {
            setStatus("Create Account");
            setError("Missing or invalid data (password must be at least 8 letters and a number)");
          } else if (err.response.status === 401) {
            setStatus("Login");
            setError("Your username or password is incorrect");
          } else if (err.response.status === 409) {
            setStatus("Create Account");
            setError("A user with those details already exists");
          } else {
            setStatus("Error: " + err.response.status);
          }
        } else {
          setStatus("Server did not respond");
        }
      } else {
        setStatus("Unknown error");
        setError("Something went wrong");
        console.error("❌ Non-Axios error:", err);
      }
    }
    
  };

  const handleInputChange = (field: keyof userInfo, value: string) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));
  };
  

  const { login } = useAuth();

  return (
   
    <View className="items-center h-screen gap-6 p-6 justify-center">
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <ScrollView>
          <View className="flex-col justify-between gap-6 mt-6">
            
            <Text className="text-5xl font-bold mt-0"><Text className="text-5xl font-bold text-lightblue mb-0">Create</Text> an Account</Text>
            <Text className="p-2">
              Creating an account allows you to see your upcoming parts, have
              your parts highlighted in the schedule, get notified when a new
              schedule is up and get reminded of your parts.
            </Text>

            <View className="flex-col gap-4">
              <TextInput
                className="text-2xl border-2 rounded-md border-primary p-2"
                placeholder="Name"
                onChangeText={(text) => handleInputChange("first_name", text)}
              />
              <TextInput
                className="text-2xl border-2 rounded-md border-primary p-2"
                placeholder="Surname"
                onChangeText={(text) => handleInputChange("last_name", text)}
              />
              <TextInput
                className="text-2xl border-2 rounded-md border-primary p-2"
                placeholder="Password"
                secureTextEntry
                onChangeText={(text) => handleInputChange("password", text)}
              />

              <TouchableOpacity
                activeOpacity={0.64}
                onPress={handleSubmit}
                className="bg-primary p-5 rounded-lg"
              >
                <Text className="text-white text-center text-lg">{status}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="p-5 rounded-lg "
                activeOpacity={0.64}
                onPress={() => {
                  setAction(action === "signup" ? "login" : "signup");
                  setStatus(action === "signup" ? "Log In" : "Create Account");
                  console.log(action)
                }}
              >
               <Text className="text-primary text-center text-lg">
  {action === "signup" ? (
    <>
      Already have an account?{' '}
      <Text className="text-blue-600 font-semibold">Log In</Text>
    </>
  ) : (
    <>
      Don't have an account?{' '}
      <Text className="text-blue-600 font-semibold">Sign Up</Text>
    </>
  )}
</Text>

              </TouchableOpacity>

              {error && (
                <Text className="text-red-500 text-center mt-4">{error}</Text>
              )}
              {message && (
                <Text className="text-green-900 text-center mt-3">{message}</Text>
              )}
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </View>
 
  );
}
