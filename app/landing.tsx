import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, Text, View } from "react-native";

export default function LandingScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/choose-type");
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-blue-500 justify-center items-center">
      <View className="items-center space-y-6">
        <Image
          source={require("../assets/medlink-rb.png")}
          className="w-40 h-40"
          resizeMode="contain"
        />
        {/* <Text className="text-4xl font-bold text-blue-500">Med-Link</Text> */}
        <Text className="text-gray-200 text-lg">Your Health, Our Priority</Text>
      </View>
    </View>
  );
}
