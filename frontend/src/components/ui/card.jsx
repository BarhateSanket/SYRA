export function Card({ className, ...props }) {
  return <div className={`rounded-lg border p-4 shadow-sm ${className}`} {...props} />;
}

export function CardHeader({ className, ...props }) {
  return <div className={`mb-2 ${className}`} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h2 className={`text-lg font-semibold ${className}`} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={className} {...props} />;
}
