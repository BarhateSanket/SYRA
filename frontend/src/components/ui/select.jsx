import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const SelectContext = React.createContext();

const Select = ({ children, value, onValueChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { isOpen, setIsOpen } = React.useContext(SelectContext);

  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      ref={ref}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
});

SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = ({ placeholder }) => {
  const { value } = React.useContext(SelectContext);

  return <span className={value ? '' : 'text-muted-foreground'}>{value || placeholder}</span>;
};

const SelectContent = ({ children }) => {
  const { isOpen, setIsOpen } = React.useContext(SelectContext);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50"
        onClick={() => setIsOpen(false)}
      />
      <div className="absolute top-full z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80">
        {children}
      </div>
    </>
  );
};

const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const { onValueChange, setIsOpen } = React.useContext(SelectContext);

  const handleClick = () => {
    onValueChange(value);
    setIsOpen(false);
  };

  return (
    <div
      className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${className}`}
      onClick={handleClick}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});

SelectItem.displayName = 'SelectItem';

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };