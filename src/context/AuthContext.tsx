import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, DonorProfile, HospitalProfile } from '../types';
import { api, getAuthToken, setAuthToken, removeAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  donorProfile: DonorProfile | null;
  hospitalProfile: HospitalProfile | null;
  isLoading: boolean;
  login: (email: string, password: string, role?: string) => Promise<void>;
  registerDonor: (payload: any) => Promise<void>;
  registerHospital: (payload: any) => Promise<void>;
  logout: () => void;
  switchDemoRole: (roleType: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateDonorProfileState: (profile: DonorProfile) => void;
  updateHospitalProfileState: (profile: HospitalProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [donorProfile, setDonorProfile] = useState<DonorProfile | null>(null);
  const [hospitalProfile, setHospitalProfile] = useState<HospitalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const currentToken = getAuthToken();
    if (!currentToken) {
      setUser(null);
      setDonorProfile(null);
      setHospitalProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        setDonorProfile(res.donorProfile || null);
        setHospitalProfile(res.hospitalProfile || null);
      } else {
        removeAuthToken();
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      removeAuthToken();
      setToken(null);
      setUser(null);
      setDonorProfile(null);
      setHospitalProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string, role?: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password, role });
      setAuthToken(res.token);
      setToken(res.token);
      setUser(res.user);
      setDonorProfile(res.donorProfile || null);
      setHospitalProfile(res.hospitalProfile || null);
    } finally {
      setIsLoading(false);
    }
  };

  const registerDonor = async (payload: any) => {
    setIsLoading(true);
    try {
      const res = await api.registerDonor(payload);
      setAuthToken(res.token);
      setToken(res.token);
      setUser(res.user);
      setDonorProfile(res.profile || null);
    } finally {
      setIsLoading(false);
    }
  };

  const registerHospital = async (payload: any) => {
    setIsLoading(true);
    try {
      const res = await api.registerHospital(payload);
      setAuthToken(res.token);
      setToken(res.token);
      setUser(res.user);
      setHospitalProfile(res.profile || null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeAuthToken();
    setToken(null);
    setUser(null);
    setDonorProfile(null);
    setHospitalProfile(null);
  };

  const switchDemoRole = async (roleType: string) => {
    setIsLoading(true);
    try {
      const res = await api.demoSwitch(roleType);
      setAuthToken(res.token);
      setToken(res.token);
      setUser(res.user);
      setDonorProfile(res.donorProfile || null);
      setHospitalProfile(res.hospitalProfile || null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDonorProfileState = (profile: DonorProfile) => {
    setDonorProfile(profile);
  };

  const updateHospitalProfileState = (profile: HospitalProfile) => {
    setHospitalProfile(profile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        donorProfile,
        hospitalProfile,
        isLoading,
        login,
        registerDonor,
        registerHospital,
        logout,
        switchDemoRole,
        refreshUser,
        updateDonorProfileState,
        updateHospitalProfileState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
