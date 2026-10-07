import React, { createContext, useContext, useState, useEffect } from 'react';

const TabContext = createContext();

export const TabProvider = ({ children, initialTab = 'HOME' }) => {
  // 1. Synchronously read saved tab from localStorage on initial load
  const [currentTab, setCurrentTab] = useState(() => {
    const savedTab = localStorage.getItem('oasis_active_tab');
    return savedTab ? savedTab : initialTab;
  });

  // 2. Automatically save tab state changes to localStorage
  useEffect(() => {
    localStorage.setItem('oasis_active_tab', currentTab);
  }, [currentTab]);

  return (
    <TabContext.Provider value={{ currentTab, setCurrentTab }}>
      {children}
    </TabContext.Provider>
  );
};

export const useTab = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTab must be used within a TabProvider');
  }
  return context;
};