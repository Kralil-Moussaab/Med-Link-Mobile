import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "./context/AuthContext";
import { authService } from "./services/api";

export default function DoctorLoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isAuthenticated, setIsAuthenticated, setUser, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace("/doctor-home");
    }
  }, [isAuthenticated, isInitialized]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      console.log("Starting doctor login process...");
      
      const response = await authService.loginDoctor(email, password);
      if (!response.success) {
        throw new Error(response.error);
      }
      console.log("Doctor login successful:", response);

      // Store token and user data
      await AsyncStorage.setItem("token", response.data?.token || "");
      await AsyncStorage.setItem("user", JSON.stringify(response.data?.user || {}));

      // Update auth state
      setIsAuthenticated(true);
      
      // Set user data with doctor type
      const userData = {
        ...response.data?.user,
        type: 'doctor'
      };
      setUser(userData);
      console.log("Doctor login - User data set:", userData);
    } catch (error: any) {
      console.error("Doctor login error in screen:", error);
      Alert.alert(
        "Login Failed",
        error.message || "An error occurred during login. Please try again."
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
      <View className="flex-1 justify-center">
        <View className="items-center mb-7">
          <Text className="text-3xl font-bold text-blue-500">
            Welcome Back, Doctor
          </Text>
          <Text className="text-gray-500 mt-2">Sign in to continue</Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-gray-700 mb-2">Email</Text>
            <TextInput
              className="bg-gray-100 p-4 rounded-lg"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View>
            <Text className="text-gray-700 mb-2">Password</Text>
            <TextInput
              className="bg-gray-100 p-4 rounded-lg"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            className={`${
              loading ? "bg-blue-300" : "bg-blue-500"
            } p-4 rounded-lg mt-6`}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {loading ? "Signing in..." : "Sign In as Doctor"}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-4">
            <Text className="text-gray-500">Don't have an account? </Text>
            <Link 
              href="/doctor-signup" 
              className="text-blue-500 font-semibold"
            >
              Sign Up
            </Link>
          </View>

          {/* Back to Choose Type */}
          <View className="flex-row justify-center mt-4">
            <TouchableOpacity onPress={() => router.push("/choose-type")}>
              <Text className="text-gray-500 font-semibold">
                ← Back to Choose Type
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
} 