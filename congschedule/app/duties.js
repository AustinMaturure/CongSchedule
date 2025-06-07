import { View, Text } from "react-native";

export default RenderDuties = (data, first_name) => {
  console.log('im still here')
  console.log("duties: ",data, first_name)
  
  return data?.map((duty, index) => (
    <View key={index} className="flex-col">
      {Object.keys(duty).map((key) => (
        <View key={key} className="flex-col gap-2">
          <View className="flex-row justify-between mb-1 items-center ">
            <View>
              <Text className="text-lg text-white font-bold">{key}:</Text>
            </View>
            <View>
              <Text
                className={`${
                  duty[key].toLowerCase().includes(first_name?.toLowerCase())
                    ? "bg-lightblue text-lightwhite p-1 rounded-lg font-bold mb-1"
                    : "text-md text-lightwhite"
                }`}
              >
                {duty[key]}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  ));
};
