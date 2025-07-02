import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "./context/AuthContext";
import { doctorService } from "./services/api";

interface DoctorStats {
  totalPatients: number;
  Consultations: number;
  Rating: number;
  balance: string;
}

export default function DoctorHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<DoctorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await doctorService.getStatsDoctor();
      if (response.success) {
        setStats(response.data);
      } else {
        console.error("Failed to fetch stats:", response.error);
      }
    } catch (error) {
      console.error("Error fetching doctor stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Today's Appointments",
      icon: "calendar",
      color: "bg-blue-500",
      count: stats?.Consultations || 0,
      onPress: () => router.push("/doctor-appointments")
    },
    {
      title: "Patient Records",
      icon: "user-md",
      color: "bg-purple-500",
      count: stats?.totalPatients || 0,
      onPress: () => router.push("/patients")
    },
    {
      title: "Medical Tools",
      icon: "stethoscope",
      color: "bg-orange-500",
      onPress: () => router.push("/doctor-profile")
    }
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white p-6 pt-7 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-800">
              Welcome back, Dr. {user?.name || "Doctor"}
            </Text>
            <Text className="text-gray-600 mt-1">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
          <TouchableOpacity 
            className="bg-blue-100 p-3 rounded-full"
            onPress={() => router.push("/doctor-profile")}
          >
            <FontAwesome name="user" size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <View className="p-6">
        <Text className="text-xl font-bold text-gray-800 mb-4">Today's Overview</Text>
        {loading ? (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-600 mt-2">Loading stats...</Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between">
            <View className="bg-white p-4 rounded-xl shadow-sm w-[48%] mb-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-2xl font-bold text-blue-500">{stats?.Consultations || 0}</Text>
                  <Text className="text-gray-600 text-sm">Consultations</Text>
                </View>
                <FontAwesome name="comments" size={24} color="#3B82F6" />
              </View>
            </View>
            
            <View className="bg-white p-4 rounded-xl shadow-sm w-[48%] mb-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-2xl font-bold text-green-500">{Number(stats?.Rating || 0).toFixed(1)}</Text>
                  <Text className="text-gray-600 text-sm">Rating</Text>
                </View>
                <FontAwesome name="star" size={24} color="#10B981" />
              </View>
            </View>
            
            <View className="bg-white p-4 rounded-xl shadow-sm w-[48%]">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-2xl font-bold text-purple-500">{stats?.balance || "0"}</Text>
                  <Text className="text-gray-600 text-sm">Revenue</Text>
                </View>
                <FontAwesome name="dollar" size={24} color="#8B5CF6" />
              </View>
            </View>
            
            <View className="bg-white p-4 rounded-xl shadow-sm w-[48%]">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-2xl font-bold text-orange-500">{stats?.totalPatients || 0}</Text>
                  <Text className="text-gray-600 text-sm">Patients</Text>
                </View>
                <FontAwesome name="users" size={24} color="#F97316" />
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View className="px-6 mb-6">
        <Text className="text-xl font-bold text-gray-800 mb-4">Quick Actions</Text>
        <View className="space-y-3">
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              className="bg-white p-4 rounded-xl shadow-sm flex-row items-center justify-between"
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <View className={`${action.color} p-3 rounded-lg mr-4`}>
                  <FontAwesome name={action.icon as any} size={20} color="white" />
                </View>
                <View>
                  <Text className="text-lg font-semibold text-gray-800">{action.title}</Text>
                  {action.count && (
                    <Text className="text-gray-600">{action.count} items</Text>
                  )}
                </View>
              </View>
              <FontAwesome name="chevron-right" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
} 