import React, { createContext, useContext, useEffect, useState } from 'react';
import { appStore } from '../lib/store';
import { 
  Profile, 
  Professional, 
  Category, 
  ServiceRequest, 
  Quote, 
  Notification, 
  UserRole 
} from '../types';

interface AppContextType {
  currentUser: Profile;
  switchRole: (role: UserRole) => void;
  categories: Category[];
  professionals: Professional[];
  requests: ServiceRequest[];
  quotes: Quote[];
  notifications: Notification[];
  unreadNotificationsCount: number;
  isNotificationsOpen: boolean;
  openNotifications: () => void;
  closeNotifications: () => void;
  isRequestModalOpen: boolean;
  openRequestModal: (prefillCategory?: string, prefillTitle?: string) => void;
  closeRequestModal: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  prefillRequestData: { categorySlug?: string; title?: string };
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Profile>(appStore.getCurrentUser());
  const [categories, setCategories] = useState<Category[]>(appStore.getCategories());
  const [professionals, setProfessionals] = useState<Professional[]>(appStore.getProfessionals());
  const [requests, setRequests] = useState<ServiceRequest[]>(appStore.getRequests());
  const [quotes, setQuotes] = useState<Quote[]>(appStore.getQuotes());
  const [notifications, setNotifications] = useState<Notification[]>(appStore.getNotifications());
  
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [prefillRequestData, setPrefillRequestData] = useState<{ categorySlug?: string; title?: string }>({});

  const refreshData = () => {
    setCurrentUser(appStore.getCurrentUser());
    setCategories(appStore.getCategories());
    setProfessionals(appStore.getProfessionals());
    setRequests(appStore.getRequests());
    setQuotes(appStore.getQuotes());
    setNotifications(appStore.getNotifications());
  };

  useEffect(() => {
    const unsubscribe = appStore.subscribe(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, []);

  const switchRole = (role: UserRole) => {
    appStore.switchRole(role);
    setCurrentUser(appStore.getCurrentUser());
  };

  const openRequestModal = (prefillCategory?: string, prefillTitle?: string) => {
    setPrefillRequestData({ categorySlug: prefillCategory, title: prefillTitle });
    setIsRequestModalOpen(true);
  };

  const closeRequestModal = () => {
    setIsRequestModalOpen(false);
    setPrefillRequestData({});
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read_at).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchRole,
        categories,
        professionals,
        requests,
        quotes,
        notifications,
        unreadNotificationsCount,
        isNotificationsOpen,
        openNotifications: () => setIsNotificationsOpen(true),
        closeNotifications: () => setIsNotificationsOpen(false),
        isRequestModalOpen,
        openRequestModal,
        closeRequestModal,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        prefillRequestData,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
