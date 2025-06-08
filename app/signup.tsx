import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "./context/AuthContext";
import { authService } from "./services/api";

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const genders = ["male", "female"];

export default function SignupScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [chronicDisease, setChronicDisease] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { isAuthenticated, setIsAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isInitialized]);

  const validateStep1 = () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all required fields");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!phoneNumber || !bloodType || !gender || !age) {
      Alert.alert("Error", "Please fill in all required fields");
      return false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
      return false;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      Alert.alert("Error", "Please enter a valid age");
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSignup = async () => {
    try {
      setLoading(true);

      const formattedData = {
        name,
        email,
        password,
        password_confirmation: confirmPassword,
        phoneNumber: phoneNumber || "",
        groupage: bloodType || "",
        sexe: gender || "",
        age: age || "",
        chronicDisease: chronicDisease || "",
      };

      console.log("Formatted registration data:", formattedData);
      const response = await authService.register(formattedData);

      // Store token and user data
      await AsyncStorage.setItem("token", response.token);
      await AsyncStorage.setItem("user", JSON.stringify(response.user));

      // Update auth state
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error("Signup error:", error.response?.data);
      const errorMessage =
        error.response?.data?.message || "An error occurred during signup";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking initial auth
  if (!isInitialized) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  const renderStep1 = () => (
    <View className="space-y-4">
      <View>
        <Text className="text-gray-700 mb-2">Full Name</Text>
        <TextInput
          className="bg-gray-100 p-4 rounded-lg"
          placeholder="Enter your full name"
          value={name}
          onChangeText={setName}
          editable={!loading}
        />
      </View>

      <View>
        <Text className="text-gray-700 mb-2">Email</Text>
        <TextInput
          className="bg-gray-100 p-4 rounded-lg"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
      </View>

      <View>
        <Text className="text-gray-700 mb-2">Password</Text>
        <TextInput
          className="bg-gray-100 p-4 rounded-lg"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          editable={!loading}
        />
      </View>

      <View>
        <Text className="text-gray-700 mb-2">Confirm Password</Text>
        <TextInput
          className="bg-gray-100 p-4 rounded-lg"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          editable={!loading}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View className="space-y-4">
      <View>
        <Text className="text-gray-700 mb-2">Phone Number</Text>
        <TextInput
          className="bg-gray-100 p-4 rounded-lg"
          placeholder="Enter your phone number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          editable={!loading}
        />
      </View>

      <View>
        <Text className="text-gray-700 mb-2">Blood Type</Text>
        <View className="bg-gray-100 rounded-lg">
          <Picker
            selectedValue={bloodType}
            onValueChange={setBloodType}
            style={{ height: 50 }}
          >
            <Picker.Item label="Select blood type" value="" />
            {bloodTypes.map((type) => (
              <Picker.Item key={type} label={type} value={type} />
            ))}
          </Picker>
        </View>
      </View>

      <View>
        <Text className="text-gray-700 mb-2">Gender</Text>
        <View className="bg-gray-100 rounded-lg">
          <Picker
            selectedValue={gender}
            onValueChange={setGender}
            style={{ height: 50 }}
          >
            <Picker.Item label="Select gender" value="" />
            {genders.map((g) => (
              <Picker.Item key={g} label={g} value={g} />
            ))}
          </Picker>
        </View>
      </View>

      <View>
        <Text className="text-gray-700 mb-2">Age</Text>
        <TextInput
          className="bg-gray-100 p-4 rounded-lg"
          placeholder="Enter your age"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
          editable={!loading}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View className="space-y-4">
      <View>
        <Text className="text-gray-700 mb-2">Chronic Disease</Text>
        <TextInput
          className="bg-gray-100 p-4 rounded-lg"
          placeholder="Enter any chronic diseases (or 'None' if none)"
          value={chronicDisease}
          onChangeText={setChronicDisease}
          multiline
          numberOfLines={4}
          editable={!loading}
        />
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 p-6">
        <View className="items-center mb-10">
          <Text className="text-3xl text-blue-500 font-bold mt-24">
            Welcome to Med-Link
          </Text>
          <Text className="text-3xl font-semibold text-gray-800">
            Create Account
          </Text>
          <Text className="text-gray-500 mt-2">Step {currentStep} of 3</Text>
        </View>

        {/* Progress Bar */}
        <View className="flex-row mb-8">
          {[1, 2, 3].map((step) => (
            <View
              key={step}
              className={`flex-1 h-1 mx-1 rounded-full ${
                step <= currentStep ? "bg-blue-500" : "bg-gray-200"
              }`}
            />
          ))}
        </View>

        {/* Form Steps */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {/* Navigation Buttons */}
        <View className="flex-row justify-between mt-4">
          {currentStep > 1 && (
            <TouchableOpacity
              className="bg-gray-200 p-4 rounded-lg flex-1 mr-2"
              onPress={handleBack}
              disabled={loading}
            >
              <Text className="text-gray-800 text-center font-semibold">
                Back
              </Text>
            </TouchableOpacity>
          )}

          {currentStep < 3 ? (
            <TouchableOpacity
              className="bg-blue-500 p-4 rounded-lg flex-1"
              onPress={handleNext}
              disabled={loading}
            >
              <Text className="text-white text-center font-semibold">Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className={`${
                loading ? "bg-blue-300" : "bg-blue-500"
              } p-4 rounded-lg flex-1`}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text className="text-white text-center font-semibold">
                {loading ? "Creating Account..." : "Create Account"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="flex-row justify-center mt-4">
          <Text className="text-gray-500">Already have an account? </Text>
          <Link href="/login" className="text-blue-500 font-semibold">
            Sign In
          </Link>
        </View>
      </ScrollView>
    </View>
  );
}
