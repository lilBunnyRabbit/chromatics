import { cn } from "@/lib/utils";
import { ChevronDown, ChevronLeft } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";

interface CollapsableProps {
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const Collapsable = ({ title, children, className }: CollapsableProps) => {
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <>
      <div className={cn("flex items-center justify-start gap-4 border-y py-2", className)}>
        <Button size="sm" onClick={() => setCollapsed((c) => !c)}>
          {collapsed ? <ChevronLeft /> : <ChevronDown />}
        </Button>
        <h4>{title}</h4>
      </div>

      {!collapsed && children}
    </>
  );
};
