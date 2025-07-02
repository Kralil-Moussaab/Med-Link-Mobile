import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useAuth } from "./context/AuthContext";
import { appointmentService, userService } from "./services/api";

interface Appointment {
  id: string;
  patientName: string;
  date: string;
  time: string;
  status: string;
  email: string;
  phoneNumber: string;
  chronicDisease: string;
  groupage: string;
}

interface AppointmentSlot {
  id: string;
  date: string;
  time: string;
}

export default function DoctorAppointmentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AppointmentSlot[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [showDeleteSlotModal, setShowDeleteSlotModal] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState<AppointmentSlot | null>(null);
  const [deletingSlot, setDeletingSlot] = useState(false);
  const [addingSlot, setAddingSlot] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [appointmentData, setAppointmentData] = useState({
    date: "",
    timeSlots: [""],
  });

  const fetchApprovedAppointments = async () => {
    try {
      setLoadingAppointments(true);
      if (!user?.id) {
        console.error("No user ID found");
        return;
      }
      
      const response = await appointmentService.getDoctorAppointments(user.id);
      console.log("Appointments Response:", response);

      if (response.success && response.data) {
        // Handle the nested data structure: response.data.data
        const appointmentsData = response.data.data || response.data.appointments || [];
        
        console.log("Raw appointments data:", appointmentsData);
        console.log("First appointment object:", appointmentsData[0]);
        
        if (!Array.isArray(appointmentsData)) {
          console.error("Invalid appointments data format - not an array:", appointmentsData);
          Alert.alert("Error", "Invalid appointments data format");
          return;
        }

        const formattedAppointments = await Promise.all(
          appointmentsData.map(async (appointment: any, index: number) => {
            console.log(`Processing appointment ${index}:`, appointment);
            console.log(`Appointment ${index} keys:`, Object.keys(appointment));
            
            // Fetch patient details using userId
            let patientData = null;
            if (appointment.userId) {
              try {
                const patientResponse = await userService.getUserById(appointment.userId.toString());
                if (patientResponse.success) {
                  patientData = patientResponse.data;
                  console.log(`Patient data for appointment ${index}:`, patientData);
                  console.log(`Patient data keys:`, Object.keys(patientData));
                  console.log(`Patient chronicDisease:`, patientData.chronicDisease);
                  console.log(`Patient phone_number:`, patientData.phone_number);
                  console.log(`Patient phoneNumber:`, patientData.phoneNumber);
                }
              } catch (error) {
                console.error(`Error fetching patient data for appointment ${index}:`, error);
              }
            }
            
            return {
              id: appointment.id || `appointment-${index}`,
              patientName: patientData?.name || "Unknown Patient",
              date: appointment.date,
              time: appointment.time,
              status: "Upcoming",
              email: patientData?.email || "No email provided",
              phoneNumber: patientData?.phone_number || patientData?.phoneNumber || "No phone provided",
              chronicDisease: patientData?.chronicDisease || patientData?.chronic_disease || "No chronic disease",
              groupage: patientData?.groupage || "No blood type",
            };
          })
        );

        console.log("Formatted appointments:", formattedAppointments);
        setAppointments(formattedAppointments);
      } else {
        console.error("API Error Response:", response);
        Alert.alert("Error", response.error || "Failed to load appointments");
      }
    } catch (error) {
      console.error("Error in fetchApprovedAppointments:", error);
      Alert.alert("Error", "Failed to load appointments. Please try again later.");
    } finally {
      setLoadingAppointments(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!user?.id) return;

    try {
      setLoadingSlots(true);
      const response = await appointmentService.getAppointmentSlotsById(user.id);
      console.log("Slots Response:", response);
      
      if (response.success && response.data) {
        setAvailableSlots(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch available slots:", error);
      Alert.alert("Error", "Failed to load available slots. Please try again later.");
    } finally {
      setLoadingSlots(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchApprovedAppointments(), fetchAvailableSlots()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchApprovedAppointments();
    fetchAvailableSlots();
  }, []);

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesFilter = activeFilter === "all" || 
      appointment.status.toLowerCase() === activeFilter.toLowerCase();
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  console.log("Appointments state:", appointments);
  console.log("Filtered appointments:", filteredAppointments);
  console.log("Loading appointments:", loadingAppointments);

  const handleAddTimeSlot = () => {
    setAppointmentData({
      ...appointmentData,
      timeSlots: [...appointmentData.timeSlots, ""],
    });
  };

  const handleRemoveTimeSlot = (index: number) => {
    const newTimeSlots = appointmentData.timeSlots.filter((_, i) => i !== index);
    setAppointmentData({
      ...appointmentData,
      timeSlots: newTimeSlots,
    });
  };

  const handleTimeSlotChange = (index: number, value: string) => {
    const newTimeSlots = [...appointmentData.timeSlots];
    newTimeSlots[index] = value;
    setAppointmentData({
      ...appointmentData,
      timeSlots: newTimeSlots,
    });
  };

  const handleAddAppointment = async () => {
    if (!appointmentData.date || appointmentData.timeSlots.some((slot) => !slot)) {
      Alert.alert("Error", "Please fill in all appointment details");
      return;
    }

    if (!user?.id) {
      Alert.alert("Error", "Doctor ID not found. Please try logging in again.");
      return;
    }

    setAddingSlot(true);

    try {
      const requestData = {
        doctorId: user.id,
        date: appointmentData.date,
        timeSlots: appointmentData.timeSlots,
      };
      
      console.log("Sending appointment data:", requestData);
      
      const result = await appointmentService.addAppointmentSlots(user.id, {
        date: appointmentData.date,
        timeSlots: appointmentData.timeSlots,
      });

      console.log("Add appointment result:", result);

      if (result.success) {
        await fetchAvailableSlots();
        setAppointmentData({ date: "", timeSlots: [""] });
        setShowAddSlotModal(false);
        Alert.alert("Success", "Appointment slots added successfully!");
      } else {
        Alert.alert("Error", result.error || "Failed to add appointment slots");
      }
    } catch (error) {
      console.error("Error adding appointment slots:", error);
      Alert.alert("Error", "An error occurred while adding appointment slots");
    } finally {
      setAddingSlot(false);
    }
  };

  const handleDeleteSlot = (slot: AppointmentSlot) => {
    setSlotToDelete(slot);
    setShowDeleteSlotModal(true);
  };

  const confirmDeleteSlot = async () => {
    if (!slotToDelete) return;

    setDeletingSlot(true);

    try {
      const result = await appointmentService.deletAppointment(slotToDelete.id);

      if (result.success) {
        setAvailableSlots(availableSlots.filter(slot => slot.id !== slotToDelete.id));
        Alert.alert("Success", "Slot deleted successfully!");
        setShowDeleteSlotModal(false);
        setSlotToDelete(null);
      } else {
        Alert.alert("Error", result.error || "Failed to delete slot");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while deleting the slot");
      console.error(error);
    } finally {
      setDeletingSlot(false);
    }
  };

  const renderAppointmentCard = ({ item }: { item: Appointment }) => (
    <View className="bg-white rounded-2xl shadow-lg p-4 mb-4 mx-4">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mr-4">
            <FontAwesome name="user" size={24} color="#3B82F6" />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-semibold text-gray-900">{item.patientName}</Text>
            <View className={`px-3 py-1 rounded-full self-start mt-1 ${
              item.status === "Upcoming" ? "bg-green-100" : "bg-gray-100"
            }`}>
              <Text className={`text-sm font-medium ${
                item.status === "Upcoming" ? "text-green-700" : "text-gray-700"
              }`}>
                {item.status}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Medical Information */}
      <View className="flex-row flex-wrap gap-2 mb-4">
        <View className="flex-row items-center bg-red-50 px-3 py-1.5 rounded-lg">
          <FontAwesome name="tint" size={14} color="#DC2626" />
          <Text className="text-sm font-medium text-red-600 ml-2">
            Blood Group: {item.groupage}
          </Text>
        </View>
        <View className="flex-row items-center bg-purple-50 px-3 py-1.5 rounded-lg">
          <FontAwesome name="heart" size={14} color="#7C3AED" />
          <Text className="text-sm font-medium text-purple-600 ml-2">
            Chronic Disease: {item.chronicDisease}
          </Text>
        </View>
      </View>

      {/* Contact Information */}
      <View className="space-y-2 mb-4">
        <View className="flex-row items-center">
          <FontAwesome name="envelope" size={16} color="#6B7280" />
          <Text className="text-gray-600 ml-3 flex-1">{item.email}</Text>
        </View>
        <View className="flex-row items-center">
          <FontAwesome name="phone" size={16} color="#6B7280" />
          <Text className="text-gray-600 ml-3 flex-1">{item.phoneNumber}</Text>
        </View>
      </View>

      {/* Date and Time */}
      <View className="flex-row justify-center space-x-4">
        <View className="flex-row items-center bg-gray-50 px-4 py-2 rounded-xl">
          <FontAwesome name="calendar" size={16} color="#3B82F6" />
          <Text className="text-sm font-medium text-gray-600 ml-2">
            {new Date(item.date).toLocaleDateString("en-GB")}
          </Text>
        </View>
        <View className="flex-row items-center bg-gray-50 px-4 py-2 rounded-xl">
          <FontAwesome name="clock-o" size={16} color="#3B82F6" />
          <Text className="text-sm font-medium text-gray-600 ml-2">
            {item.time}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderSlotCard = ({ item }: { item: AppointmentSlot }) => (
    <View className="bg-gray-50 rounded-lg p-4 mb-3">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-row items-center">
          <FontAwesome name="calendar" size={16} color="#3B82F6" />
          <Text className="font-medium text-gray-900 ml-2">
            {new Date(item.date).toLocaleDateString("en-GB")}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteSlot(item)}
          className="text-red-500"
        >
          <FontAwesome name="trash" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
      <View className="flex-row items-center">
        <FontAwesome name="clock-o" size={16} color="#3B82F6" />
        <Text className="text-blue-600 ml-2 font-medium">{item.time}</Text>
      </View>
    </View>
  );

  if (loadingAppointments && loadingSlots) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Loading appointments...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3B82F6"]} />
    }>
      {/* Header */}
      <View className="bg-white p-6 pt-12 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-800">Appointments</Text>
            <Text className="text-gray-600 mt-1">
              Manage your appointments and available slots
            </Text>
          </View>
          <TouchableOpacity 
            className="bg-blue-100 p-3 rounded-full"
            onPress={() => router.back()}
          >
            <FontAwesome name="arrow-left" size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="p-6">
        {/* Available Slots Section */}
        <View className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-900">Available Slots</Text>
            <TouchableOpacity
              className="bg-blue-500 px-3 py-1.5 rounded-lg"
              onPress={() => setShowAddSlotModal(true)}
            >
              <Text className="text-white font-medium text-sm">Add Slots</Text>
            </TouchableOpacity>
          </View>

          {loadingSlots ? (
            <View className="items-center py-4">
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text className="text-gray-500 mt-2">Loading slots...</Text>
            </View>
          ) : availableSlots.length > 0 ? (
            <FlatList
              data={availableSlots}
              renderItem={renderSlotCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <Text className="text-center text-gray-500 py-4">
              No available slots found
            </Text>
          )}
        </View>

        {/* Appointments Section */}
        <View className="bg-white rounded-xl shadow-sm p-6">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-xl font-bold text-gray-900">Scheduled Appointments</Text>
              <Text className="text-gray-500 text-sm mt-1">
                {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''} scheduled
              </Text>
            </View>
          </View>
          
          {loadingAppointments ? (
            <View className="items-center py-12">
              <View className="bg-blue-50 rounded-full p-4 mb-4">
                <ActivityIndicator size="large" color="#3B82F6" />
              </View>
              <Text className="text-gray-600 font-medium">Loading appointments...</Text>
              <Text className="text-gray-400 text-sm mt-1">Please wait while we fetch your schedule</Text>
            </View>
          ) : filteredAppointments.length > 0 ? (
            <View className="space-y-4">
              {filteredAppointments.map((appointment, index) => (
                <View 
                  key={appointment.id}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm"
                  style={{
                    shadowColor: "#3B82F6",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  {/* Header with patient info */}
                  <View className="flex-row items-start justify-between mb-4">
                    <View className="flex-row items-center flex-1">
                      <View className="relative">
                        <View className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                          <FontAwesome name="user" size={24} className="mt-4 mr-1" color="gray" />
                        </View>
                      </View>
                      <View className="ml-4 flex-1">
                        <Text className="text-xl font-bold text-gray-900">{appointment.patientName}</Text>
                        <View className="flex-row items-center mt-1">
                          <View className="bg-green-100 px-2 py-1 rounded-full">
                            <Text className="text-green-700 text-xs font-medium">Confirmed</Text>
                          </View>
                          <Text className="text-gray-500 text-sm ml-2">• {appointment.email}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Medical Information Cards */}
                  <View className="flex-row flex-wrap gap-2 mb-4">
                    <View className="flex-row items-center bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
                      <FontAwesome name="tint" size={14} color="#DC2626" />
                      <Text className="text-sm font-semibold text-red-700 ml-2">
                        {appointment.groupage}
                      </Text>
                    </View>
                    <View className="flex-row items-center bg-purple-50 border border-purple-100 px-3 py-2 rounded-xl">
                      <FontAwesome name="heart" size={14} color="#7C3AED" />
                      <Text className="text-sm font-semibold text-purple-700 ml-2">
                        {appointment.chronicDisease}
                      </Text>
                    </View>
                  </View>

                  {/* Contact Information */}
                  <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
                    <View className="space-y-3">
                      <View className="flex-row items-center">
                        <View className="bg-blue-100 p-2 rounded-lg">
                          <FontAwesome name="envelope" size={14} color="#3B82F6" />
                        </View>
                        <Text className="text-gray-700 ml-3 flex-1 font-medium">{appointment.email}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <View className="bg-green-100 p-2 rounded-lg">
                          <FontAwesome name="phone" size={14} color="#10B981" />
                        </View>
                        <Text className="text-gray-700 ml-3 flex-1 font-medium">{appointment.phoneNumber}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Date and Time Section */}
                  <View className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <View className="bg-gray/20 p-2 rounded-lg">
                          <FontAwesome name="calendar" size={16} color="black" />
                        </View>
                        <View className="ml-3">
                          <Text className="text-white/80 text-sm font-medium">Appointment Date</Text>
                          <Text className="text-gray font-bold text-lg">
                            {new Date(appointment.date).toLocaleDateString("en-GB", {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center">
                        <View className="bg-white/20 p-2 rounded-lg">
                          <FontAwesome name="clock-o" size={16} color="gary" />
                        </View>
                        <View className="ml-2">
                          <Text className="text-white/80 text-sm font-medium">Time</Text>
                          <Text className="text-gray font-bold text-lg">{appointment.time}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="items-center py-16">
              <View className="bg-gray-50 rounded-full p-6 mb-6">
                <FontAwesome name="calendar" size={48} color="#D1D5DB" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">
                No Appointments Found
              </Text>
              <Text className="text-gray-500 text-center max-w-xs">
                You don't have any appointments scheduled at the moment. 
                Add some available slots to start receiving bookings.
              </Text>
              <TouchableOpacity 
                className="mt-6 bg-blue-500 px-6 py-3 rounded-xl"
                onPress={() => setShowAddSlotModal(true)}
              >
                <Text className="text-white font-semibold">Add Available Slots</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Add Slot Modal */}
      <Modal
        visible={showAddSlotModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddSlotModal(false)}
      >
        <View className="flex-1 bg-black/30 justify-center items-center p-4">
          <View className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-semibold text-gray-900">Add Appointment Slots</Text>
              <TouchableOpacity onPress={() => setShowAddSlotModal(false)}>
                <FontAwesome name="times" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Date</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="border border-gray-300 rounded-lg p-3 flex-row justify-between items-center"
                >
                  <Text className={appointmentData.date ? "text-gray-900" : "text-gray-500"}>
                    {appointmentData.date || "Select Date"}
                  </Text>
                  <FontAwesome name="calendar" size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Time Slots</Text>
                {appointmentData.timeSlots.map((slot, index) => (
                  <View key={index} className="flex-row items-center mb-2">
                    <TouchableOpacity
                      onPress={() => {
                        setCurrentTimeIndex(index);
                        setShowTimePicker(true);
                      }}
                      className="flex-1 border border-gray-300 rounded-lg p-3 flex-row justify-between items-center mr-2"
                    >
                      <Text className={slot ? "text-gray-900" : "text-gray-500"}>
                        {slot || "Select Time"}
                      </Text>
                      <FontAwesome name="clock-o" size={16} color="#6B7280" />
                    </TouchableOpacity>
                    {appointmentData.timeSlots.length > 1 && (
                      <TouchableOpacity
                        onPress={() => handleRemoveTimeSlot(index)}
                        className="p-2"
                      >
                        <FontAwesome name="times" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                <TouchableOpacity
                  onPress={handleAddTimeSlot}
                  className="mt-2"
                >
                  <Text className="text-blue-500 font-medium">+ Add Time Slot</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row justify-end space-x-3 mt-6">
              <TouchableOpacity
                onPress={() => setShowAddSlotModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <Text className="text-gray-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddAppointment}
                disabled={addingSlot}
                className={`px-4 py-2 bg-blue-500 rounded-lg ${addingSlot ? 'opacity-50' : ''}`}
              >
                <Text className="text-white font-medium">
                  {addingSlot ? "Adding..." : "Add Slots"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Slot Modal */}
      <Modal
        visible={showDeleteSlotModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteSlotModal(false)}
      >
        <View className="flex-1 bg-black/30 justify-center items-center p-4">
          <View className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-semibold text-gray-900">Confirm Delete Slot</Text>
              <TouchableOpacity onPress={() => {
                setShowDeleteSlotModal(false);
                setSlotToDelete(null);
              }}>
                <FontAwesome name="times" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text className="text-gray-600 mb-4">
              Are you sure you want to delete this available slot?
            </Text>
            
            {slotToDelete && (
              <View className="bg-gray-50 rounded-lg p-4 space-y-2 mb-4">
                <View className="flex-row items-center">
                  <FontAwesome name="calendar" size={16} color="#6B7280" />
                  <Text className="text-gray-600 ml-2">
                    {new Date(slotToDelete.date).toLocaleDateString("en-GB")}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <FontAwesome name="clock-o" size={16} color="#6B7280" />
                  <Text className="text-gray-600 ml-2">{slotToDelete.time}</Text>
                </View>
              </View>
            )}
            
            <Text className="text-sm text-red-600 mb-4">
              This action cannot be undone.
            </Text>

            <View className="flex-row justify-end space-x-3">
              <TouchableOpacity
                onPress={() => {
                  setShowDeleteSlotModal(false);
                  setSlotToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <Text className="text-gray-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDeleteSlot}
                disabled={deletingSlot}
                className={`px-4 py-2 bg-red-500 rounded-lg ${deletingSlot ? 'opacity-50' : ''}`}
              >
                <Text className="text-white font-medium">
                  {deletingSlot ? "Deleting..." : "Delete Slot"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={appointmentData.date ? new Date(appointmentData.date) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (event.type === 'set' && selectedDate) {
              const dateString = selectedDate.toISOString().split('T')[0];
              setAppointmentData({ ...appointmentData, date: dateString });
            }
          }}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={appointmentData.timeSlots[currentTimeIndex] ? 
            new Date(`2000-01-01T${appointmentData.timeSlots[currentTimeIndex]}`) : 
            new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (event.type === 'set' && selectedTime) {
              const timeString = selectedTime.toTimeString().split(' ')[0].substring(0, 5);
              const newTimeSlots = [...appointmentData.timeSlots];
              newTimeSlots[currentTimeIndex] = timeString;
              setAppointmentData({ ...appointmentData, timeSlots: newTimeSlots });
            }
          }}
        />
      )}
    </ScrollView>
  );
} 