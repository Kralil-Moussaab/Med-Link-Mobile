import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useAuth } from "./context/AuthContext";
import { authService } from "./services/api";

interface DoctorFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  gender: string;
  phoneNumber: string;
  speciality: string;
  typeConsultation: string;
  city: string;
  street: string;
  picture: any;
  opaningDate: string;
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

const cities = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra",
  "Béchar", "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret",
  "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda",
  "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem",
  "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh", "Illizi",
  "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt",
  "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla",
  "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane", "Timimoun",
  "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès", "In Salah",
  "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Menia"
];

export default function DoctorSignupScreen() {
  const router = useRouter();
  const { setIsAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<DoctorFormData>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    gender: "male",
    phoneNumber: "",
    speciality: "",
    typeConsultation: "all",
    city: "",
    street: "",
    picture: null,
    opaningDate: "Monday, Tuesday, Wednesday, Thursday, Friday, [08:00 - 12:00], [14:00 - 18:00]",
  });

  const steps = [
    { number: 1, title: "Account" },
    { number: 2, title: "Professional" },
    { number: 3, title: "Location" },
    { number: 4, title: "Schedule" },
    { number: 5, title: "Photo" },
  ];

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.password_confirmation) {
      Alert.alert("Error", "Please fill in all required fields");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }

    if (formData.password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return false;
    }

    if (formData.password !== formData.password_confirmation) {
      Alert.alert("Error", "Passwords do not match");
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!formData.phoneNumber || !formData.speciality) {
      Alert.alert("Error", "Please fill in all required fields");
      return false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
      return false;
    }

    return true;
  };

  const validateStep3 = () => {
    if (!formData.city || !formData.street) {
      Alert.alert("Error", "Please fill in all required fields");
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    if (!formData.opaningDate.trim()) {
      Alert.alert("Error", "Please enter your working schedule");
      return false;
    }
    return true;
  };

  const validateStep5 = () => {
    // Picture is optional, so no validation needed
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    } else if (currentStep === 3 && validateStep3()) {
      setCurrentStep(4);
    } else if (currentStep === 4 && validateStep4()) {
      setCurrentStep(5);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData({ ...formData, picture: result.assets[0] });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData({ ...formData, picture: result.assets[0] });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Create a copy of formData and remove picture if it's null
      const submitData = { ...formData };
      if (!submitData.picture) {
        delete submitData.picture;
      }
      
      const result = await authService.registerDoctor(submitData);
      if (result.success) {
        setIsAuthenticated(true);
        router.replace("/");
      } else {
        Alert.alert("Registration Failed", result.error);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View className="space-y-4">
      <View>
        <Text className="text-gray-700 mb-2">Full Name</Text>
        <TextInput
          className="bg-gray-100 p-4 rounded-lg"
          placeholder="Dr. John Doe"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          editable={!loading}
        />
      </View>

      <View>
        <Text className="text-gray-700 mb-2">Email</Text>
        <TextInput
          className="bg-gray-100 p-4 rounded-lg"
          placeholder="doctor@example.com"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
      </View>

      <View>
        <Text className="text-gray-700 mb-2">Password</Text>
        <TextInput
          className="bg-gray-100 p-4 rounded-lg"
          placeholder="Create a strong password"
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry={!showPassword}
          editable={!loading}
        />
      </View>

      <View>
        <Text className="text-gray-700 mb-2">Confirm Password</Text>
        <TextInput
          className="bg-gray-100 p-4 rounded-lg"
          placeholder="Confirm your password"
          value={formData.password_confirmation}
          onChangeText={(text) => setFormData({ ...formData, password_confirmation: text })}
          secureTextEntry={!showConfirmPassword}
          editable={!loading}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View className="space-y-4">
      <View className="flex-row space-x-4">
        <View className="flex-1">
          <Text className="text-gray-700 mb-2">Gender</Text>
          <View className="bg-gray-100 rounded-lg">
            <Picker
              selectedValue={formData.gender}
              onValueChange={(value) => setFormData({ ...formData, gender: value })}
              enabled={!loading}
            >
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
            </Picker>
          </View>
        </View>
        <View className="flex-1">
          <Text className="text-gray-700 mb-2">Phone Number</Text>
          <TextInput
            className="bg-gray-100 p-4 rounded-lg"
            placeholder="+1234567890"
            value={formData.phoneNumber}
            onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
            keyboardType="phone-pad"
            editable={!loading}
          />
        </View>
      </View>
      <View>
        <Text className="text-gray-700 mb-2">Speciality</Text>
        <View className="bg-gray-100 rounded-lg">
          <Picker
            selectedValue={formData.speciality}
            onValueChange={(value) => setFormData({ ...formData, speciality: value })}
            enabled={!loading}
          >
            <Picker.Item label="Select a speciality" value="" />
            {specialties.map((specialty) => (
              <Picker.Item key={specialty} label={specialty} value={specialty} />
            ))}
          </Picker>
        </View>
      </View>
      <View>
        <Text className="text-gray-700 mb-2">Consultation Type</Text>
        <View className="bg-gray-100 rounded-lg">
          <Picker
            selectedValue={formData.typeConsultation}
            onValueChange={(value) => setFormData({ ...formData, typeConsultation: value })}
            enabled={!loading}
          >
            <Picker.Item label="Both Online & In-Person" value="all" />
            <Picker.Item label="Video Consultation Only" value="video" />
            <Picker.Item label="Chat Consultation Only" value="chat" />
          </Picker>
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View className="space-y-4">
      <View className="flex-row space-x-4">
        <View className="flex-1">
          <Text className="text-gray-700 mb-2">City</Text>
          <View className="bg-gray-100 rounded-lg">
            <Picker
              selectedValue={formData.city}
              onValueChange={(value) => setFormData({ ...formData, city: value })}
              enabled={!loading}
            >
              <Picker.Item label="Select a city" value="" />
              {cities.map((city) => (
                <Picker.Item key={city} label={city} value={city} />
              ))}
            </Picker>
          </View>
        </View>
        <View className="flex-1">
          <Text className="text-gray-700 mb-2">Street</Text>
          <TextInput
            className="bg-gray-100 p-4 rounded-lg"
            placeholder="Street address"
            value={formData.street}
            onChangeText={(text) => setFormData({ ...formData, street: text })}
            editable={!loading}
          />
        </View>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View className="space-y-4">
      <View>
        <Text className="text-gray-700 mb-2">Working Schedule</Text>
        <Text className="text-gray-600 text-sm mb-4">
          Default schedule: Monday-Friday, 8:00 AM - 12:00 PM and 2:00 PM - 6:00 PM
        </Text>
        <TextInput
          className="bg-gray-100 p-4 rounded-lg"
          placeholder="Customize your working schedule"
          value={formData.opaningDate}
          onChangeText={(text) => setFormData({ ...formData, opaningDate: text })}
          multiline
          numberOfLines={3}
          editable={!loading}
        />
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View className="space-y-4">
      <View>
        <Text className="text-gray-700 mb-2">Profile Picture (Optional)</Text>
        <Text className="text-gray-600 text-sm mb-4">
          Add a professional photo for your profile. You can skip this step and add a photo later.
        </Text>
        
        {formData.picture ? (
          <View className="items-center">
            <Image
              source={{ uri: formData.picture.uri }}
              className="w-32 h-32 rounded-full mb-4"
            />
            <TouchableOpacity
              className="bg-red-500 px-4 py-2 rounded-lg"
              onPress={() => setFormData({ ...formData, picture: null })}
              disabled={loading}
            >
              <Text className="text-white font-semibold">Remove Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-3">
            <TouchableOpacity
              className="bg-blue-500 p-4 rounded-lg"
              onPress={pickImage}
              disabled={loading}
            >
              <Text className="text-white text-center font-semibold">
                Choose from Gallery
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="bg-green-500 p-4 rounded-lg"
              onPress={takePhoto}
              disabled={loading}
            >
              <Text className="text-white text-center font-semibold">
                Take Photo
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="bg-gray-300 p-4 rounded-lg"
              onPress={() => setCurrentStep(5)} // Stay on same step but skip photo
              disabled={loading}
            >
              <Text className="text-gray-700 text-center font-semibold">
                Skip for Now
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
            Doctor Registration
          </Text>
          <Text className="text-gray-500 mt-2">Step {currentStep} of 5</Text>
        </View>

        {/* Progress Bar */}
        <View className="flex-row mb-8">
          {[1, 2, 3, 4, 5].map((step) => (
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
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}

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

          {currentStep < 5 ? (
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
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text className="text-white text-center font-semibold">
                {loading ? "Creating Account..." : "Create Doctor Account"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Login Link */}
        <View className="flex-row justify-center mt-4">
          <Text className="text-gray-500">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/doctor-login")}>
            <Text className="text-blue-500 font-semibold">
              Sign In as Doctor
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
} 