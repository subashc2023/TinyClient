"use client";

import { useEffect } from "react";
import { useWorkspaceLayout } from "@/lib/workspace-layout-context";

interface WorkspaceHeaderBridgeProps {
  setWorkspaceControls: (controls: any) => void;
}

export function WorkspaceHeaderBridge({ setWorkspaceControls }: WorkspaceHeaderBridgeProps) {
  const {
    leftSidebarOpen,
    rightSidebarOpen,
    toggleLeftSidebar,
    toggleRightSidebar
  } = useWorkspaceLayout();

  useEffect(() => {
    setWorkspaceControls({
      leftSidebarOpen,
      rightSidebarOpen,
      toggleLeftSidebar,
      toggleRightSidebar
    });
  }, [leftSidebarOpen, rightSidebarOpen, toggleLeftSidebar, toggleRightSidebar, setWorkspaceControls]);

  return null; // This component doesn't render anything
}