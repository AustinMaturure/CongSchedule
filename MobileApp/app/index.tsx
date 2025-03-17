import { Text, View, ScrollView, StyleSheet } from "react-native";
import axios from "axios";
import { useEffect, useState } from "react";

interface Talk {
  Title: string;
  Speaker: string;
}

interface Schedule {
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
  const [data, setData] = useState<{ [key: string]: Schedule } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get("http://192.168.0.31:8000/schedular/api/")
      .then((response) => {
        setData(response.data);
      })
      .catch((err) => {
        console.error("API call failed:", err);
        setError(err.message);
      });
  }, []);

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

  return (
    <ScrollView style={styles.container}>
      {/* Loop through all the dates */}
      {Object.entries(data).map(([date, schedule]) => (
        <View key={date} style={styles.scheduleContainer}>
          <Text style={styles.dateText}>{date}</Text>

          {/* Opening Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Opening</Text>
            <Text>Opening Song: {schedule.Opening["Opening Song"]}</Text>
            <Text>Opening Prayer: {schedule.Opening["Opening Prayer"]}</Text>
            <Text>Chairman: {schedule.Opening.Chairman}</Text>
          </View>

          {/* Treasures Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Treasures From God's Word</Text>
            <Text>
              Talk: {schedule.Treasures.Talk.Title} -{" "}
              {schedule.Treasures.Talk.Speaker}
            </Text>
            <Text>
              Spiritual Gems: {schedule.Treasures["Spiritual Gems"].Title} -{" "}
              {schedule.Treasures["Spiritual Gems"].Speaker}
            </Text>
            <Text>Bible Reading: {schedule.Treasures["Bible Reading"]}</Text>
          </View>

          {/* Apply Yourself Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Apply Yourself</Text>
            {Object.entries(schedule["Apply Yourself"]).map(
              ([activity, details]) => (
                <Text key={activity}>
                  {activity}: {details.Student} {details.Duration}
                </Text>
              )
            )}
          </View>

          {/* Living as Christians Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Living as Christians</Text>
            <Text>Song: {schedule["Living as Christians"].Song}</Text>
            {Object.entries(schedule["Living as Christians"].Talks).map(
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
            <Text>Closing Song: {schedule.Closing["Closing Song"]}</Text>
            <Text>Closing Prayer: {schedule.Closing["Closing Prayer"]}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
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
    marginBottom: 8,
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
