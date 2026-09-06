import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import './Dropdown.css';

export interface DropdownOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  onSelect: (value: string) => void;
  pill?: boolean;
  align?: 'left' | 'right';
  className?: string;
}

export default function Dropdown({
  options,
  value,
  placeholder = 'Select option',
  onSelect,
  pill = false,
  align = 'left',
  className = '',
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`dropdown ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className={`dropdown-toggle ${pill ? 'pill' : ''}`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {selectedOption ? (
          <>
            {selectedOption.icon}
            <span>{selectedOption.label}</span>
          </>
        ) : (
          <span>{placeholder}</span>
        )}
        <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {open && (
        <div className={`dropdown-menu ${align === 'right' ? 'right' : ''}`}>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`dropdown-item ${opt.value === value ? 'active' : ''}`}
              onClick={() => {
                onSelect(opt.value);
                setOpen(false);
              }}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
