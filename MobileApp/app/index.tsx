import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Button,
  Image,
  Pressable,
} from "react-native";
import { Link } from "expo-router";
import axios from "axios";
import { useEffect, useState } from "react";

interface Talk {
  Title: string;
  Speaker: string;
}

interface Schedule {
  Date: string;
  Opening: {
    "Opening Song": string;
    "Opening Prayer": string;
    Chairman: string;
  };
  Treasures: {
    Talk: Talk;
    "Spiritual Gems": Talk;
    "Bible Reading": string;
  };
  "Apply Yourself": {
    [key: string]: {
      Student: string;
      Duration: string;
    };
  };
  "Living as Christians": {
    Song: string;
    Talks: {
      [key: string]: {
        Speaker: string;
        Duration?: string;
        Conductor?: string;
        Reader?: string;
      };
    };
  };
  Closing: {
    "Closing Song": string;
    "Closing Prayer": string;
  };
}

export default function Index() {
  const [data, setData] = useState<Schedule>();
  const [error, setError] = useState<string | null>(null);
  const [currentWeekIndex, setCurrentWeekIndex] = useState<number>(0);

  useEffect(() => {
    axios
      .get(`http://192.168.0.31:8000/schedular/api/${currentWeekIndex}`)
      .then((response) => {
        setData(response.data);
      })
      .catch((err) => {
        console.error("API call failed:", err);
        setError(err.message);
      });
  }, [currentWeekIndex]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{`Error: ${error}`}</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const currentSchedule = data;

  const goToNextWeek = () => {
    if (currentWeekIndex < 4) {
      setCurrentWeekIndex(currentWeekIndex + 1);
    }
  };

  const goToPreviousWeek = () => {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex(currentWeekIndex - 1);
    }
  };

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
    <SafeAreaView className=" gap-4">
      <ScrollView className="flex-col gap-4 bg-zinc-800 ">
        <View className="flex-row justify-center gap-6 items-center text-center p-6">
          <Pressable onPress={goToPreviousWeek}>
            <Image
              source={require("../assets/images/next-svgrepo-com (5).png")}
              className="w-9 h-9 object-cover flex-1"
              resizeMode="cover"
            />
          </Pressable>
          <View>
            <Text style={styles.dateText} className="text-white">
              {currentSchedule.Date}
            </Text>
          </View>
          <Pressable onPress={goToNextWeek}>
            <Image
              source={require("../assets/images/next-svgrepo-com (4).png")}
              className="w-9 h-9 object-cover"
            />
          </Pressable>
        </View>
        <View className="p-2 ">
          <Link href={"./upcoming"} asChild>
            <Pressable>
              <View className="bg-lightblue rounded-3xl p-3 mb-2">
                <Text className="font-bold text-2xl text-center color-lightwhite">
                  Your Schedule
                </Text>
                <Text className="text-center color-white">
                  Sign In to view your upcoming parts
                </Text>
              </View>
            </Pressable>
          </Link>
        </View>
        <View className="rounded-t-3xl bg-lightwhite box-border p-6 z-10 gap-6 rounded-2xl">
          {/* Opening Section */}
          <View className="gap-2">
            <View className="p-5 back-g rounded-xl flex-col">
              <Text className="font-bold mb-3">
                {currentSchedule.Opening["Opening Song"]}
              </Text>
              <Text>
                <Text className="font-bold text-lg">Opening Prayer: </Text>

                {currentSchedule.Opening["Opening Prayer"]}
              </Text>

              <Text>
                <Text className="font-bold text-lg">Chairman: </Text>

                {currentSchedule.Opening.Chairman}
              </Text>
            </View>
          </View>

          {/* Treasures Section */}
          <View className="gap-2">
            <Text style={styles.sectionTitle} className=" p-2 rounded-xl">
              Treasures From God's Word{" "}
            </Text>
            <View className="p-4 flex-col gap-3 back-g rounded-2xl">
              <View className="gap-2">
                <View>
                  <Text className="font-bold text-xl">
                    {currentSchedule.Treasures.Talk.Title.trimStart()}
                  </Text>
                </View>

                <View className="inline">
                  <Text className="">
                    {currentSchedule.Treasures.Talk.Speaker}
                  </Text>
                </View>
              </View>
              <View className="border-b-hairline"></View>
              <View className=" ">
                <Text>
                  <View className="gap-1">
                    <View className="flex-row justify-between ">
                      <Text className="font-bold text-xl">Spiritual Gems </Text>
                      <Text className="font-bold text-xl">
                        {removeGems(
                          currentSchedule.Treasures["Spiritual Gems"].Title
                        )}
                      </Text>
                    </View>
                    <View></View>
                    <View>
                      <Text>
                        {currentSchedule.Treasures["Spiritual Gems"].Speaker}
                      </Text>
                    </View>
                  </View>
                </Text>
              </View>
              <View className="border-b-hairline"></View>
              <View className="flex-col gap-1">
                <Text className="font-bold text-xl">Bible Reading</Text>
                <Text>{currentSchedule.Treasures["Bible Reading"]}</Text>
              </View>
            </View>
          </View>

          {/* Apply Yourself Section */}
          <View style={styles.section} className="gap-2">
            <Text style={styles.sectionTitle}>
              Apply Yourself To the Ministry
            </Text>
            <View className="flex-col gap-4">
              {Object.entries(currentSchedule["Apply Yourself"]).map(
                ([activity, details]) => (
                  <View
                    key={activity}
                    className="flex-row justify-between items-center p-4  back-g rounded-2xl "
                  >
                    <View className="flex-col gap-1 ">
                      <Text className="font-bold text-xl ">
                        {removeNumbers(activity)}
                      </Text>
                      <Text className="text-[14px] ml-1">
                        {details.Student}
                      </Text>
                    </View>
                    <View>
                      <Text className="bg-primary font-bold self-start rounded-xl text-lightwhite p-2">
                        {removeParenteshis(details.Duration)}
                      </Text>
                    </View>
                  </View>
                )
              )}
            </View>
          </View>

          {/* Living as Christians Section */}
          <View className="gap-2">
            <Text style={styles.sectionTitle}>Living as Christians</Text>
            <View className=" flex-col p-4 gap-4 back-g rounded-2xl">
              <Text>{currentSchedule["Living as Christians"].Song}</Text>
              {Object.entries(
                currentSchedule["Living as Christians"].Talks
              ).map(([talk, details]) => (
                <View key={talk} className="flex-col gap-4">
                  {talk === "Congregation Bible Study" ? (
                    <View className="flex-col">
                      <View className="flex-row items-center justify-between">
                        <Text className="font-bold text-xl blk">{talk}:</Text>
                        <Text>{details.Conductor}</Text>
                      </View>
                      <View className="flex-row items-center justify-between">
                        <Text className="font-bold text-xl">{`Reader: `}</Text>
                        <Text>{details.Reader}</Text>
                      </View>
                    </View>
                  ) : (
                    <View className="flex-col  ">
                      <View>
                        <Text className="font-bold text-xl">{talk}</Text>
                      </View>

                      <View className="flex-row justify-between items-center">
                        <Text>{details.Speaker}</Text>
                        <Text className="bg-primary font-bold self-start rounded-xl text-lightwhite p-2">
                          {details.Duration &&
                            `${removeParenteshis(details.Duration)}`}
                        </Text>
                      </View>
                      <View className="border-b-hairline mt-3"></View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Closing Section */}
          <View>
            <View className="p-5 back-g rounded-xl flex-col">
              <Text className="font-bold text-lg">
                {currentSchedule.Closing["Closing Song"]}
              </Text>
              <View className="flex-row items-baseline">
                <Text className="font-bold text-lg">Closing Prayer: </Text>
                <Text>{currentSchedule.Closing["Closing Prayer"]}</Text>
              </View>
            </View>
          </View>
        </View>
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
