import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Your computer's IP address
const API_URL = "http://192.168.210.217:8000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});

// Add token to requests if it exists
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email: string, password: string) => {
    try {
      console.log("Attempting login with:", { email, password });
      console.log("API URL:", API_URL);

      const response = await api.post("/users/login", { email, password });
      console.log("Login response:", response.data);

      if (response.data.token) {
        await AsyncStorage.setItem("token", response.data.token);
        await AsyncStorage.setItem("user", JSON.stringify({ ...response.data.user, type: 'patient' }));
        await AsyncStorage.setItem("userType", "user");
        return response.data;
      } else {
        throw new Error("No token received from server");
      }
    } catch (error: any) {
      console.error("Login error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
      });

      if (error.response) {
        throw new Error(error.response.data.message || "Login failed");
      } else if (error.request) {
        throw new Error(
          "Cannot connect to the server. Please check:\n" +
            "1. Your internet connection\n" +
            "2. The API server is running\n" +
            "3. You are on the same network as the server"
        );
      } else {
        throw new Error(error.message || "An error occurred during login");
      }
    }
  },

  loginDoctor: async (email: string, password: string) => {
    try {
      console.log("Attempting doctor login with:", { email, password });
      const response = await api.post("/doctors/login", { email, password });
      const { token, doctor } = response.data;

      if (token) {
        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("user", JSON.stringify({ ...doctor, type: 'doctor' }));
        await AsyncStorage.setItem("userType", "doctor");
        return {
          success: true,
          data: { token, user: { ...doctor, type: 'doctor' } },
        };
      }
      return { success: false, error: "Invalid response from server" };
    } catch (error: any) {
      console.error("Doctor login error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || "Login failed. Please try again.",
      };
    }
  },

  registerDoctor: async (doctorData: any) => {
    try {
      const formData = new FormData();

      // Add all doctor data to FormData
      Object.keys(doctorData).forEach((key) => {
        if (key === "picture" && doctorData[key]) {
          // Properly format the image for FormData
          const imageFile = {
            uri: doctorData[key].uri,
            type: 'image/jpeg', // or get from the image object if available
            name: 'profile-picture.jpg'
          };
          formData.append("picture", imageFile as any);
        } else if (doctorData[key] !== null && doctorData[key] !== undefined) {
          formData.append(key, doctorData[key].toString());
        }
      });

      const response = await api.post("/doctors", formData);
      const { token, doctor } = response.data;

      if (token) {
        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("user", JSON.stringify({ ...doctor, type: 'doctor' }));
        await AsyncStorage.setItem("userType", "doctor");
        return {
          success: true,
          data: { token, user: { ...doctor, type: 'doctor' } },
        };
      }
      return { success: false, error: "Invalid response from server" };
    } catch (error: any) {
      console.error(
        "Doctor registration error:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      };
    }
  },

  register: async (data: RegisterData) => {
    try {
      console.log("Sending registration data:", data);
      const response = await api.post("/users", {
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        phoneNumber: data.phoneNumber,
        groupage: data.groupage,
        sexe: data.sexe,
        age: data.age,
        chronicDisease: data.chronicDisease,
      });
      console.log("Registration response:", response.data);

      if (response.data.token) {
        await AsyncStorage.setItem("token", response.data.token);
        await AsyncStorage.setItem("user", JSON.stringify({ ...response.data.user, type: 'patient' }));
        await AsyncStorage.setItem("userType", "user");
      }
      return response.data;
    } catch (error: any) {
      console.error("Registration error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post("/users/logout");
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      return { success: false, error: "Logout failed" };
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.post("/users/profile");
      return response.data;
    } catch (error) {
      console.error("Error fetching current user:", error);
      throw error;
    }
  },
};

interface DoctorListParams {
  name?: string;
  city?: string;
  speciality?: string;
  gender?: string;
  page?: number;
  status?: string;
}

export const doctorService = {
  listDoctors: async (params: DoctorListParams = {}) => {
    try {
      const apiParams: Record<string, any> = {};

      if (params.name) {
        apiParams["name[eq]"] = params.name;
      }

      if (params.city) {
        apiParams["city[eq]"] = params.city;
      }

      if (params.speciality) {
        apiParams["speciality[eq]"] = params.speciality;
      }

      if (params.gender) {
        apiParams["gender[eq]"] = params.gender;
      }

      if (params.page) {
        apiParams.page = params.page;
      }

      if (params.status) {
        apiParams["status[eq]"] = params.status;
      }

      const response = await api.get("/doctors", { params: apiParams });
      return response.data;
    } catch (error) {
      console.error("Error fetching doctors:", error);
      throw error;
    }
  },

  getDoctorById: async (id: string) => {
    try {
      const response = await api.get(`/doctors/${id}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error(`Error fetching doctor with id ${id}:`, error);
      throw error;
    }
  },

  getStatsDoctor: async () => {
    try {
      const response = await api.get("doctor/myStats");
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Error fetching doctor stats:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch doctor stats",
      };
    }
  },
};

export const appointmentService = {
  getAppointmentsByUser: async (id: string) => {
    try {
      const response = await api.get(`/appointments/user/${id}`);
      return {
        success: true,
        data: response.data.appointments,
      };
    } catch (error: any) {
      console.error("Error fetching user appointments:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch appointments",
      };
    }
  },

  getAppointmentSlotsById: async (id: string) => {
    try {
      const response = await api.get(`/appointments/doctor/Scheduled/${id}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error(`Error fetching doctor with id ${id}:`, error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          `Failed to fetch slots for doctor ${id}`,
      };
    }
  },

  approveAppointment: async (id: string, userId: string) => {
    try {
      const response = await api.patch(`/appointments/scheduled/${id}`, {
        userId,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Error approving appointment:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to approve appointment",
      };
    }
  },

  getApproveAppointment: async () => {
    try {
      const response = await api.get("/appointments");
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Error fetching approved appointments:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch approved appointments",
      };
    }
  },

  getDoctorAppointments: async (doctorId: string) => {
    try {
      const response = await api.get(`/appointments/doctor/${doctorId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Error fetching doctor appointments:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch doctor appointments",
      };
    }
  },

  addAppointmentSlots: async (doctorId: string, slotData: { date: string; timeSlots: string[] }) => {
    try {
      const requestData = {
        doctorId: doctorId,
        date: slotData.date,
        time: slotData.timeSlots,
      };
      
      console.log("API Request Data:", requestData);
      
      const response = await api.post("/appointments", requestData);
      
      console.log("API Response:", response.data);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Error adding appointment slots:", error);
      console.error("Error response data:", error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to add appointment slots",
      };
    }
  },

  deletAppointment: async (slotId: string) => {
    try {
      const response = await api.delete(`/appointments/${slotId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Error deleting appointment slot:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to delete appointment slot",
      };
    }
  },
};

export const chatService = {
  getDoctorSaved: async () => {
    try {
      const response = await api.get("chat/showDoctor");
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error(`Error fetching doctor saved:`, error);
      throw error;
    }
  },

  getDoctorChat: async (id: string) => {
    try {
      const response = await api.get(`/chat/showChat/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching doctor chat:`, error);
      throw error;
    }
  },

  getPatientOfDoctor: async () => {
    try {
      const response = await api.get("doctor/client");
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error(`Error fetching doctor clients:`, error);
      throw error;
    }
  },
};

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phoneNumber: string;
  groupage: string;
  sexe: string;
  age: string;
  chronicDisease: string;
}

export const userService = {
  getUserById: async (userId: string) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error(`Error fetching user with id ${userId}:`, error);
      return {
        success: false,
        error: error.response?.data?.message || `Failed to fetch user ${userId}`,
      };
    }
  },
};
