import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { doctorService } from "./services/api";

interface DoctorProfile {
  id: number;
  name: string;
  email: string;
  gender: string;
  phoneNumber: string;
  speciality: string;
  typeConsultation: string;
  city: string;
  street: string;
  rating: number;
  approved: number;
  picture?: string;
  balance: number;
  status: string;
}

export default function DoctorProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchDoctorProfile(id as string);
    }
  }, [id]);

  const fetchDoctorProfile = async (doctorId: string) => {
    try {
      setLoading(true);
      const response = await doctorService.getDoctorById(doctorId);
      if (response.success) {
        setDoctor(response.data);
      } else {
        setError("Failed to load doctor profile.");
      }
    } catch (err: any) {
      setError(
        err.message || "An error occurred while fetching the doctor profile."
      );
      console.error("Error fetching doctor profile:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Loading doctor profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-500 text-lg text-center">{error}</Text>
      </View>
    );
  }

  if (!doctor) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500 text-lg">Doctor not found.</Text>
      </View>
    );
  }

  type IconName =
    | "envelope"
    | "phone"
    | "map-marker"
    | "venus-mars"
    | "stethoscope"
    | "star";

  const InfoRow = ({
    icon,
    label,
    value,
  }: {
    icon: IconName;
    label: string;
    value: string;
  }) => (
    <View className="flex-row items-center mb-4 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
      <FontAwesome
        name={icon}
        size={22}
        color="#3B82F6"
        className="w-8 text-center"
      />
      <View className="ml-4 flex-1">
        <Text className="text-gray-500 text-sm font-medium">{label}</Text>
        <Text className="text-gray-800 text-base font-semibold mt-1">
          {value}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="bg-blue-500 py-10 items-center justify-center relative">
        {/* Background Overlay */}
        <View className="absolute inset-0 bg-gradient-to-t from-blue-500 to-blue-400 opacity-80" />
        {/* Back Button */}
        <TouchableOpacity
          className="absolute top-6 left-4 p-2 z-30"
          onPress={() => router.replace("/doctors")}
        >
          <FontAwesome name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <View className="items-center z-10">
          <Image
            source={
              doctor.picture
                ? { uri: doctor.picture }
                : require("../assets/doc.png")
            }
            className="w-36 h-36 rounded-full border-4 border-white shadow-xl"
            resizeMode="cover"
          />
          <Text className="text-3xl font-bold text-white mt-5">
            {doctor.name}
          </Text>
          <Text className="text-blue-200 text-lg font-medium">
            {doctor.speciality}
          </Text>
          <View className="flex-row items-center mt-3">
            <FontAwesome name="star" size={22} color="#FCD34D" />
            <Text className="ml-2 text-white text-base font-semibold">
              {doctor.rating?.toFixed(1) || "N/A"}
            </Text>
            <Text className="ml-4 text-blue-200 text-sm">
              ({doctor.status === "online" ? "Online" : "Offline"})
            </Text>
          </View>
        </View>
      </View>

      <View className="p-6 -mt-8 z-20">
        <View className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Contact Information
          </Text>
          <InfoRow icon="envelope" label="Email" value={doctor.email} />
          <InfoRow
            icon="phone"
            label="Phone Number"
            value={doctor.phoneNumber}
          />
          <InfoRow
            icon="map-marker"
            label="Location"
            value={`${doctor.city},${doctor.street}`}
          />
        </View>

        <View className="bg-white rounded-xl shadow-lg p-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            General Information
          </Text>
          <InfoRow
            icon="venus-mars"
            label="Gender"
            value={doctor.gender === "male" ? "Male" : "Female"}
          />
          <InfoRow
            icon="stethoscope"
            label="Type of Consultation"
            value={doctor.typeConsultation}
          />
        </View>
      </View>

      <View className="p-6 pt-0">
        <TouchableOpacity className="bg-blue-600 p-4 rounded-xl shadow-md flex-row items-center justify-center">
          <FontAwesome name="calendar-plus-o" size={22} color="white" />
          <Text className="text-white text-center font-semibold text-lg ml-3">
            Book Appointment
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
