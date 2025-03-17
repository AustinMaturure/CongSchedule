import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Button,
  Pressable,
} from "react-native";

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

  return (
    <SafeAreaView className="ps-4 gap-4">
      <View className="flex-row justify-between items-center text-center pt-6">
        <Pressable onPress={goToPreviousWeek}>
          <Button title="<" onPress={goToPreviousWeek} />
        </Pressable>
        <View>
          <Text style={styles.dateText}>{currentSchedule.Date}</Text>
        </View>
        <Pressable onPress={goToNextWeek}>
          <Button title=">" onPress={goToNextWeek} />
        </Pressable>
      </View>

      <ScrollView>
        {/* Opening Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle} className="">
            Opening
          </Text>
          <Text>Opening Song: {currentSchedule.Opening["Opening Prayer"]}</Text>
          <Text>
            Opening Prayer: {currentSchedule.Opening["Opening Prayer"]}
          </Text>
          <Text>Chairman: {currentSchedule.Opening.Chairman}</Text>
        </View>

        {/* Treasures Section */}
        <View>
          <Text style={styles.sectionTitle}>Treasures From God's Word</Text>
          <View className="ps-4 flex-col gap-3">
            <View>
              <View>
                <Text>{currentSchedule.Treasures.Talk.Title} </Text>
              </View>
              <View>
                <Text>{currentSchedule.Treasures.Talk.Speaker}</Text>
              </View>
            </View>
            <View>
              <Text>
                <View>
                  <View className="flex-row justify-between">
                    <Text>Spiritual Gems </Text>
                    <Text>
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
            <View>
              <Text>Bible Reading</Text>
              <Text>{currentSchedule.Treasures["Bible Reading"]}</Text>
            </View>
          </View>
        </View>

        {/* Apply Yourself Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apply Yourself</Text>
          {Object.entries(currentSchedule["Apply Yourself"]).map(
            ([activity, details]) => (
              <View
                key={activity}
                className="flex-row justify-between items-center p-2"
              >
                <View>
                  <Text>{removeNumbers(activity)}</Text>
                  <Text>{details.Student}</Text>
                </View>
                <View>
                  <Text>{details.Duration}</Text>
                </View>
              </View>
            )
          )}
        </View>

        {/* Living as Christians Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Living as Christians</Text>
          <Text>Song: {currentSchedule["Living as Christians"].Song}</Text>
          {Object.entries(currentSchedule["Living as Christians"].Talks).map(
            ([talk, details]) => (
              <Text key={talk}>
                {talk === "Congregation Bible Study" ? (
                  <View className="flex-co;">
                    <View>
                      <Text>
                        {talk}: {details.Conductor}
                      </Text>
                    </View>
                    <View>
                      <Text>{`Reader: ${details.Reader}`}</Text>
                    </View>
                  </View>
                ) : (
                  <>
                    {talk}: {details.Speaker}{" "}
                    {details.Duration && `${details.Duration}`}
                  </>
                )}
              </Text>
            )
          )}
        </View>

        {/* Closing Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Closing</Text>
          <Text>Closing Song: {currentSchedule.Closing["Closing Song"]}</Text>
          <Text>
            Closing Prayer: {currentSchedule.Closing["Closing Prayer"]}
          </Text>
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
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
});
