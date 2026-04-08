import React from "react";
import { WorkerSidebar } from "@/components/worker/Dashboard/WorkerSidebar";

interface WorkerLayoutProps {
  children: React.ReactNode;
}

export const WorkerLayout: React.FC<WorkerLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-muted">
      <WorkerSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
};
