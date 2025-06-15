import React, { createContext, useContext, useState, ReactNode } from 'react';
import Axios from '../custom-axios.';
import { toast } from 'react-toastify';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      const response = await Axios.post("/auth/login", {
        email,
        password
      });

      // Example: response.data = { id, email, name }
      const { status, data, error } = response.data;
      console.log(status,data,response.data)
      if (status == "Ok") {
        toast.success("Login Successful")
      } else {
        throw new Error(error.message);

      }
      setToken(data.token);
      localStorage.setItem("access_token", data.token);
    } catch (error) {
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setIsLoading(true);

    try {

      const response = await Axios.post("/auth/signup", {
        email,
        password
      });
      const { status, error } = response.data;
      if (status == "Ok") {
        toast.success("Registration Successful")
      } else {
        throw new Error(error.message);

      }
    } catch (error) {

      throw new Error('Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('access_token');
  };

  const value = {
    token,
    isAuthenticated: !!token,
    login,
    signup,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}