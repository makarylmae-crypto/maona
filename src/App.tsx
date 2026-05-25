import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import FarmerDashboard from './components/FarmerDashboard';
import ShopPage from './components/ShopPage';
import CartPage from './components/CartPage';
import OrdersPage from './components/OrdersPage';
import PlatformMonitor from './components/PlatformMonitor';
import FarmerProfile from './components/FarmerProfile';

type Page =
  | 'home'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'sales'
  | 'profile'
  | 'market'
  | 'shop'
  | 'cart'
  | 'monitor';

function AppContent() {
  const { state } = useApp();
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const { isAuthenticated, currentUser } = state;

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const renderPage = () => {
    // ---- NOT AUTHENTICATED ----
    if (!isAuthenticated) {
      if (currentPage === 'login') return <AuthPage mode="login" />;
      if (currentPage === 'register') return <AuthPage mode="register" />;
      if (currentPage === 'market' || currentPage === 'home') {
        return <LandingPage onNavigate={handleNavigate} />;
      }
      // Protected pages redirect to login
      if (['dashboard', 'products', 'orders', 'sales', 'shop', 'cart', 'monitor'].includes(currentPage)) {
        return <AuthPage mode="login" />;
      }
      return <LandingPage onNavigate={handleNavigate} />;
    }

    // ---- ADMIN ----
    if (currentUser?.role === 'admin') {
      switch (currentPage) {
        case 'monitor':
          return <PlatformMonitor />;
        default:
          return <PlatformMonitor />;
      }
    }

    // ---- FARMER ----
    if (currentUser?.role === 'farmer') {
      switch (currentPage) {
        case 'dashboard':
        case 'products':
        case 'sales':
          return <FarmerDashboard />;
        case 'orders':
          return <OrdersPage role="farmer" />;
        case 'profile':
          return <FarmerProfile />;
        case 'market':
        case 'home':
          return <LandingPage onNavigate={handleNavigate} />;
        case 'cart':
          return <CartPage onNavigate={handleNavigate} />;
        default:
          return <FarmerDashboard />;
      }
    }

    // ---- RESIDENT ----
    switch (currentPage) {
      case 'shop':
        return <ShopPage />;
      case 'cart':
        return <CartPage onNavigate={handleNavigate} />;
      case 'orders':
        return <OrdersPage role="resident" />;
      case 'market':
      case 'home':
        return <LandingPage onNavigate={handleNavigate} />;
      default:
        return <ShopPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
      <main>{renderPage()}</main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
