"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface WorkspaceLayoutContextType {
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  topBarHeight: number;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setLeftSidebarOpen: (open: boolean) => void;
  setRightSidebarOpen: (open: boolean) => void;
}

const WorkspaceLayoutContext = createContext<WorkspaceLayoutContextType | undefined>(undefined);

export function useWorkspaceLayout() {
  const context = useContext(WorkspaceLayoutContext);
  if (context === undefined) {
    throw new Error("useWorkspaceLayout must be used within a WorkspaceLayoutProvider");
  }
  return context;
}

interface WorkspaceLayoutProviderProps {
  children: React.ReactNode;
  defaultLeftOpen?: boolean;
  defaultRightOpen?: boolean;
}

export function WorkspaceLayoutProvider({
  children,
  defaultLeftOpen = true,
  defaultRightOpen = true
}: WorkspaceLayoutProviderProps) {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(defaultLeftOpen);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(defaultRightOpen);
  const [topBarHeight] = useState(56); // 14 * 4 = 56px (h-14 in Tailwind)

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedLeftOpen = localStorage.getItem("workspace-left-sidebar");
    const savedRightOpen = localStorage.getItem("workspace-right-sidebar");

    if (savedLeftOpen !== null) {
      setLeftSidebarOpen(savedLeftOpen === "true");
    }
    if (savedRightOpen !== null) {
      setRightSidebarOpen(savedRightOpen === "true");
    }
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem("workspace-left-sidebar", leftSidebarOpen.toString());
  }, [leftSidebarOpen]);

  useEffect(() => {
    localStorage.setItem("workspace-right-sidebar", rightSidebarOpen.toString());
  }, [rightSidebarOpen]);

  const toggleLeftSidebar = () => {
    setLeftSidebarOpen(prev => !prev);
  };

  const toggleRightSidebar = () => {
    setRightSidebarOpen(prev => !prev);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "b":
            e.preventDefault();
            toggleLeftSidebar();
            break;
          case "j":
            e.preventDefault();
            toggleRightSidebar();
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, []);

  const contextValue: WorkspaceLayoutContextType = {
    leftSidebarOpen,
    rightSidebarOpen,
    topBarHeight,
    toggleLeftSidebar,
    toggleRightSidebar,
    setLeftSidebarOpen,
    setRightSidebarOpen,
  };

  return (
    <WorkspaceLayoutContext.Provider value={contextValue}>
      {children}
    </WorkspaceLayoutContext.Provider>
  );
}