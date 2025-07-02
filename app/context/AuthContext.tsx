import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  type: 'patient' | 'doctor';
  phoneNumber?: string;
  speciality?: string;
  city?: string;
  street?: string;
  picture?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userData = await AsyncStorage.getItem("user");
      const userType = await AsyncStorage.getItem("userType");
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        
        // Determine user type based on multiple sources
        let userTypeValue: 'patient' | 'doctor' = 'patient';
        
        if (userType === 'doctor' || parsedUser.isDoctor || parsedUser.type === 'doctor') {
          userTypeValue = 'doctor';
        }
        
        // Create user object with proper type
        const user: User = {
          id: parsedUser.id || parsedUser.doctor_id || '',
          name: parsedUser.name || '',
          email: parsedUser.email || '',
          type: userTypeValue,
          phoneNumber: parsedUser.phoneNumber || parsedUser.phone_number || '',
          speciality: parsedUser.speciality || '',
          city: parsedUser.city || '',
          street: parsedUser.street || '',
          picture: parsedUser.picture || '',
        };
        
        console.log("Auth check - User type:", userTypeValue, "User data:", user);
        
        setIsAuthenticated(true);
        setUser(user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Prevent state updates before initialization
  const handleSetIsAuthenticated = (value: boolean) => {
    if (isInitialized) {
      setIsAuthenticated(value);
    }
  };

  const handleSetUser = (userData: User | null) => {
    if (isInitialized) {
      setUser(userData);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated: handleSetIsAuthenticated,
        user,
        setUser: handleSetUser,
        checkAuth,
        isInitialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Add default export
export default AuthProvider; 