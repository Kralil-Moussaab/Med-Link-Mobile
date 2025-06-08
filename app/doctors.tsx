import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { doctorService } from "./services/api";

interface Doctor {
  id: number;
  name: string;
  speciality: string;
  city: string;
  gender: string;
  status: string;
  rating: number;
  picture?: string;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const specialties = [
  "Dentistry",
  "Genralist",
  "Cardiologist",
  "Neurologist",
  "ENT",
  "Dermatologist",
  "Gynecologist",
  "Orthopedic",
  "Pediatrician",
  "Ophthalmologist",
  "Psychiatrist",
  "Urologist",
];

export default function DoctorsScreen() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  useEffect(() => {
    checkAuthAndLoadDoctors();
  }, []);

  const checkAuthAndLoadDoctors = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }
      await loadDoctors();
    } catch (error) {
      console.error("Error checking auth:", error);
      router.replace("/login");
    }
  };

  const loadDoctors = async (page = 1, customParams?: any) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // Create API parameters
      const params: any = customParams || {
        page,
      };

      // If no custom params, add filters
      if (!customParams) {
        // Add search query if exists
        if (searchQuery) {
          params.name = searchQuery;
        }

        // Add gender filter if not "all"
        if (selectedGender !== "all") {
          params.gender = selectedGender;
        }

        // Add specialty filter if selected and not "All Specialties"
        if (selectedSpecialty && selectedSpecialty !== "All Specialties") {
          params.speciality = selectedSpecialty;
        }
      }

      console.log("Current specialty state:", selectedSpecialty); // Debug log
      console.log("API Parameters:", params); // Debug log

      const response = await doctorService.listDoctors(params);

      if (page === 1) {
        setDoctors(response.data || []);
      } else {
        setDoctors((prev) => [...prev, ...(response.data || [])]);
      }

      setPagination(
        response.meta || {
          current_page: page,
          last_page: 1,
          per_page: 10,
          total: 0,
        }
      );
    } catch (error) {
      console.error("Error loading doctors:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current_page: 1 }));
    loadDoctors(1);
  };

  const handleGenderChange = (gender: string) => {
    console.log("Previous gender:", selectedGender); // Debug log
    console.log("New gender:", gender); // Debug log

    // Update the gender state
    setSelectedGender(gender);

    // Reset pagination
    setPagination((prev) => ({ ...prev, current_page: 1 }));

    // Create API parameters
    const params: any = {
      page: 1,
    };

    // Add gender filter if not "all"
    if (gender !== "all") {
      params.gender = gender;
    }

    // Add search query if exists
    if (searchQuery) {
      params.name = searchQuery;
    }

    // Add specialty filter if selected and not "All Specialties"
    if (selectedSpecialty && selectedSpecialty !== "All Specialties") {
      params.speciality = selectedSpecialty;
    }

    console.log("API Parameters:", params); // Debug log

    // Load doctors with the new gender
    loadDoctors(1, params);
  };

  const handleSpecialtyChange = (specialty: string) => {
    console.log("Previous specialty:", selectedSpecialty); // Debug log
    console.log("New specialty:", specialty); // Debug log

    // Update the specialty state
    setSelectedSpecialty(specialty);

    // Reset pagination
    setPagination((prev) => ({ ...prev, current_page: 1 }));

    // Create API parameters
    const params: any = {
      page: 1,
    };

    // Add specialty filter if selected and not "All Specialties"
    if (specialty && specialty !== "All Specialties") {
      params.speciality = specialty;
    }

    // Add search query if exists
    if (searchQuery) {
      params.name = searchQuery;
    }

    // Add gender filter if not "all"
    if (selectedGender !== "all") {
      params.gender = selectedGender;
    }

    console.log("API Parameters:", params); // Debug log

    // Load doctors with the new specialty
    loadDoctors(1, params);
  };

  const loadMoreDoctors = () => {
    if (!loadingMore && pagination.current_page < pagination.last_page) {
      loadDoctors(pagination.current_page + 1);
    }
  };

  // Remove client-side filtering since we're using server-side filtering
  const displayDoctors = doctors;

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="p-4 flex-1">
        <Text className="text-2xl font-bold text-gray-800 mb-4">
          Find a Doctor
        </Text>

        {/* Search Bar */}
        <View className="bg-gray-100 rounded-lg p-3 flex-row items-center mb-4">
          <FontAwesome name="search" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-2 text-gray-700"
            placeholder="Search doctors..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>

        {/* Specialty Picker */}
        <View className="bg-gray-100 rounded-lg mb-4">
          <Picker
            selectedValue={selectedSpecialty}
            onValueChange={handleSpecialtyChange}
            style={{ height: 50 }}
          >
            <Picker.Item label="All Specialties" value="All Specialties" />
            {specialties.map((specialty) => (
              <Picker.Item
                key={specialty}
                label={specialty}
                value={specialty}
              />
            ))}
          </Picker>
        </View>

        {/* Gender Filter Buttons */}
        <View className="flex-row mb-4">
          <TouchableOpacity
            className={`flex-1 px-3 py-2 rounded-lg mr-2 ${
              selectedGender === "all" ? "bg-blue-500" : "bg-gray-200"
            }`}
            onPress={() => handleGenderChange("all")}
          >
            <Text
              className={`text-center font-medium ${
                selectedGender === "all" ? "text-white" : "text-gray-600"
              }`}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 px-3 py-2 rounded-lg mr-2 ${
              selectedGender === "male" ? "bg-blue-500" : "bg-gray-200"
            }`}
            onPress={() => handleGenderChange("male")}
          >
            <Text
              className={`text-center font-medium ${
                selectedGender === "male" ? "text-white" : "text-gray-600"
              }`}
            >
              Male
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 px-3 py-2 rounded-lg ${
              selectedGender === "female" ? "bg-blue-500" : "bg-gray-200"
            }`}
            onPress={() => handleGenderChange("female")}
          >
            <Text
              className={`text-center font-medium ${
                selectedGender === "female" ? "text-white" : "text-gray-600"
              }`}
            >
              Female
            </Text>
          </TouchableOpacity>
        </View>

        {/* Doctors List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } =
              nativeEvent;
            const paddingToBottom = 20;
            if (
              layoutMeasurement.height + contentOffset.y >=
              contentSize.height - paddingToBottom
            ) {
              loadMoreDoctors();
            }
          }}
          scrollEventThrottle={400}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 10 }}
        >
          {displayDoctors.length === 0 ? (
            <View className="flex-1 justify-center items-center py-8">
              <Text className="text-gray-500 text-lg">No doctors found</Text>
            </View>
          ) : (
            displayDoctors.map((doctor) => (
              <TouchableOpacity
                key={doctor.id}
                className="bg-white p-4 rounded-xl border border-gray-100 mb-4 shadow-sm"
              >
                <View className="flex-row">
                  {/* Doctor Image */}
                  <View className="mr-4">
                    <Image
                      source={
                        doctor.picture
                          ? { uri: doctor.picture }
                          : require("../assets/doc.png")
                      }
                      className="w-16 h-16 rounded-full"
                      resizeMode="cover"
                    />
                  </View>

                  <View className="flex-1">
                    <View className="flex-row justify-between items-start">
                      <View>
                        <Text className="text-lg font-semibold text-gray-800">
                          {doctor.name}
                        </Text>
                        <Text className="text-gray-500">
                          {doctor.speciality}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        {/* Status */}
                        <View className="flex-row items-center mr-3">
                          <View
                            className={`w-2 h-2 rounded-full mr-1 ${
                              doctor.status === "online"
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }`}
                          />
                          <Text className="text-sm text-gray-600">
                            {doctor.status === "online" ? "Online" : "Offline"}
                          </Text>
                        </View>
                        {/* Rating */}
                        <View className="flex-row items-center">
                          <FontAwesome name="star" size={16} color="#FCD34D" />
                          <Text className="ml-1 text-gray-600">
                            {doctor.rating?.toFixed(1) || "N/A"}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View className="flex-row items-center mt-2">
                      <FontAwesome
                        name="map-marker"
                        size={16}
                        color="#6B7280"
                      />
                      <Text className="ml-2 text-gray-600">{doctor.city}</Text>
                      <FontAwesome
                        name="user-md"
                        size={16}
                        color="#6B7280"
                        style={{ marginLeft: 16 }}
                      />
                      <Text className="ml-2 text-gray-600">
                        {doctor.gender === "male" ? "Male" : "Female"}
                      </Text>
                    </View>

                    <TouchableOpacity className="bg-blue-500 p-3 rounded-lg mt-4">
                      <Text className="text-white text-center font-semibold">
                        Book Appointment
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}

          {/* Loading More Indicator */}
          {loadingMore && (
            <View className="py-4">
              <ActivityIndicator size="small" color="#3B82F6" />
            </View>
          )}

          {/* End of List Message */}
          {!loadingMore && pagination.current_page >= pagination.last_page && (
            <Text className="text-center text-gray-500 py-4">
              No more doctors to load
            </Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
