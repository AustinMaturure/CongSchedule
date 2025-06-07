// utils/api.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { ScheduleSkel, WeekendSchedule } from "../interfaces"; 

const BASE_URL = "https://congschedules.pythonanywhere.com/schedular/api/";

export const getData = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return JSON.parse(value);
    }
    return null;
  } catch (error) {
    console.error(`Error retrieving data for key "${key}"...`, error);
    return null;
  }
};

export const checkModificationStatus = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  if (!state.isConnected) {
    console.log("No internet connection, skipping modification check.");
    return false;
  }
  try {
    const response = await axios.get(`${BASE_URL}getmodified`);
    return response.data.is_modified;
  } catch (error) {
    console.error("Error checking modification:", error);
    return false;
  }
};

export const fetchSchedule = async (
  dateString: string,
  scheduleType: "weekday" | "weekend",
  isModified: boolean
): Promise<ScheduleSkel | WeekendSchedule | null> => {
  const storageKey =
    scheduleType === "weekday"
      ? `savedSchedule${dateString}`
      : `savedSundaySchedule${dateString}`;

  if (!isModified) {
    try {
      console.log(`Checking local storage for ${scheduleType} schedule...`);
      const storedData = await AsyncStorage.getItem(storageKey);
      const parsedData = storedData ? JSON.parse(storedData) : null;
      if (parsedData) {
        console.log(`Loaded ${scheduleType} schedule from local storage`);
        return parsedData;
      }
    } catch (err) {
      console.error(`Error reading from local storage for ${scheduleType} schedule`, err);
    }
  }

  try {
    const endpoint =
      scheduleType === "weekday"
        ? `getschedule/${dateString}`
        : `getsundayschedule/${dateString}`;
    const response = await axios.get(`${BASE_URL}${endpoint}`);

    if (response.status === 200) {
      await AsyncStorage.setItem(storageKey, JSON.stringify(response.data));
      return response.data;
    } else {
      return null;
    }
  } catch (err: any) {
    console.error(`API error for ${scheduleType} schedule`, err);
    throw err; 
  }
};