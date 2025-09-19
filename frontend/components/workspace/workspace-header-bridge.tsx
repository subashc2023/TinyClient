"use client";

import { useEffect } from "react";
import { useWorkspaceLayout } from "@/lib/workspace-layout-context";

interface WorkspaceControls {
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
}

interface WorkspaceHeaderBridgeProps {
  setWorkspaceControls: (controls: WorkspaceControls) => void;
}

export function WorkspaceHeaderBridge({ setWorkspaceControls }: WorkspaceHeaderBridgeProps) {
  const {
    leftSidebarOpen,
    rightSidebarOpen,
    toggleLeftSidebar,
    toggleRightSidebar,
  } = useWorkspaceLayout();

  useEffect(() => {
    setWorkspaceControls({
      leftSidebarOpen,
      rightSidebarOpen,
      toggleLeftSidebar,
      toggleRightSidebar,
    });
  }, [leftSidebarOpen, rightSidebarOpen, toggleLeftSidebar, toggleRightSidebar, setWorkspaceControls]);

  return null;
}
