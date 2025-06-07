import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = async () => {
    try {
      const userFirstName = await AsyncStorage.getItem("first_name");
      const cleanedFirstName = userFirstName?.replace(/"/g, "").trim();
      const userLastName = await AsyncStorage.getItem("last_name");
      const cleanedLastName = userLastName?.replace(/"/g, "").trim();
      const accessToken = await AsyncStorage.getItem("access_token");

      if (cleanedFirstName && accessToken) {
        const response = await axios.get<ScheduleItem[]>(
          `https://congschedules.pythonanywhere.com/schedular/api/getuserschedule/${cleanedFirstName}/${cleanedLastName}`
        );
        setScheduleData(response.data);
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

  const groupByDate = (data: ScheduleItem[]) => {
    return data.reduce((groups: Record<string, ScheduleItem[]>, item) => {
      if (!groups[item.schedule_date]) {
        groups[item.schedule_date] = [];
      }
      groups[item.schedule_date].push(item);
      return groups;
    }, {});
  };

  const removeParenteshis = (str: string) => str.replace(/[()]/g, "");

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }


  if (error) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-red-500">{error}</Text>
      </SafeAreaView>
    );
  }

  if (!loading && scheduleData.length == 0) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text>No upcoming parts.</Text>
      </SafeAreaView>
    );
  }

  const groupedData = groupByDate(scheduleData);

  return (
    <ScrollView className="flex-1 px-5 pt-5 bg-white">
      <StatusBar barStyle="light-content" />
      <Text className="text-2xl font-bold mb-5">Upcoming Schedule</Text>

      {Object.entries(groupedData).map(([date, items], index) => (
  <View
    key={date}
    className={`mb-6 rounded-xl p-3 bg-gray-100 ${
      index === 0 ? " border-4 border-slate-400 " : ""
    }`}
  >

          <View className="flex-row justify-between items-center mb-3 bg-slate-400 p-3 rounded-md">
            <View className="flex-col">
              <Text className="text-2xl font-semibold text-white">
                {date}
              </Text>
              <Text className="text-lg text-white">{items[0].day}</Text>
            </View>
            <Text className="text-2xl font-medium  text-slate-50 px-3 py-1 rounded-full">
              {items.length} 
            </Text>
          </View>

          {/* Schedule items */}
          {items.map((item, index) => (
            <View
              key={index}
              className="bg-white p-4 mb-3 rounded-lg "
            >
              <Text className="text-2xl font-bold  mb-1">
                {item.title_or_theme.trim()}
              </Text>
              <Text className="text-lg mb-2">{item.section}</Text>

              {item.conductor !== "N/A" && (
                <View className="flex-row justify-between mb-1">
                  <Text className="font-medium ">Conductor:</Text>
                  <Text className="">{item.conductor?.trim()}</Text>
                </View>
              )}
              {item.reader !== "N/A" && (
                <View className="flex-row justify-between mb-1">
                  <Text className="font-medium">Reader:</Text>
                  <Text className="">{item.reader}</Text>
                </View>
              )}
              {item.student !== "N/A" && item.student && (
                <Text className="mt-2 font-semibold">
                  {item.student.trim()}
                </Text>
              )}
              {item.duration !== "N/A" && (
                <Text className="mt-2 self-start text-xl bg-primary text-white px-2 py-1 rounded-xl font-bold">
                  {removeParenteshis(item.duration)}
                </Text>
              )}
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

export default Upcoming;
