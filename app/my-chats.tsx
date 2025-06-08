import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { chatService } from "./services/api";

// Get the base URL from the API configuration
const API_URL = "http://192.168.1.106:8000/api/v1";
const UPLOADS_URL = "http://192.168.1.106:8000";

interface DoctorSession {
  id: string;
  user_id: number;
  doctor_id: number;
  start_at: string;
  ended_at: string;
  created_at: string;
  updated_at: string;
  doctor: {
    id: number;
    name: string;
    email: string;
    gender: string;
    phone_number: string;
    speciality: string;
    type_consultation: string;
    city: string;
    street: string;
    rating: number;
    picture?: string;
    balance: number;
    approved: number;
    status: string;
    created_at: string;
    updated_at: string;
  };
}

// Ensure that '/chat-detail' is included in the AppRoute type
type AppRoute = "/doctors" | "/appointments" | "/chat-detail" | string;
type IconName =
  | "calendar"
  | "user-md"
  | "search"
  | "clock-o"
  | "comments-o"
  | "chevron-right";

export default function MyChatsScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctorSessions, setDoctorSessions] = useState<DoctorSession[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchDoctorSessions = async () => {
      try {
        setLoading(true);
        const response = await chatService.getDoctorSaved();
        if (response.success && response.data && response.data.session) {
          console.log(
            "Doctor picture URL:",
            response.data.session[0]?.doctor?.picture
          );
          setDoctorSessions(response.data.session);
        }
      } catch (err: any) {
        console.error("Error fetching doctor sessions:", err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorSessions();
  }, []);

  const handleDoctorPress = (sessionId: string) => {
    router.push({
      pathname: "/chat-detail",
      params: { sessionId: sessionId },
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Loading chats...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 p-6">
        <Text className="text-red-500 text-lg text-center font-semibold mb-4">
          Error:
        </Text>
        <Text className="text-gray-700 text-center">{error}</Text>
        <TouchableOpacity
          className="mt-6 bg-blue-500 px-6 py-3 rounded-lg shadow-md"
          onPress={() => setError(null)}
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (doctorSessions.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 p-6">
        <FontAwesome name="comments-o" size={60} color="#9CA3AF" />
        <Text className="mt-6 text-gray-600 text-xl font-semibold mb-2">
          No Saved Chats
        </Text>
        <Text className="text-gray-500 text-center">
          You haven't had any saved chat sessions yet.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <FlatList
        data={doctorSessions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white p-4 mx-4 my-2 rounded-lg shadow-sm flex-row items-center"
            onPress={() => handleDoctorPress(item.id.toString())}
          >
            <Image
              source={
                item.doctor.picture
                  ? { uri: `${UPLOADS_URL}/storage/${item.doctor.picture}` }
                  : require("../assets/doc.png")
              }
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "#f0f0f0",
              }}
              onError={(error) => {
                console.log("Image loading error:", error.nativeEvent);
                console.log(
                  "Attempted URL:",
                  `${UPLOADS_URL}/storage/${item.doctor.picture}`
                );
              }}
            />
            <View className="flex-1 ml-4">
              <Text className="text-lg font-bold text-gray-800">
                Dr. {item.doctor.name}
              </Text>
              <Text className="text-gray-600">{item.doctor.speciality}</Text>
              <Text className="text-gray-500 text-sm">
                Last chat: {new Date(item.updated_at).toLocaleDateString()}
              </Text>
            </View>
            <FontAwesome name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingVertical: 10 }}
      />
    </View>
  );
}
