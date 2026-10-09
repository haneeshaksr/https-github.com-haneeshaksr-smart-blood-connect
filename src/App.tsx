import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DonorRegisterPage } from './pages/DonorRegisterPage';
import { HospitalRegisterPage } from './pages/HospitalRegisterPage';
import { FindBloodPage } from './pages/FindBloodPage';
import { DonorDashboardPage } from './pages/DonorDashboardPage';
import { HospitalDashboardPage } from './pages/HospitalDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AboutPage } from './pages/AboutPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { AlertCircle } from 'lucide-react';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const navigate = (route: string) => {
    window.history.pushState({}, '', route);
    setCurrentRoute(route.split('?')[0]);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname.split('?')[0]);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Simple route matcher
  const renderCurrentPage = () => {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 rounded-full border-2 border-red-600 border-t-transparent animate-spin mx-auto"></div>
            <div className="text-xs text-slate-500 font-medium">Loading Smart Blood Connect...</div>
          </div>
        </div>
      );
    }

    // Role-protected routes enforcement
    if (currentRoute.startsWith('/donor')) {
      if (!user) {
        return <LoginPage navigate={navigate} />;
      }
      if (user.role !== 'donor' && user.role !== 'admin') {
        return (
          <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-md space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
              <h2 className="text-base font-bold text-slate-900">Access Restricted</h2>
              <p className="text-xs text-slate-600">
                You are authenticated as <strong>{user.role}</strong>. Donor portals are restricted strictly to registered donors.
              </p>
              <button
                onClick={() => navigate(user.role === 'hospital' ? '/hospital/dashboard' : '/admin/dashboard')}
                className="py-2 px-4 bg-slate-900 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Go to your {user.role} dashboard
              </button>
            </div>
          </div>
        );
      }
      return <DonorDashboardPage navigate={navigate} />;
    }

    if (currentRoute.startsWith('/hospital')) {
      if (!user) {
        return <LoginPage navigate={navigate} />;
      }
      if (user.role !== 'hospital' && user.role !== 'admin') {
        return (
          <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-md space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
              <h2 className="text-base font-bold text-slate-900">Access Restricted</h2>
              <p className="text-xs text-slate-600">
                You are authenticated as a <strong>{user.role}</strong>. Hospital management portals are restricted strictly to verified medical institutions.
              </p>
              <button
                onClick={() => navigate('/donor/dashboard')}
                className="py-2 px-4 bg-red-600 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Go to Donor Portal
              </button>
            </div>
          </div>
        );
      }
      return <HospitalDashboardPage navigate={navigate} />;
    }

    if (currentRoute.startsWith('/admin')) {
      if (!user || user.role !== 'admin') {
        return (
          <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-md space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
              <h2 className="text-base font-bold text-slate-900">Administrator Credentials Required</h2>
              <p className="text-xs text-slate-600">
                Only State Medical Board administrators have authorization to access the platform governance console.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="py-2 px-4 bg-slate-900 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Log In as Administrator
              </button>
            </div>
          </div>
        );
      }
      return <AdminDashboardPage navigate={navigate} />;
    }

    // Public Routes
    switch (currentRoute) {
      case '/login':
        return <LoginPage navigate={navigate} />;
      case '/register':
        return <RegisterPage navigate={navigate} />;
      case '/register/donor':
        return <DonorRegisterPage navigate={navigate} />;
      case '/register/hospital':
        return <HospitalRegisterPage navigate={navigate} />;
      case '/find-blood':
        return <FindBloodPage navigate={navigate} />;
      case '/how-it-works':
        return <HowItWorksPage navigate={navigate} />;
      case '/about':
        return <AboutPage navigate={navigate} />;
      case '/contact':
        return <ContactPage />;
      case '/privacy':
        return <PrivacyPage />;
      case '/terms':
        return <TermsPage />;
      case '/':
      default:
        return <LandingPage navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar currentRoute={currentRoute} navigate={navigate} />
      <main className="flex-1">
        {renderCurrentPage()}
      </main>
      <Footer navigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
