import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useAuth } from "./context/AuthContext";
import { authService } from "./services/api";

interface DoctorProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  speciality?: string;
  city?: string;
  street?: string;
  picture?: string;
}

export default function DoctorProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { setIsAuthenticated, isInitialized } = useAuth();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      console.log("Fetching profile for user:", user);
      
      // Use user data from context as primary source
      if (user) {
        console.log("Using user data from context:", user);
        setProfile({
          id: user.id || '',
          name: user.name || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          speciality: user.speciality || '',
          city: user.city || '',
          street: user.street || '',
          picture: user.picture || '',
        });
      } else {
        Alert.alert("Error", "No user data available");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      Alert.alert("Error", "Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const getDoctorImage = () => {
    if (profile?.picture) {
      return { uri: profile.picture };
    }
    return require("../assets/doc.png");
  };

  const getSpecialityColor = (speciality: string) => {
    const colors = {
      "Dentistry": "bg-blue-100 text-blue-800",
      "Genralist": "bg-green-100 text-green-800",
      "Cardiologist": "bg-red-100 text-red-800",
      "Neurologist": "bg-purple-100 text-purple-800",
      "ENT": "bg-yellow-100 text-yellow-800",
      "Dermatologist": "bg-pink-100 text-pink-800",
      "Gynecologist": "bg-indigo-100 text-indigo-800",
      "Orthopedic": "bg-orange-100 text-orange-800",
      "Pediatrician": "bg-teal-100 text-teal-800",
      "Ophthalmologist": "bg-cyan-100 text-cyan-800",
      "Psychiatrist": "bg-violet-100 text-violet-800",
      "Urologist": "bg-emerald-100 text-emerald-800",
    };
    return colors[speciality as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

    const handleLogout = async () => {
    try {
      setLoading(true);
      
      // Try to call logout API (401 is expected if token is invalid)
      try {
        await authService.logout();
      } catch (error: any) {
        // 401 error is expected when logging out, so we don't treat it as an error
        if (error.response?.status !== 401) {
          console.error("Logout API error:", error);
        }
      }

      // Clear stored data
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("userType");

      // Update auth state - this will trigger the navigation logic in _layout.tsx
      setIsAuthenticated(false);
    } catch (error: any) {
      console.error("Logout error:", error);
      Alert.alert(
        "Logout Failed",
        "An error occurred during logout. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <View className="flex-1 bg-gradient-to-b from-blue-50 to-white justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4 font-medium">Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 bg-gradient-to-b from-blue-50 to-white justify-center items-center">
        <FontAwesome name="user-md" size={64} color="#D1D5DB" />
        <Text className="text-xl font-semibold text-gray-500 mt-4 text-center">
          Profile Not Found
        </Text>
        <Text className="text-gray-400 text-center mt-2">
          Unable to load your profile information
        </Text>
        <TouchableOpacity 
          className="mt-4 bg-blue-500 px-4 py-2 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gradient-to-b from-blue-50 to-white">
      {/* Header with Profile Picture */}
      <View className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 pt-12">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-2xl font-bold text-gray-800">Profile</Text>
            <Text className="text-gray-600 mt-1">
              Your account information and details
            </Text>
          </View>
          {/* <TouchableOpacity 
            className="bg-blue-100 p-3 rounded-full"
            onPress={() => router.back()}
          >
            <FontAwesome name="arrow-left" size={20} color="white" />
          </TouchableOpacity> */}
        </View>
        
        {/* Profile Picture and Basic Info */}
        <View className="items-center">
          <View className="relative">
            <Image
              source={getDoctorImage()}
              className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-lg"
              style={{ width: 96, height: 96 }}
            />
            <View className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border-2 border-blue-500 flex items-center justify-center shadow-md">
              <FontAwesome name="camera" size={12} color="#3B82F6" />
            </View>
          </View>
          <Text className="text-2xl font-bold text-gray-800 mt-4">
            Dr. {profile.name}
          </Text>
          {profile.speciality && (
            <View className={`mt-2 px-4 py-2 rounded-full ${getSpecialityColor(profile.speciality)}`}>
              <Text className="text-sm font-semibold">{profile.speciality}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Profile Information Cards */}
      <View className="p-6 -mt-4">
        {/* Contact Information Card */}
        <View className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <FontAwesome name="address-card" size={16} color="#3B82F6" />
            </View>
            <Text className="text-lg font-semibold text-gray-900">Contact Information</Text>
          </View>
          
          <View className="space-y-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                <FontAwesome name="envelope" size={16} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500">Email</Text>
                <Text className="text-gray-900 font-medium">{profile.email || 'Not provided'}</Text>
              </View>
            </View>
            
            {profile.phoneNumber && (
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  <FontAwesome name="phone" size={16} color="#6B7280" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-gray-500">Phone</Text>
                  <Text className="text-gray-900 font-medium">{profile.phoneNumber}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Personal Information Card */}
        <View className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <FontAwesome name="user" size={16} color="#10B981" />
            </View>
            <Text className="text-lg font-semibold text-gray-900">Personal Information</Text>
          </View>
          
          <View className="space-y-4">
            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-gray-600 font-medium">Full Name</Text>
              <Text className="text-gray-900 font-semibold">{profile.name || 'Not provided'}</Text>
            </View>
            
            {profile.speciality && (
              <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                <Text className="text-gray-600 font-medium">Speciality</Text>
                <View className={`px-3 py-1 rounded-full ${getSpecialityColor(profile.speciality)}`}>
                  <Text className="text-sm font-semibold">{profile.speciality}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Location Information Card */}
        {(profile.city || profile.street) && (
          <View className="bg-white rounded-2xl shadow-lg p-6">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <FontAwesome name="map-marker" size={16} color="#8B5CF6" />
              </View>
              <Text className="text-lg font-semibold text-gray-900">Location</Text>
            </View>
            
            <View className="space-y-4">
              {profile.city && (
                <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                  <Text className="text-gray-600 font-medium">City</Text>
                  <Text className="text-gray-900 font-semibold">{profile.city}</Text>
                </View>
              )}
              
              {profile.street && (
                <View className="flex-row justify-between items-center py-3">
                  <Text className="text-gray-600 font-medium">Street</Text>
                  <Text className="text-gray-900 font-semibold">{profile.street}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>

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
