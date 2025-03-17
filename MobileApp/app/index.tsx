import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 flex-row justify-between ">
      <View>
        <Text className="text-2xl text-primary "> {"<"}</Text>
      </View>
      <View>
        <Text className="text-2xl text-primary ">6 Febuary 2025</Text>
      </View>
      <View>
        <Text className="text-2xl text-primary "> {">"}</Text>
      </View>
    </View>
  );
}
