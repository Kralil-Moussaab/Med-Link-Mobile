import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "./context/AuthContext";
import { authService } from "./services/api";

interface UserProfile {
  name: string;
  email: string;
  phoneNumber: string;
  age: string;
  sexe: string;
  chronicDisease: string;
  groupage: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const { setIsAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    checkAuthAndLoadUserData();
  }, []);

  const checkAuthAndLoadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }
      await loadUserData();
    } catch (error) {
      console.error("Error checking auth:", error);
      router.replace("/login");
    }
  };

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await authService.logout();

      // Clear stored data
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");

      // Update auth state
      setIsAuthenticated(false);
    } catch (error: any) {
      console.error("Logout error:", error);
      Alert.alert(
        "Logout Failed",
        error.message || "An error occurred during logout. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const InfoCard = ({ label, value }: { label: string; value: string }) => (
    <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <Text className="text-gray-500 text-sm mb-1">{label}</Text>
      <Text className="text-gray-800 text-lg font-medium">{value}</Text>
    </View>
  );

  // Show loading state while checking initial auth
  if (!isInitialized) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header Section */}
      <View className="bg-white pb-6">
        <View className="items-center pt-6">
          <View className="w-28 h-28 bg-blue-50 rounded-full mb-4 items-center justify-center border-4 border-white shadow-sm">
            <FontAwesome name="user-circle" size={90} color="#3B82F6" />
          </View>
          <Text className="text-2xl font-bold text-gray-800 mb-1">
            {user?.name || "User Name"}
          </Text>
          <Text className="text-gray-500">
            {user?.email || "user@email.com"}
          </Text>
        </View>
      </View>

      {/* Info Section */}
      <View className="p-4 space-y-4">
        <Text className="text-lg font-semibold text-gray-800 mb-2 px-2">
          Personal Information
        </Text>

        <InfoCard label="Phone Number" value={user?.phoneNumber || "Not set"} />

        <InfoCard label="Age" value={user?.age || "Not set"} />

        <InfoCard label="Gender" value={user?.sexe || "Not set"} />

        <Text className="text-lg font-semibold text-gray-800 mb-2 px-2 mt-6">
          Medical Information
        </Text>

        <InfoCard
          label="Chronic Disease"
          value={user?.chronicDisease || "None"}
        />

        <InfoCard label="Blood Type" value={user?.groupage || "Not set"} />
      </View>

      {/* Logout Button */}
      <View className="p-4 mt-4">
        <TouchableOpacity
          className={`${
            loading ? "bg-red-300" : "bg-red-500"
          } p-4 rounded-xl shadow-sm`}
          onPress={handleLogout}
          disabled={loading}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {loading ? "Logging out..." : "Logout"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
