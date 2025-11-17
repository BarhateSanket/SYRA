import React, { useState } from "react";

export function Tabs({ defaultValue, children, className }) {
  const [active, setActive] = useState(defaultValue);
  return (
    <div className={className}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { active, setActive })
      )}
    </div>
  );
}

export function TabsList({ children, className }) {
  return <div className={className}>{children}</div>;
}

export function TabsTrigger({ value, children, active, setActive }) {
  return (
    <button
      className={`px-3 py-2 text-sm border 
        ${active === value ? "bg-black text-white" : "bg-gray-100"}
      `}
      onClick={() => setActive(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, active, children, className }) {
  if (value !== active) return null;
  return <div className={className}>{children}</div>;
}
