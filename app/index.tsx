import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "./context/AuthContext";
import { authService } from "./services/api";

export default function HomeScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isAuthenticated, setIsAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isInitialized]);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await authService.logout();

      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");

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

  // Show loading state while checking initial auth
  if (!isInitialized) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-6">
      <View className="flex-1 justify-center items-center">
        <Text className="text-3xl font-bold text-blue-500 mb-8">
          Welcome to Med-Link
        </Text>

        <TouchableOpacity
          className={`${
            loading ? "bg-blue-300" : "bg-blue-500"
          } p-4 rounded-lg w-full`}
          onPress={handleLogout}
          disabled={loading}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {loading ? "Logging out..." : "Logout"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
