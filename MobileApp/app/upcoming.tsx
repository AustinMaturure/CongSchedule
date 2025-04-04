import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { parse } from "date-fns";

interface ScheduleItem {
  schedule_date: string;
  day: string;
  section: string;
  title_or_theme: string;
  duty: string;
  duration: string;
  student: string | null;
  reader: string | null;
  conductor: string | null;
}

const Upcoming = () => {
  const [scheduleData, setScheduleData] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = async () => {
    try {
      const userFirstName = await AsyncStorage.getItem("first_name");
      const cleanedFirstName = userFirstName?.replace(/"/g, "").trim();
      const userLastName = await AsyncStorage.getItem("last_name");
      const cleanedLastName = userLastName?.replace(/"/g, "").trim();
      const accessToken = await AsyncStorage.getItem("access_token");

      if (userFirstName && accessToken) {
        const response = await axios.get<ScheduleItem[]>(
          `http://192.168.110.250:8000/schedular/api/getuserschedule/${cleanedFirstName}/${cleanedLastName}`,
          {}
        );
        setScheduleData(response.data);
        console.log(response.data);
      } else {
        setError("User information or access token not found");
      }
    } catch (err) {
      setError("Failed to fetch schedule");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const removeParenteshis = (str: string) => {
    let clean = str.replace("(", "");
    clean = clean.replace(")", "");

    return clean;
  };

  const renderScheduleItem = ({ item }: { item: ScheduleItem }) => {
    console.log(item);
    return (
      <View style={styles.scheduleItem}>
        <StatusBar barStyle="light-content" />
        <View
          className="
        flex-row justify-between items-center mb-3"
        >
          <View className="flex-row gap-1">
            <Text
              className={` text-xl ${
                item.day == "Sunday" || item.day == "Saturday"
                  ? "bg-blue-200"
                  : "bg-slate-700"
              }  font-bold self-start rounded-xl text-lightwhite p-2 text-center `}
            >
              {item.day}
            </Text>
            <Text
              style={styles.scheduleDate}
              className=" text-xl  bg-lightblue font-bold self-start rounded-xl text-lightwhite p-2 text-center"
            >
              {item.schedule_date}
            </Text>
          </View>
          {item.duration !== "N/A" && (
            <Text className="bg-primary  font-bold self-start rounded-xl text-lightwhite p-2 ">
              {removeParenteshis(item.duration)}
            </Text>
          )}
        </View>
        <View className="bg-white p-4 rounded-lg">
          <Text className="text-2xl font-bold mb-3">
            {item.title_or_theme.trim()}
          </Text>

          <Text className="text-gray-500 text-sm">{item.section}</Text>
          {item.conductor !== "N/A" && (
            <View className="flex-row justify-between">
              <Text className="font-bold">Conductor:</Text>
              <Text> {item.conductor?.trim()}</Text>
            </View>
          )}
          {item.reader !== "N/A" && (
            <View className="flex-row justify-between">
              <Text className="font-bold">Reader:</Text>
              <Text>{item.reader}</Text>
            </View>
          )}
          {item.student !== "N/A" && (
            <Text className="mt-2 font-bold">{item.student?.trim()}</Text>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} className="">
      <Text style={styles.header}>Upcoming Schedule</Text>
      {scheduleData.length === 0 ? (
        <View style={styles.centeredContainer}>
          <Text className="text-primary">No upcoming items</Text>
        </View>
      ) : (
        <FlatList
          data={scheduleData}
          renderItem={renderScheduleItem}
          keyExtractor={(item, index) => `${item.schedule_date}-${index}`}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  scheduleItem: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
  },
  scheduleDate: {},
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
  },
});

export default Upcoming;
