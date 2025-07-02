import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function ChooseTypeScreen() {
  const router = useRouter();

  const handleChooseType = (type: 'patient' | 'doctor') => {
    if (type === 'patient') {
      router.push("/login");
    } else {
      router.push("/doctor-login");
    }
  };

  return (
    <View className="flex-1 bg-white p-6">
      <View className="flex-1 justify-center">
        <View className="items-center mb-12">
          <Text className="text-3xl font-bold text-blue-500 mb-4">
            Welcome to Med-Link
          </Text>
          <Text className="text-xl text-gray-600 text-center">
            Choose your account type to continue
          </Text>
        </View>

        <View className="space-y-6">
          {/* Patient Option */}
          <TouchableOpacity
            className="bg-white border-2 border-blue-500 rounded-xl mb-2 p-6 shadow-lg"
            onPress={() => handleChooseType('patient')}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center">
              <View className="bg-blue-100 p-4 rounded-full mr-4">
                <FontAwesome name="user" size={32} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-800 mb-2">
                  Patient
                </Text>
                <Text className="text-gray-600">
                  Access medical consultations, book appointments, and chat with doctors
                </Text>
              </View>
              <FontAwesome name="chevron-right" size={20} color="#3B82F6" />
            </View>
          </TouchableOpacity>

          {/* Doctor Option */}
          <TouchableOpacity
            className="bg-white border-2 border-green-500 rounded-xl p-6 shadow-lg"
            onPress={() => handleChooseType('doctor')}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center">
              <View className="bg-green-100 p-4 rounded-full mr-4">
                <FontAwesome name="user-md" size={32} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-800 mb-2">
                  Doctor
                </Text>
                <Text className="text-gray-600">
                  Provide consultations, manage appointments, and help patients
                </Text>
              </View>
              <FontAwesome name="chevron-right" size={20} color="#10B981" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
} 