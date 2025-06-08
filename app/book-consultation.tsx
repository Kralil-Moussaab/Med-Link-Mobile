import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { appointmentService } from "./services/api";

interface AppointmentSlot {
  id: number;
  doctorId: number;
  userId: number | null;
  date: string;
  time: string;
  type: string;
}

interface GroupedSlots {
  [date: string]: AppointmentSlot[];
}

export default function BookConsultationScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAppointmentSlots(id as string);
    }
  }, [id]);

  const fetchAppointmentSlots = async (doctorId: string) => {
    try {
      setLoading(true);
      console.log("Fetching appointment slots for doctor ID:", doctorId);
      const response = await appointmentService.getAppointmentSlotsById(
        doctorId
      );
      console.log("API Response for slots:", JSON.stringify(response, null, 2));
      if (response.success) {
        console.log("Slots data received:", response.data);
        setSlots(response.data || []);
      } else {
        setError("Failed to load appointment slots.");
        console.error("API response success was false:", response.error);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching slots.");
      console.error("Error fetching slots:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAppointment = async () => {
    if (!selectedSlot || !id) {
      Alert.alert("Selection Error", "Please select a slot to book.");
      return;
    }

    try {
      setApproving(true);
      const userId = await AsyncStorage.getItem("user");
      if (!userId) {
        Alert.alert("Authentication Error", "User not logged in.");
        return;
      }
      const parsedUser = JSON.parse(userId);

      console.log("Attempting to approve appointment with:", {
        appointmentId: selectedSlot,
        userId: parsedUser.id,
      });

      const response = await appointmentService.approveAppointment(
        selectedSlot.toString(),
        parsedUser.id
      );
      if (response.success) {
        Alert.alert("Success", "Appointment booked successfully!");
        router.replace(`/doctor-profile?id=${id}`);
      } else {
        Alert.alert(
          "Booking Failed",
          response.error || "An error occurred during booking."
        );
      }
    } catch (err: any) {
      Alert.alert(
        "Booking Error",
        err.message || "An unexpected error occurred."
      );
      console.error("Error approving appointment:", err);
    } finally {
      setApproving(false);
    }
  };

  const groupedSlots = slots.reduce<GroupedSlots>((acc, slot) => {
    const date = slot.date; 
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {});

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Loading available slots...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-red-500 text-lg text-center">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <TouchableOpacity
        className="absolute top-6 left-4 p-2 mb-5 z-10"
        onPress={() => router.replace(`/doctor-profile?id=${id}`)}
      >
        <FontAwesome name="arrow-left" size={24} color="#3B82F6" />
      </TouchableOpacity>

      <ScrollView className="flex-1 p-6 pt-16 mt-3">
        {Object.keys(groupedSlots).length === 0 ? (
          <View className="flex-1 justify-center items-center py-8">
            <FontAwesome
              name="calendar-times-o"
              size={60}
              color="#9CA3AF"
              className="mb-4"
            />
            <Text className="text-gray-500 text-lg">
              No available slots for this doctor.
            </Text>
          </View>
        ) : (
          Object.keys(groupedSlots).map((date) => (
            <View
              key={date}
              className="mb-6 p-4 bg-white rounded-2xl shadow-lg border border-gray-100"
            >
              <View className="flex-row items-center mb-4 pb-2 border-b border-gray-200">
                <FontAwesome
                  name="calendar"
                  size={20}
                  color="#3B82F6"
                  className="mr-3"
                />
                <Text className="text-xl font-bold text-gray-800">
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
              <View className="flex-row flex-wrap justify-between pt-2">
                {groupedSlots[date].map((slot) => (
                  <TouchableOpacity
                    key={slot.id}
                    className={`w-[48%] p-4 rounded-xl mb-4 shadow-xl border ${
                      selectedSlot === slot.id
                        ? "bg-blue-100 border-blue-700"
                        : "bg-white border-gray-100"
                    }`}
                    onPress={() => setSelectedSlot(slot.id)}
                  >
                    <View className="flex-row items-center justify-center">
                      <FontAwesome name="clock-o" size={18} color="#4B5563" />
                      <Text className="ml-2 text-gray-800 text-lg font-semibold text-center">
                        {slot.time}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View className="p-6 pt-0">
        <TouchableOpacity
          className={`p-4 rounded-lg ${
            selectedSlot ? "bg-blue-600" : "bg-gray-400"
          } ${approving ? "opacity-70" : ""}`}
          onPress={handleApproveAppointment}
          disabled={!selectedSlot || approving}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {approving ? "Booking..." : "Book Selected Slot"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
