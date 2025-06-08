import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Your computer's IP address
const API_URL = "http://192.168.1.106:8000/api/v1";

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
        await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
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
        await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
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
