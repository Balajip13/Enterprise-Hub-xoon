import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  Icon: React.ElementType;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ name, placeholder, value, onChange, required = false, Icon }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative text-left">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
      <input 
        type={showPassword ? 'text' : 'password'}
        name={name}
        placeholder={placeholder}
        autoComplete="new-password"
        className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400 text-[14px]"
        style={{ height: '44px' }}
        value={value}
        onChange={onChange}
        required={required}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default PasswordInput;
