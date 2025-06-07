import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Button,
  StatusBar,
  Image,
  Pressable,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Link } from "expo-router";
import axios from "axios";
import { useEffect, useState, useRef  } from "react";
import * as Device from 'expo-device';
import RenderDuties from "../duties";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from 'expo-notifications';

import { setISODay } from "date-fns";
import NetInfo from '@react-native-community/netinfo';
import { AuthProvider } from '../context/authContext';
import { useAuth } from "../context/authContext";
import { ScheduleSkel } from "../interfaces";

 Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  
export default function Index() {

  const { user } = useAuth();
  const [data, setData] = useState<ScheduleSkel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [end, setEnd] = useState<boolean | false>(false);
  const [loading, setLoading] = useState<boolean | true>(true);
  const [next, setNext] = useState<number | 0>(7);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [savedSchedule, setSavedSchedule] = useState<ScheduleSkel | null>(null);
  const [modified, setModified] = useState<boolean | false>(false);
  const [first_name, setFirstName] = useState<string | "">("");
  const [last_name, setLastName] = useState<string | "">("");
  const [userlocal, setUserLocal] = useState<string | "">("");
  const [refreshing, setRefreshing] = useState(false);


  const [currentWeekIndexDate, setCurrentDate] = useState<Date>(new Date());

  const getData = async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        return JSON.parse(value);
      }
      return null;
    } catch (error) {
      console.error("Error retrieving data...", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const userlocal = await getData("user");
      const token = await getData("access_token");
      const first_name = await getData("first_name");
      const last_name = await getData("last_name");
      setAccessToken(token ?? user?.access_token);
      setFirstName( first_name?? user?.first_name);
      setLastName( last_name ??user?.last_name);
      setUserLocal(userlocal)
    };

    fetchData();
  }, []);

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
   
    const registerForPushNotifications = async () => {
      if (!Device.isDevice) {
        alert('Push notifications only work on physical devices.');
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Notification permission not granted.');
        return;
      }

      try {
        const tokenData = await Notifications.getExpoPushTokenAsync();
        const token = tokenData.data;

        console.log('✅ Expo Push Token:', token);
        console.log(user?.first_name)
        


        const response = await axios.post(
          'https://congschedules.pythonanywhere.com/schedular/api/adddevice/',
          {
            username: user
  ? `${user.first_name} ${user.last_name}`
  : first_name && last_name
    ? `${first_name} ${last_name}` 
    : null ,

            fcm_token: token,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
        console.log('📲 Device registered:', response.data);
      } catch (err) {
        console.error('❌ Failed to register device:', err);
      }
    };

    registerForPushNotifications();

    // Foreground listener
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification Received:', notification);
    });

    // Tap response listener
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('🧭 Notification tapped:', response);
    });

    return () => {
      notificationListener.current && Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current && Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [user, first_name, last_name]);
  


  const formattedDate = currentWeekIndexDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });




  

  useEffect(() => { 
   
   
    const fetchData = async () => {
     
      NetInfo.fetch().then((state) => {
        if (state.isConnected) {
          console.log('connected')
          axios
            .get("https://congschedules.pythonanywhere.com/schedular/api/getmodified")
            .then((response) => {
              if (response.data.is_modified) {
                setModified(true);
                console.log(modified)
              }
              else{
                setModified(false);
                
              }
            })
            .catch((error) => {
              console.error("Error checking modification:", error);
              console.log("No internet connection, skipping modified check.");
            });
        } else {
          console.log("No internet connection, skipping modified check.");
        }
      });
      console.log(modified)
      setLoading(true);
      setNext(7);
      const currentDateStr = currentWeekIndexDate.toLocaleString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }); 
      if (!modified){
      try {
        console.log("Checking local storage before API call...");
        const storedData = await AsyncStorage.getItem(`savedSchedule${currentDateStr}`);
        const parsedData = storedData ? JSON.parse(storedData) : null;
        
  
        if (parsedData) {
          console.log("Loaded from local storage");
          setData(parsedData);
         
          setEnd(false);
          setRefreshing(false)
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Error reading from local storage", err);
      }}
 
      try {
        const response = await axios.get(
          `https://congschedules.pythonanywhere.com/schedular/api/getschedule/${currentDateStr}`
        );
  
        if (response.status === 200) {
          setData(response.data);
          AsyncStorage.setItem(`savedSchedule${currentDateStr}`, JSON.stringify(response.data));
          setEnd(false);
          console.log(data?.Duties)
        } else {
          setEnd(true);
        }
      } catch (err: any) {
        console.error("API error", err);
        setError(err.message || "Failed to fetch data.");
        if (err.response?.status === 404) {
          setEnd(true);
        }
      }
  
      setLoading(false);
      setRefreshing(false)
    };
  
    fetchData();
  }, [currentWeekIndexDate, refreshing]);
  


  const onRefresh = async () => {
    setRefreshing(true);
    setCurrentDate(currentWeekIndexDate)
  };
  

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekIndexDate);
    newDate.setDate(currentWeekIndexDate.getDate() + next);
    setCurrentDate(newDate);
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekIndexDate);
    newDate.setDate(currentWeekIndexDate.getDate() - next);
    setCurrentDate(newDate);
  };
  if (!data || end) {
    return (
        
      <SafeAreaView
        className={` ${Platform.OS == "ios" ? "p-6" : "p-3"}h-vh bg-zinc-800`}
      >
        <StatusBar barStyle="light-content" backgroundColor="#1f1f1f" />
        {data ? (
          <View className=" bg-primary">
            <View className="flex-row justify-center gap-6 items-center text-center p-6">
              <TouchableOpacity
                onPress={goToPreviousWeek}
                
                activeOpacity={end ? 0.6 : 0.9}
              >
                <Image
                  source={require("../../assets/images/next-svgrepo-com (5).png")}
                  className="w-9 h-9 object-cover"
                />
              </TouchableOpacity>
              <View>
                <Text style={styles.dateText} className="text-white">
                  {data?.Schedule?.date}
                </Text>
              </View>
              <Pressable onPress={goToNextWeek} disabled={end} style={{ opacity: end ? 0.5 : 1 }}
              >
                <Image
                  source={require("../../assets/images/next-svgrepo-com (4).png")}
                  className="w-9 h-9 object-cover"
                />
              </Pressable>
            </View>
            <Link
              className="p-2"
              href={user ? "../upcoming" : "../accounts"}
              asChild
            >
              <Pressable>
                <View className="bg-lightblue rounded-3xl p-3 mb-2">
                  <Text className="font-bold text-2xl text-center color-lightwhite">
                    Your Schedule
                  </Text>
                  {user ? (
                    <Text className="text-center color-white">
                      Hi,{" "}
                      <Text className="text-decoration-line">
                        {user.first_name}...
                      </Text>
                      View your schedule.
                    </Text>
                  ) : (
                    <Text className="text-center color-white">
                      Sign In to view your upcoming parts
                    </Text>
                  )}
                </View>
              </Pressable>
            </Link>
          </View>
        ) : (
          <View className="w-svw h-vh gap-4 p-4 pb-5 ">
            <View className="h-12 p-6 bg-neutral-300 rounded-lg"></View>
            <View className="bg-neutral-300 rounded-3xl p-3 mb-2">
              <Text className="font-bold text-2xl text-center color-neutral-300">
                Your Schedule
              </Text>
              <Text className="text-center text-neutral-300">
                Hi,{" "}
                <Text className="text-decoration-line text-neutral-300">
                  xxxxx...
                </Text>
                View your schedule.
              </Text>
            </View>
          </View>
        )}

        <View className="w-svw h-vh gap-4 pt-8 px-6 rounded-t-3xl bg-lightwhite">
          <View className="p-6 rounded-lg h-5/6 box-border bg-neutral-300 align-middle items-center justify-center">
            {end ? (
              <Text>The schedule is not available for this date</Text>
            ) : (
              <ActivityIndicator size="large" color="#1f1f1f" />
            )}
          </View>
        </View>
      </SafeAreaView>
   
    );
  }

  const removeNumbers = (str: string) => {
    return str.replace(/[0-9]/g, "");
  };



  const removeParenteshis = (str: string) => {
    let clean = str.replace("(", "");
    clean = clean.replace(")", "");

    return clean;
  };

  return (
    
    <SafeAreaView className="gap-4 bg-zinc-800">
      <StatusBar barStyle="light-content" backgroundColor="#27272a" />
      <ScrollView className="flex-col gap-4 bg-zinc-800"   refreshControl={
        <RefreshControl  colors={['#27272a']} tintColor="white" refreshing={refreshing} onRefresh={onRefresh} />
      }>
        <View className="flex-row justify-center gap-6 items-center text-center p-6">
          <TouchableOpacity
            onPress={goToPreviousWeek}
            activeOpacity={next == 0 ? 0.6 : 0.9}
          >
            <Image
              source={require("../../assets/images/next-svgrepo-com (5).png")}
              className="w-9 h-9 object-cover"
            />
          </TouchableOpacity>
          <View>
            <Text style={styles.dateText} className="text-white">
              {data?.Schedule?.date}
            </Text>
          </View>
          <Pressable onPress={goToNextWeek}>
            <Image
              source={require("../../assets/images/next-svgrepo-com (4).png")}
              className="w-9 h-9 object-cover"
            />
          </Pressable>
        </View>

        {/* Your Schedule Link Section */}
        <View className="p-2">
          <Link href={user ? "./upcoming" : "./accounts"} asChild>
            <Pressable>
              <View className="bg-lightblue rounded-3xl p-3 mb-2">
                <Text className="font-bold text-2xl text-center color-lightwhite">
                  Your Schedule
                </Text>
                {user ? (
                  <Text className="text-center color-white">
                    Hi,{" "}
                    <Text className="text-decoration-line">
                      {user.first_name}...
                    </Text>
                    View your schedule.
                  </Text>
                ) : (
                  <Text className="text-center color-white">
                    Sign In to view your upcoming parts
                  </Text>
                )}
              </View>
            </Pressable>
          </Link>
        </View>
        {loading ? (
          <View className="flex-col justify-center rounded-t-3xl bg-lightwhite h-96  p-6 box-border items-center">
            <View className=" ">
              <ActivityIndicator size="large" color="#1f1f1f" />
            </View>
          </View>
        ) : (
          <View className="rounded-t-3xl bg-lightwhite box-border p-6 z-10 gap-6 rounded-2xl">
            <View className="gap-2">
              <View className="p-5 back-g rounded-xl flex-col">
                <Text className="font-bold mb-3">
                  {data?.Opening?.opening_song}
                </Text>
                <View className="flex-row items-center">
                  <Text className={`font-bold text-lg `}>Opening Prayer: </Text>
                  <Text
                    className={` ${
                      data.Opening.opening_prayer
                        .toLowerCase()
                        .includes(user?.first_name?.toLowerCase() ?? first_name)
                        ? "bg-lightblue text-lightwhite p-1 rounded-lg font-bold "
                        : ""
                    }}`}
                  >
                    {data.Opening.opening_prayer}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className={`font-bold text-lg `}>Chairman: </Text>
                  <Text
                    className={` ${
                      data.Opening.chairman
                        .toLowerCase()
                        .includes(user?.first_name?.toLowerCase() ?? first_name)
                        ? "bg-lightblue text-lightwhite rounded-lg font-bold p-1"
                        : ""
                    }`}
                  >
                    {data.Opening.chairman}
                  </Text>
                </View>
              </View>
            </View>

            {/* Treasures Section */}
            <View className="gap-2">
              <Text style={styles.sectionTitle} className="p-2 rounded-xl ">
                Treasures From God's Word
              </Text>
              <View className=" flex-col gap-1 back-g rounded-2xl  border-l-8 border-l-lightblue rounded-tl-none rounded-bl-none">
                {data.Treasures.treasures_talks.map((talk, index) => (
                  <View key={index} className={`${talk.talk_info[0]?.speaker.toLowerCase()
                    .includes(user?.first_name?.toLowerCase() ?? first_name) ? 
              

"bg-blue-200 lgh  ":""} ${index==0 ? "rounded-tr-2xl ":""} ${index === data.Treasures.treasures_talks.length  ? "rounded-br-2xl" : ""}
`}>
  <View className="flex-col justify-between p-4 pb-0 ">
                    <Text className="font-bold text-xl mb-1">
                      {talk.title.trimStart()}
                    </Text>
                    {talk.talk_info.map((info, infoIndex) => (
                      <Text
                        key={infoIndex}
                        className=""
                      >
                        {info.speaker}
                      </Text>
                    ))}
                    </View>

                  
<View className="border-b-hairline mt-6 pl-8 w-[95%] items-center mx-auto"></View>
                  </View>
                 
                ))}
                <View className="flex-col gap-1 p-4 ">
                  <Text className="font-bold text-xl">Bible Reading</Text>
                  <Text
                    className={`${
                      data.Treasures.bible_reading
                        .toLowerCase()
                        .includes(user?.first_name?.toLowerCase() ?? first_name)
                        ? "bg-lightblue text-lightwhite p-2 rounded-lg"
                        : ""
                    }`}
                  >
                    {data.Treasures.bible_reading}
                  </Text>
                </View>
              </View>
            </View>

            {/* Apply Yourself Section */}
            <View style={styles.section} className="gap-2">
              <Text style={styles.sectionTitle}>
                Apply Yourself To the Ministry
              </Text>
              <View className="flex-col gap-4">
                {data["Apply Yourself"].apply_parts.map((part, index) => (
                  <View
                    key={index}
                    className={`flex-col justify-between p-4  rounded-2xl border-l-8 ${
                      part.apply_info[0].student
                        .toLowerCase()
                        .includes(user?.first_name?.toLowerCase() ?? first_name) ? 
                  

"bg-lightyellow":"back-g"} border-l-yellow-500 rounded-tl-none rounded-bl-none`}
                  >
                    <View className="flex-col gap-1 ">
                      <View className="flex-row justify-between">
                        <View>
                          <Text className="font-bold text-xl">
                            {removeNumbers(part.apply_part)}
                          </Text>
                        </View>
                        <View>
                          <Text className="bg-primary font-bold self-start rounded-xl text-lightwhite p-2">
                            {removeParenteshis(part.apply_info[0].duration)}
                          </Text>
                        </View>
                      </View>
                      <View>
                        <Text
                          className={`text-[14px] ml-1 `}
                        >
                          {part.apply_info[0].student}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Living as Christians Section */}
            <View className="gap-2">
              <Text style={styles.sectionTitle}>Living as Christians</Text>
              <View className="flex-col p-4 gap-4 back-g rounded-2xl border-l-8 border-l-red-500 rounded-tl-none rounded-bl-none">
                {/* Living Song */}
                <Text>{data["Living as Christians"].living_song}</Text>

                {/* Living Talks */}
                {data["Living as Christians"].living_talks.map(
                  (talk, index) => (
                    <View key={index} className={`flex-col gap-2`}>
                      <Text className="font-bold text-xl">{talk.title}</Text>
                      {talk.living_talk_info.map((info, infoIndex) => (
                        <View
                          key={infoIndex}
                          className="flex-row justify-between items-center"
                        >
                          <Text
                            className={`${
                              info.speaker
                                .toLowerCase()
                                .includes(user?.first_name?.toLowerCase() ?? first_name)
                                ? "bg-red-400 font-bold text-lightwhite p-2 rounded-lg"
                                : ""
                            }`}
                          >
                            {info.speaker}
                          </Text>
                          {talk.title !== "Local Needs" ? (
                            <Text className="bg-primary font-bold self-start rounded-xl text-lightwhite p-2">
                              {info.duration &&
                                info.duration !== " " &&
                                `${removeParenteshis(info.duration)}`}
                            </Text>
                          ) : null}
                        </View>
                      ))}
                      {index <
                        data["Living as Christians"].living_talks.length -
                          1 && <View className="border-b-hairline mt-1"></View>}
                    </View>
                  )
                )}

                {/* Bible Study Section */}
                {
                  <View className="flex-col gap-3 border-t-hairline">
                    {data[
                      "Living as Christians"
                    ].bible_study[0].bible_study_info.map((info, infoIndex) => (
                      <View
                        key={infoIndex}
                        className="flex-col justify-between"
                      >
                        <View className="flex-col justify-between flex-wrap sm:flex-col  mt-4">
                          <Text className="font-bold text-xl mb-1">
                            {"Congregation Bible Study"}
                          </Text>
                          <Text
                            className={`${
                              info.conductor
                                .toLowerCase()
                                .includes(user?.first_name?.toLowerCase() ?? first_name)
                                ? "bg-red-400 text-lightwhite p-2 rounded-lg font-bold mb-1 "
                                : "" 
                            } `}
                          >
                            {info.conductor}
                          </Text>
                        </View>

                        <View className="flex-col justify-betweenflex-wrap ">
                          <Text className="font-bold text-xl mt-4 mb-1" >Reader </Text>
                          <Text
                            className={`${
                              info.reader
                                .toLowerCase()
                                .includes(user?.first_name?.toLowerCase() ?? first_name)
                                ? "bg-red-400 text-lightwhite p-2 rounded-lg font-bold mt-2"
                                : ""
                            }`}
                          >
                            {info.reader}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                }
              </View>
            </View>
            {/* Closing Section */}
            <View>
              <View className="p-5 back-g rounded-xl flex-col">
                <Text className="font-bold text-lg">
                  {data.Closing.closing_song}
                </Text>
                <View className="flex-row  items-center text-center align-middle">
                  <Text className={`font-bold text-lg `}>Closing Prayer: </Text>
                  <Text
                    className={` ${
                      data.Closing.closing_prayer
                        .toLowerCase()
                        .includes(user?.first_name?.toLowerCase() ?? first_name)
                        ? "bg-primary text-lightwhite p-2 rounded-lg font-bold"
                        : ""
                    }`}
                  >
                    {data.Closing.closing_prayer.trim()}
                  </Text>
                </View>
              </View>
            </View>
            <View className="border-hairline"></View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Duties</Text>
              <View className="p-5 bg-primary rounded-xl flex-col mt-3">
              {data?.Duties && RenderDuties( data?.Duties, user?.first_name?.toLowerCase() ?? first_name)}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
 
      );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  scheduleContainer: {
    marginBottom: 24,
  },
  dateText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 23,
    fontWeight: "bold",
    marginBottom: 6,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
});
