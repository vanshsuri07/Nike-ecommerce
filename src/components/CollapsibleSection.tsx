"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
}

export default function CollapsibleSection({ title, children, isOpen: defaultOpen = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-light-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full py-6 text-left"
      >
        <h3 className="text-xl sm:text-2xl font-semibold text-dark-900">{title}</h3>
        <ChevronDown
          className={`w-6 h-6 text-dark-900 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && <div className="pb-6 text-dark-700">{children}</div>}
    </div>
  );
}
