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
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Upcoming() {
  interface userInfo {
    first_name: String;
    last_name: String;
    password: String;
  }

  const [action, setAction] = useState("login");
  const [loggedin, setLoggedin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>("Create Account");

  const [userInfo, setUserInfo] = useState<userInfo>({
    first_name: "",
    last_name: "",
    password: "",
  });
  const [data, setUser] = useState(null);

  const saveData = async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      console.log("Data saved");
    } catch (error) {
      console.error("Error saving data", error);
    }
  };

  useEffect(() => {
    axios
      .post(`http://192.168.110.250:8000/accounts/api/${action}/`, userInfo)
      .then((response) => {
        setStatus("Loading");
        if (response.status === 400) {
          setLoggedin(false);
          setStatus("Create Account");
        } else {
          setUser(response.data);
          saveData("first_name", response.data.user.first_name);
          saveData("last_name", response.data.user.last_name);
          saveData("access_token", response.data.access_token);
          console.log(response.data);
          setStatus("Account Created");
        }
      })
      .catch((err) => {
        setError(err.message);
        setStatus("Create Account");
      });
  }, [action]);

  const handleInputChange = (field: keyof userInfo, value: string) => {
    setUserInfo((prevInfo) => ({
      ...prevInfo,
      [field]: value,
    }));
  };
  return (
    <>
      <View className="items-center h-screen  gap-6 p-6 justify-center">
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View className="">
            <ScrollView>
              <View className="flex-col justify-between gap-6 mt-6 ">
                <View>
                  <Text className="text-5xl font-bold text-lightblue">
                    Create
                  </Text>
                  <Text className="text-5xl font-bold"> an Account</Text>

                  <Text className="p-2">
                    Creating an allows you to see your upcoming parts and get
                    notified when a new Schedule is up.
                  </Text>
                </View>

                <View className=" flex-col   gap-4">
                  <View className="gap-2">
                    <TextInput
                      className="text-2xl border-2 rounded-md border-primary p-2"
                      placeholder="Name"
                      onChangeText={(text) =>
                        handleInputChange("first_name", text)
                      }
                    ></TextInput>

                    <TextInput
                      className="text-2xl border-2 rounded-md border-primary p-2"
                      placeholder="Surname"
                      onChangeText={(text) =>
                        handleInputChange("last_name", text)
                      }
                    ></TextInput>

                    <TextInput
                      className="text-2xl border-2 rounded-md border-primary p-2"
                      secureTextEntry={true}
                      placeholder="Password"
                      onChangeText={(text) =>
                        handleInputChange("password", text)
                      }
                    ></TextInput>
                  </View>
                  <View className="gap-2 mt-3 ">
                    <TouchableOpacity
                      activeOpacity={0.64}
                      onPress={() => {
                        setAction("signup");
                        setStatus("Loading...");
                      }}
                      className="bg-primary p-5 rounded-lg"
                    >
                      <Text className="text-white text-center text-lg">
                        {status}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="p-5 rounded-lg border-2 border-primary"
                      activeOpacity={0.64}
                      onPress={() => setAction("login")}
                    >
                      <Text className="text-primary  text-center text-lg">
                        Log In
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </>
  );
}
