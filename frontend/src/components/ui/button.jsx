export function Button({ children, variant = "default", size = "md", ...props }) {
  return (
    <button
      className={`
        px-4 py-2 rounded
        ${variant === "outline" ? "border border-gray-400" : "bg-black text-white"}
        ${size === "sm" ? "text-sm py-1 px-2" : ""}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
