import { Outlet } from "react-router";
import React from "react";

export const AppLayout: React.FC = () => {
  return (
    <main className="min-h-full h-full relative">
      <Outlet />
    </main>
  );
};
