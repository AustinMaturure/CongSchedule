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
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Link } from "expo-router";
import axios from "axios";
import { useEffect, useState } from "react";
import renderDuties from "../duties.js";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Talk {
  title: string;
  talk_info: {
    speaker: string;
  }[];
}

interface ApplyPart {
  apply_part: string;
  apply_info: {
    student: string;
    duration: string;
  }[];
}

interface BibleStudy {
  title: string;
  bible_study_info: {
    conductor: string;
    reader: string;
  }[];
}
interface Duties {
  [key: string]: string;
}
interface ScheduleSkel {
  Schedule: {
    id: string;
    date: string;
  };
  Opening: {
    opening_song: string;
    opening_prayer: string;
    chairman: string;
  };
  Treasures: {
    bible_reading: string;
    treasures_talks: Talk[];
  };
  "Apply Yourself": {
    apply_parts: ApplyPart[];
  };
  "Living as Christians": {
    living_song: string;
    living_talks: {
      title: string;
      living_talk_info: {
        speaker: string;
        duration: string;
      }[];
    }[];
    bible_study: BibleStudy[];
  };
  Closing: {
    closing_song: string;
    closing_prayer: string;
  };
  Duties: Duties[];
}

export default function Index() {
  const [data, setData] = useState<ScheduleSkel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [end, setEnd] = useState<boolean | false>(false);
  const [loading, setLoading] = useState<boolean | true>(true);
  const [next, setNext] = useState<number | 0>(7);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [first_name, setFirstName] = useState<string | "">("");
  const [last_name, setLastName] = useState<string | "">("");

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
    console.log("useEffect trig vgered");
    setLoading(true);
    setNext(7);
    axios
      .get(
        `https://congschedules.pythonanywhere.com/schedular/api/getschedule/${currentWeekIndexDate.toLocaleString(
          "en-GB",
          { day: "2-digit", month: "long", year: "numeric" }
        )}`
      )
      .then((response) => {
        if (response.status === 404) {
          setNext(0);
          setEnd(true);
        } else {
          setData(response.data);
          setEnd(false);
          setLoading(false);
          const fetchData = async () => {
            const token = await getData("access_token");
            const first_name = await getData("first_name");
            const last_name = await getData("last_name");
            setAccessToken(token);
            setFirstName(first_name);
            setLastName(last_name);
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
      const last_name = await getData("last_name");
      setAccessToken(token);
      setFirstName(first_name);
      setLastName(last_name);
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
        className={` ${Platform.OS == "ios" ? "p-6" : "p-3"}h-vh  bg-zinc-800`}
      >
        <StatusBar barStyle="light-content" backgroundColor="#27272a" />
        {data ? (
          <View className=" bg-primary">
            <View className="flex-row justify-center gap-6 items-center text-center p-6">
              <TouchableOpacity
                onPress={goToPreviousWeek}
                disabled={end ? true : false}
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
              <Pressable onPress={goToNextWeek} disabled={end ? true : false}>
                <Image
                  source={require("../../assets/images/next-svgrepo-com (4).png")}
                  className="w-9 h-9 object-cover"
                />
              </Pressable>
            </View>
            <Link
              className="p-2"
              href={!accessToken ? "../upcoming" : "../accounts"}
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

  const removeGems = (str: string) => {
    return str.replace("Spiritual Gems", "");
  };

  const removeParenteshis = (str: string) => {
    let clean = str.replace("(", "");
    clean = clean.replace(")", "");

    return clean;
  };

  return (
    <SafeAreaView className="gap-4 bg-zinc-800">
      <StatusBar barStyle="light-content" backgroundColor="#27272a" />
      <ScrollView className="flex-col gap-4 bg-zinc-800">
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
          <Link href={accessToken ? "./upcoming" : "./accounts"} asChild>
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
                <Text className="font-bold mb-3">
                  {data?.Opening?.opening_song}
                </Text>
                <View className="flex-row items-center">
                  <Text className={`font-bold text-lg `}>Opening Prayer: </Text>
                  <Text
                    className={` ${
                      data.Opening.opening_prayer
                        .toLowerCase()
                        .includes(first_name?.toLowerCase())
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
                        .includes(first_name?.toLowerCase())
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
              <Text style={styles.sectionTitle} className="p-2 rounded-xl">
                Treasures From God's Word
              </Text>
              <View className="p-4 flex-col gap-3 back-g rounded-2xl ">
                {data.Treasures.treasures_talks.map((talk, index) => (
                  <View key={index} className="gap-2 ">
                    <Text className="font-bold text-xl">
                      {talk.title.trimStart()}
                    </Text>
                    {talk.talk_info.map((info, infoIndex) => (
                      <Text
                        key={infoIndex}
                        className={`${
                          info.speaker
                            .toLowerCase()
                            .includes(first_name?.toLowerCase())
                            ? "bg-lightblue text-lightwhite p-2 rounded-lg font-bold"
                            : ""
                        }`}
                      >
                        {info.speaker}
                      </Text>
                    ))}
                    {index < data.Treasures.treasures_talks.length - 1 && (
                      <View className="border-b-hairline"></View>
                    )}
                  </View>
                ))}
                <View className="flex-col gap-1 border-t-hairline ">
                  <Text className="font-bold text-xl mt-2">Bible Reading</Text>
                  <Text
                    className={`${
                      data.Treasures.bible_reading
                        .toLowerCase()
                        .includes(first_name?.toLowerCase())
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
                    className="flex-col justify-between p-4 back-g rounded-2xl "
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
                          className={`text-[14px] ml-1 ${
                            part.apply_info[0].student
                              .toLowerCase()
                              .includes(first_name?.toLowerCase())
                              ? "bg-lightblue text-lightwhite p-2 rounded-lg font-bold"
                              : ""
                          } `}
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
              <View className="flex-col p-4 gap-4 back-g rounded-2xl">
                {/* Living Song */}
                <Text>{data["Living as Christians"].living_song}</Text>

                {/* Living Talks */}
                {data["Living as Christians"].living_talks.map(
                  (talk, index) => (
                    <View key={index} className="flex-col gap-2">
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
                                .includes(first_name?.toLowerCase())
                                ? "bg-lightblue font-bold text-lightwhite p-2 rounded-lg"
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
                        <View className="flex-row justify-between flex-wrap sm:flex-col items-center mt-4">
                          <Text className="font-bold text-xl ">
                            {"Congregation Bible Study:"}
                          </Text>
                          <Text
                            className={`${
                              info.conductor
                                .toLowerCase()
                                .includes(first_name?.toLowerCase())
                                ? "bg-lightblue text-lightwhite p-2 rounded-lg font-bold mb-1"
                                : ""
                            }`}
                          >
                            {info.conductor}
                          </Text>
                        </View>

                        <View className="flex-row justify-between items-center flex-wrap sm:flex-col">
                          <Text className="font-bold text-xl">Reader: </Text>
                          <Text
                            className={`${
                              info.reader
                                .toLowerCase()
                                .includes(first_name?.toLowerCase())
                                ? "bg-lightblue text-lightwhite p-2 rounded-lg font-bold mt-2"
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
                <View className="flex-row  items-center">
                  <Text className={`font-bold text-lg `}>Closing Prayer: </Text>
                  <Text
                    className={` ${
                      data.Closing.closing_prayer
                        .toLowerCase()
                        .includes(first_name?.toLowerCase())
                        ? "bg-lightblue text-lightwhite p-2 rounded-lg font-bold"
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
                {renderDuties(data)}
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
