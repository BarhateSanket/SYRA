export function Badge({ children, variant = "default" }) {
  return (
    <span className={`text-xs px-2 py-1 rounded 
      ${variant === "secondary" ? "bg-gray-200" : ""}
      ${variant === "outline" ? "border border-gray-400" : ""}
    `}>
      {children}
    </span>
  );
}
