import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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
const UPLOADS_URL = "http://192.168.210.217:8000";

interface ChatMessage {
  id: number;
  session_id: number;
  sender_type: string;
  message: string;
  created_at: string;
  updated_at: string;
}

interface DoctorInfo {
  name: string;
  speciality: string;
  picture?: string;
}

export default function ChatDetailScreen() {
  const { sessionId } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);

  useEffect(() => {
    const fetchChatData = async () => {
      if (!sessionId) {
        setError("Session ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const id = Array.isArray(sessionId) ? sessionId[0] : sessionId;

        // First get the chat messages
        const chatResponse = await chatService.getDoctorChat(id as string);
        if (chatResponse) {
          setMessages(chatResponse);
        }

        // Then get the doctor info from the saved doctors list
        const savedDoctorsResponse = await chatService.getDoctorSaved();
        if (savedDoctorsResponse.success && savedDoctorsResponse.data.session) {
          const currentSession = savedDoctorsResponse.data.session.find(
            (session: any) => session.id.toString() === id
          );
          if (currentSession?.doctor) {
            setDoctorInfo({
              name: currentSession.doctor.name,
              speciality: currentSession.doctor.speciality,
              picture: currentSession.doctor.picture,
            });
          }
        }
      } catch (err: any) {
        console.error("Error fetching chat data:", err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();
  }, [sessionId]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Loading chat...</Text>
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

  if (messages.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 p-6">
        <FontAwesome name="frown-o" size={60} color="#9CA3AF" />
        <Text className="mt-6 text-gray-600 text-xl font-semibold mb-2">
          No Messages
        </Text>
        <Text className="text-gray-500 text-center">
          This chat session has no messages.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
        <TouchableOpacity
          onPress={() => router.push("/my-chats")}
          className="mr-4"
        >
          <FontAwesome name="arrow-left" size={24} color="#3B82F6" />
        </TouchableOpacity>
        <Image
          source={
            doctorInfo?.picture
              ? { uri: `${UPLOADS_URL}/storage/${doctorInfo.picture}` }
              : require("../assets/doc.png")
          }
          className="w-10 h-10 rounded-full mr-3"
          style={{ width: 40, height: 40, borderRadius: 20 }}
          onError={(error) => {
            console.log("Image loading error:", error.nativeEvent);
            console.log(
              "Attempted URL:",
              `${UPLOADS_URL}/storage/${doctorInfo?.picture}`
            );
          }}
        />
        <View>
          <Text className="text-xl font-bold text-gray-800">
            Dr. {doctorInfo?.name || "Chat"}
          </Text>
          <Text className="text-sm text-gray-500">
            {doctorInfo?.speciality || "Loading..."}
          </Text>
        </View>
      </View>
      <FlatList
        data={messages.sort((a, b) => a.id - b.id)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 16,
              marginBottom: 8,
            }}
          >
            {item.sender_type === "user" ? <View style={{ flex: 1 }} /> : null}
            <View
              style={{
                backgroundColor:
                  item.sender_type === "user" ? "#3B82F6" : "#E5E7EB",
                padding: 12,
                borderRadius: 12,
                maxWidth: "80%",
                marginLeft: item.sender_type === "user" ? "auto" : 0,
                marginRight: item.sender_type === "user" ? 0 : "auto",
              }}
            >
              <Text
                style={{
                  color: item.sender_type === "user" ? "white" : "#1F2937",
                }}
              >
                {item.message}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  marginTop: 4,
                  color: item.sender_type === "user" ? "#EFF6FF" : "#6B7280",
                }}
              >
                {new Date(item.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
            {item.sender_type === "doctor" ? (
              <View style={{ flex: 1 }} />
            ) : null}
          </View>
        )}
        contentContainerStyle={{ paddingVertical: 10 }}
      />
    </View>
  );
}
