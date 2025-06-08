import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "./context/AuthContext";

type AppRoute = "/doctors" | "/appointments";
type IconName = "calendar" | "user-md" | "search" | "clock-o";

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isInitialized]);

  if (!isInitialized) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-400 text-base">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-blue-600 flex justify-center items-center pt-10 pb-10 px-6 rounded-b-3xl shadow-md">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-3xl font-bold mb-1">
              Welcome Back!
            </Text>
            <Text className="text-blue-100 text-base">
              Your health is our priority
            </Text>
          </View>
          {/* <TouchableOpacity className="bg-white/20 p-3 rounded-full">
            <FontAwesome name="bell" size={22} color="white" />
          </TouchableOpacity> */}
        </View>
      </View>

      {/* Stats */}
      <View className="px-6 -mt-7">
        <View className="flex-row flex-wrap justify-between gap-y-4">
          {[
            {
              title: "Appointments",
              count: "2",
              description: "Upcoming visits",
              icon: "calendar",
              color: "#3B82F6",
              bg: "bg-blue-100",
            },
            {
              title: "Doctors",
              count: "5",
              description: "Available today",
              icon: "user-md",
              color: "#10B981",
              bg: "bg-green-100",
            },
          ].map((item, index) => (
            <View
              key={index}
              className="bg-white p-5 w-[48%] rounded-2xl border border-gray-200 shadow-sm"
            >
              <View className="flex-row items-center mb-4">
                <View className={`${item.bg} p-3 rounded-xl mr-3`}>
                  <FontAwesome
                    name={item.icon as IconName}
                    size={22}
                    color={item.color}
                  />
                </View>
                <Text className="text-gray-600 font-medium text-base">
                  {item.title}
                </Text>
              </View>
              <Text className="text-3xl font-bold text-gray-900 mb-1">
                {item.count}
              </Text>
              <Text className="text-gray-500 text-sm">{item.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Featured Doctor */}
      <View className="px-6 mt-8">
        <Text className="text-xl font-semibold text-gray-800 mb-4">
          Featured Doctor
        </Text>
        <TouchableOpacity
          className="bg-white rounded-3xl border border-gray-200 shadow-sm"
          onPress={() => router.push("/doctors" as AppRoute)}
        >
          <View className="p-5 flex-row items-center">
            <Image
              source={{
                uri: "https://randomuser.me/api/portraits/women/44.jpg",
              }}
              className="w-20 h-20 rounded-full border-2 border-blue-200 mr-5"
            />
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">
                Dr. Sarah Johnson
              </Text>
              <Text className="text-gray-500 text-base">Cardiologist</Text>
              <View className="flex-row items-center mt-1">
                <FontAwesome name="star" size={14} color="#F59E0B" />
                <Text className="text-gray-600 ml-2 text-sm">
                  4.9 (120 reviews)
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View className="px-6 mt-10 mb-16">
        <Text className="text-xl font-semibold text-gray-800 mb-5">
          Quick Actions
        </Text>
        <View className="flex-row flex-wrap justify-between gap-y-4">
          {[
            {
              title: "Find Doctor",
              subtitle: "Book a consultation",
              icon: "search",
              color: "#8B5CF6",
              bg: "bg-purple-100",
              path: "/doctors",
            },
            {
              title: "My Schedule",
              subtitle: "View my appointments",
              icon: "clock-o",
              color: "#F97316",
              bg: "bg-orange-100",
              path: "/appointments",
            },
          ].map((action, index) => (
            <TouchableOpacity
              key={index}
              className="bg-white p-5 w-[48%] rounded-2xl border border-gray-200 shadow-sm"
              onPress={() => router.push(action.path as AppRoute)}
            >
              <View className="flex-row items-center mb-3">
                <View className={`${action.bg} p-3 rounded-xl mr-3`}>
                  <FontAwesome
                    name={action.icon as IconName}
                    size={22}
                    color={action.color}
                  />
                </View>
                <Text className="text-gray-700 font-medium">
                  {action.title}
                </Text>
              </View>
              <Text className="text-gray-500 text-sm">{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
