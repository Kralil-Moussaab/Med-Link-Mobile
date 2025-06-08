import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { appointmentService } from "./services/api";

interface Doctor {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  speciality: string;
  city: string;
  street: string;
}

interface Appointment {
  id: number;
  doctor: Doctor;
  date: string;
  time: string;
  status: string;
}

export default function AppointmentsScreen() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndFetchAppointments();
  }, []);

  const checkAuthAndFetchAppointments = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }
      await fetchAppointments();
    } catch (error) {
      console.error("Error checking auth:", error);
      router.replace("/login");
    }
  };

  const fetchAppointments = async () => {
    try {
      const user = await AsyncStorage.getItem("user");
      if (user) {
        const userData = JSON.parse(user);
        const response = await appointmentService.getAppointmentsByUser(
          userData.id
        );
        if (response.success) {
          setAppointments(response.data);
        }
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="p-6">
        <Text className="text-2xl font-bold text-gray-800 mb-6">
          My Appointments
        </Text>

        <ScrollView className="space-y-6">
          {loading ? (
            <Text className="text-center text-gray-500">
              Loading appointments...
            </Text>
          ) : appointments.length === 0 ? (
            <Text className="text-center text-gray-500">
              No appointments found
            </Text>
          ) : (
            appointments.map((appointment) => (
              <View
                key={appointment.id}
                className="bg-white p-4 mb-2 rounded-lg border border-gray-200"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View>
                    <Text className="text-lg font-semibold text-gray-800">
                      Dr. {appointment.doctor.name}
                    </Text>
                    <Text className="text-gray-500">
                      {appointment.doctor.speciality}
                    </Text>
                  </View>
                  <View
                    className={`px-3 py-1 rounded-full ${
                      appointment.status === "upcoming"
                        ? "bg-green-100"
                        : "bg-gray-100"
                    }`}
                  >
                    <Text
                      className={`${
                        appointment.status === "upcoming"
                          ? "text-green-600"
                          : "text-gray-600"
                      } font-medium`}
                    >
                      {appointment.status}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center mt-2">
                  <FontAwesome name="calendar" size={16} color="#6B7280" />
                  <Text className="ml-2 text-gray-600">{appointment.date}</Text>
                  <FontAwesome
                    name="clock-o"
                    size={16}
                    color="#6B7280"
                    style={{ marginLeft: 16 }}
                  />
                  <Text className="ml-2 text-gray-600">{appointment.time}</Text>
                </View>

                <View className="flex-row items-center mt-2">
                  <FontAwesome name="map-marker" size={16} color="#6B7280" />
                  <Text className="ml-2 text-gray-600">
                    {appointment.doctor.city},{appointment.doctor.street}
                  </Text>

                  <FontAwesome
                    name="phone"
                    size={16}
                    color="#6B7280"
                    style={{ marginLeft: 16 }}
                  />
                  <Text className="ml-2 text-gray-600">
                    {appointment.doctor.phone_number}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}
