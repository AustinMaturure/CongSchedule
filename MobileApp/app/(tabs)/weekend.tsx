import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
  StatusBar,
  Image,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Link } from "expo-router";
import renderDuties from "../duties.js";

interface Brother {
  full_name: string;
}
interface duties {
  [key: string]: string;
}
interface PublicDiscourse {
  theme: string;
  speaker: {
    brother: Brother;
  };
}

interface Watchtower {
  conductor: {
    brother: Brother;
  };
  reader: {
    full_name: string;
  };
}

interface ClosingPrayer {
  full_name: string;
}

interface WeekendSchedule {
  date: string;
  chairman: {
    brother: Brother;
  };
  public_discourse: PublicDiscourse;
  watchtower: Watchtower;
  closing_prayer: ClosingPrayer;
  duties: duties[];
}

const Weekend = () => {
  const [data, setData] = useState<WeekendSchedule | null>(null);
  const [end, setEnd] = useState<boolean | false>(false);
  const [error, setError] = useState<string | null>(null);
  const [next, setNext] = useState<number | 0>(7);
  const [loading, setLoading] = useState<boolean | true>(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [first_name, setFirstName] = useState<string | "">("");

  const [currentWeekIndexDate, setCurrentDate] = useState<Date>(new Date());

  const formattedDate = currentWeekIndexDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

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
    console.log("useEffect triggered");
    setEnd(false);
    setNext(7);
    setLoading(true);
    axios
      .get(
        `https://congschedules.pythonanywhere.com/schedular/api/getsundayschedule/${currentWeekIndexDate.toLocaleString(
          "en-GB",
          { day: "2-digit", month: "long", year: "numeric" }
        )}`
      )
      .then((response) => {
        if (response.status === 404) {
          setEnd(true);
          console.log(response.status);
        } else {
          setData(response.data);
          setEnd(false);
          setLoading(false);
          const fetchData = async () => {
            const token = await getData("access_token");
            const first_name = await getData("first_name");
            setAccessToken(token);
            setFirstName(first_name);
          };

          fetchData();
          console.log(response.data);
        }
      })
      .catch((err) => {
        setError(err.message);
        if (err.response && err.response.status === 404) {
          setEnd(true);
          setError(
            err.response.data.error || "No data found for the requested date."
          );
        }
      });
  }, [currentWeekIndexDate]);

  useEffect(() => {
    const fetchData = async () => {
      const token = await getData("access_token");
      const first_name = await getData("first_name");
      setAccessToken(token);
      setFirstName(first_name);
    };

    fetchData();
  }, []);

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
        className={`h-vh ${Platform.OS == "ios" ? "p-6" : ""} bg-zinc-800`}
      >
        <StatusBar barStyle="light-content" backgroundColor="#27272a" />
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
                  {data?.date}
                </Text>
              </View>
              <Pressable onPress={goToNextWeek}>
                <Image
                  source={require("../../assets/images/next-svgrepo-com (4).png")}
                  className="w-9 h-9 object-cover"
                />
              </Pressable>
            </View>
            <Link
              className="p-2"
              href={accessToken ? "../upcoming" : "../accounts"}
              asChild
            >
              <Pressable>
                <View className="bg-lightblue rounded-3xl p-3 mb-2">
                  <Text className="font-bold text-2xl text-center color-lightwhite">
                    Your Schedule
                  </Text>
                  {accessToken ? (
                    <Text className="text-center color-white">
                      Hi,{" "}
                      <Text className="text-decoration-line">
                        {first_name}...
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
              <Text>A schedule is not available for this date</Text>
            ) : (
              <ActivityIndicator size="large" color="#1f1f1f" />
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-primary">
      <StatusBar barStyle="light-content" backgroundColor="#27272a" />
      <ScrollView className="flex-col gap-4 bg-zinc-800">
        <View className="flex-row justify-center gap-6 items-center text-center p-6">
          <TouchableOpacity
            onPress={goToPreviousWeek}
            disabled={next == 0 ? true : false}
            activeOpacity={next == 0 ? 0.6 : 0.9}
          >
            <Image
              source={require("../../assets/images/next-svgrepo-com (5).png")}
              className="w-9 h-9 object-cover"
            />
          </TouchableOpacity>
          <View>
            <Text style={styles.dateText} className="text-white">
              {data?.date}
            </Text>
          </View>
          <Pressable onPress={goToNextWeek} disabled={next == 0 ? true : false}>
            <Image
              source={require("../../assets/images/next-svgrepo-com (4).png")}
              className="w-9 h-9 object-cover"
            />
          </Pressable>
        </View>

        {/* Your Schedule Link Section */}
        <View className="p-2">
          <Link href={accessToken ? "../upcoming" : "../accounts"} asChild>
            <Pressable>
              <View className="bg-lightblue rounded-3xl p-3 mb-2">
                <Text className="font-bold text-2xl text-center color-lightwhite">
                  Your Schedule
                </Text>
                {accessToken ? (
                  <Text className="text-center color-white">
                    Hi,{" "}
                    <Text className="text-decoration-line">
                      {first_name}...
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
                <View className="flex-row items-center">
                  <Text className={`font-bold text-lg `}>Opening Prayer: </Text>
                  <Text
                    className={` ${
                      data?.chairman.brother.full_name
                        .toLowerCase()
                        .includes(first_name?.toLowerCase())
                        ? "bg-lightblue text-lightwhite p-1 rounded-lg font-bold "
                        : ""
                    }}`}
                  >
                    {data?.chairman.brother.full_name}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className={`font-bold text-lg `}>Chairman: </Text>
                  <Text
                    className={` ${
                      data?.chairman.brother.full_name
                        .toLowerCase()
                        .includes(first_name?.toLowerCase())
                        ? "bg-lightblue text-lightwhite rounded-lg font-bold p-1"
                        : ""
                    }`}
                  >
                    {data?.chairman.brother.full_name}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.sectionTitle}>Public Talk</Text>
            <View className="flex-col justify-between back-g  p-4 rounded-xl">
              <Text className="font-bold text-xl">
                {data?.public_discourse.theme}
              </Text>
              <Text>{data?.public_discourse.speaker.brother.full_name}</Text>
            </View>
            <Text style={styles.sectionTitle}>Watchtower</Text>
            <View className="flex-col justify-between back-g  p-4 gap-2 rounded-xl ">
              <View className="justify-between  rounded-xl flex-col">
                <Text className="font-bold text-xl ">
                  {"Watchtower Conductor"}
                </Text>
                <Text
                  className={`${
                    data?.watchtower.conductor.brother.full_name
                      .toLowerCase()
                      .includes(first_name?.toLowerCase())
                      ? "bg-lightblue text-lightwhite p-2 rounded-lg font-bold mb-1"
                      : ""
                  }`}
                >
                  {data?.watchtower.conductor.brother.full_name}
                </Text>
              </View>

              <View className="flex-col justify-between">
                <Text className="font-bold text-xl">Reader </Text>
                <Text
                  className={`${
                    data?.watchtower.reader.full_name
                      .toLowerCase()
                      .includes(first_name?.toLowerCase())
                      ? "bg-lightblue text-lightwhite p-2 rounded-lg font-bold"
                      : ""
                  }`}
                >
                  {data?.watchtower.reader.full_name}
                </Text>
              </View>
            </View>
            <Text style={styles.sectionTitle}>Closing</Text>
            <View className="p-5 back-g rounded-xl flex-col">
              <View className="flex-col  ">
                <Text className={`font-bold text-lg `}>Closing Prayer </Text>
                <Text
                  className={` ${
                    data?.closing_prayer.full_name
                      .toLowerCase()
                      .includes(first_name?.toLowerCase())
                      ? "bg-lightblue text-lightwhite p-2 rounded-lg font-bold"
                      : ""
                  }`}
                >
                  {data?.closing_prayer.full_name.trim()}
                </Text>
              </View>
            </View>
            <View className="border-hairline"></View>
            <View>
              <Text style={styles.sectionTitle}>Duties</Text>
              <View className="p-5 bg-primary rounded-xl flex-col mt-4">
                {renderDuties(data)}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: "#555",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  navButton: {
    fontSize: 16,
    color: "#007bff",
  },
  dateText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  cardContainer: {
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  greetingText: {
    fontSize: 16,
    color: "#333",
  },
  firstName: {
    fontWeight: "bold",
  },
  scheduleCard: {
    marginBottom: 15,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 23,
    fontWeight: "bold",
  },
  scheduleDetails: {
    fontSize: 16,
    color: "#555",
    marginBottom: 3,
  },
});

export default Weekend;
