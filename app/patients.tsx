import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useAuth } from "./context/AuthContext";
import { chatService } from "./services/api";

interface Patient {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  age?: number;
  sexe?: string;
  groupage?: string;
  chronicDisease?: string;
  lastVisit?: string;
  status?: 'active' | 'inactive';
}

export default function PatientsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const result = await chatService.getPatientOfDoctor();
      console.log("API Response:", result); // Debug log
      
      if (result.success) {
        // Use the correct structure: result.data.users
        const patientsData = Array.isArray(result.data?.users) ? result.data.users : [];
        console.log("Patients data:", patientsData); // Debug log
        setPatients(patientsData);
      } else {
        console.log("API returned success: false"); // Debug log
        Alert.alert("Error", "Failed to fetch patients");
        setPatients([]); // Set empty array on error
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      Alert.alert("Error", "Failed to load patients. Please try again.");
      setPatients([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPatients();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Ensure patients is always an array before filtering
  const filteredPatients = patients || [];

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDetails(true);
  };

  const renderPatientCard = ({ item }: { item: Patient }) => (
    <View className="bg-white p-6 rounded-xl shadow-sm mb-4 mx-4">
      <View className="flex-row items-center space-x-4 mb-4">
        <View className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
          <Text className="text-2xl text-gray-500 font-semibold">
            {item.name?.charAt(0) || '?'}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">{item.name}</Text>
          <Text className="text-gray-500">
            {item.age} years • {item.sexe}
          </Text>
        </View>
      </View>

      <View className="space-y-2 mb-4">
        {item.phoneNumber && (
          <View className="flex-row items-center">
            <FontAwesome name="phone" size={16} color="#6B7280" />
            <Text className="text-gray-600 ml-2">{item.phoneNumber}</Text>
          </View>
        )}
        <View className="flex-row items-center">
          <FontAwesome name="envelope" size={16} color="#6B7280" />
          <Text className="text-gray-600 ml-2">{item.email}</Text>
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-sm text-gray-500">Chronic Disease</Text>
        <Text className="font-medium text-gray-900">{item.chronicDisease || 'None'}</Text>
      </View>

      <View className="mb-6">
        <Text className="text-sm text-gray-500">Blood Group</Text>
        <Text className="font-medium text-gray-900">{item.groupage || 'Unknown'}</Text>
      </View>

      <TouchableOpacity
        className="bg-blue-500 py-2 px-4 rounded-lg"
        onPress={() => handleViewDetails(item)}
        activeOpacity={0.7}
      >
        <Text className="text-white text-center font-semibold">View Details</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center p-8">
      <FontAwesome name="users" size={64} color="#D1D5DB" />
      <Text className="text-xl font-semibold text-gray-500 mt-4 text-center">
        No Patients Found
      </Text>
      <Text className="text-gray-400 text-center mt-2">
        You don't have any patients yet
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Loading patients...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white p-6 pt-12 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-800">My Patients</Text>
            <Text className="text-gray-600 mt-1">
              Manage and view your patient records
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

      {/* Patients List */}
      <FlatList
        data={filteredPatients}
        renderItem={renderPatientCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ 
          paddingTop: 16, 
          paddingBottom: 100,
          flexGrow: 1 
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3B82F6"]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Patient Details Modal */}
      <Modal
        visible={showDetails}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDetails(false)}
      >
        <View className="flex-1 bg-black/30 justify-center items-center p-4">
          <View className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-semibold text-gray-900">
                Patient Details
              </Text>
              <TouchableOpacity onPress={() => setShowDetails(false)}>
                <FontAwesome name="times" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            {selectedPatient && (
              <View className="space-y-4">
                <View>
                  <Text className="text-lg font-semibold text-gray-900">
                    {selectedPatient.name}
                  </Text>
                  <Text className="text-gray-500">
                    {selectedPatient.age} years • {selectedPatient.sexe}
                  </Text>
                </View>
                
                <View className="space-y-3">
                  <View>
                    <Text className="text-sm text-gray-500">Email</Text>
                    <Text className="font-medium text-gray-900">{selectedPatient.email}</Text>
                  </View>
                  
                  {selectedPatient.phoneNumber && (
                    <View>
                      <Text className="text-sm text-gray-500">Phone</Text>
                      <Text className="font-medium text-gray-900">{selectedPatient.phoneNumber}</Text>
                    </View>
                  )}
                  
                  <View>
                    <Text className="text-sm text-gray-500">Chronic Disease</Text>
                    <Text className="font-medium text-gray-900">{selectedPatient.chronicDisease || 'None'}</Text>
                  </View>
                  
                  <View>
                    <Text className="text-sm text-gray-500">Blood Group</Text>
                    <Text className="font-medium text-gray-900">{selectedPatient.groupage || 'Unknown'}</Text>
                  </View>
                </View>
              </View>
            )}
            
            <View className="mt-6 flex justify-end">
              <TouchableOpacity
                className="bg-gray-200 py-2 px-4 rounded-lg"
                onPress={() => setShowDetails(false)}
                activeOpacity={0.7}
              >
                <Text className="text-gray-800 font-semibold">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
} 