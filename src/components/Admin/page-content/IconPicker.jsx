import React from 'react';
import * as LucideIcons from 'lucide-react';

const COMMON_ICONS = [
  'Shirt', 'Users', 'SearchCheck', 'Scissors', 'Maximize', 'Star', 
  'CheckCircle', 'ShieldCheck', 'Award', 'Globe', 'Zap', 'Leaf', 
  'Clock', 'Heart', 'Feather', 'Briefcase', 'Gem', 'ThumbsUp'
];

export default function IconPicker({ value, onChange }) {
  return (
    <div className="border border-gray-300 rounded-md p-4 bg-gray-50 h-64 overflow-y-auto">
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
        {COMMON_ICONS.map((iconName) => {
          const IconComponent = LucideIcons[iconName];
          if (!IconComponent) return null;
          
          const isSelected = value === iconName;
          
          return (
            <button
              key={iconName}
              type="button"
              onClick={() => onChange(iconName)}
              className={`flex flex-col items-center justify-center p-2 rounded-md border transition-colors ${
                isSelected 
                  ? 'bg-black border-black text-white' 
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
              }`}
              title={iconName}
            >
              <IconComponent size={24} strokeWidth={1.5} />
              <span className="mt-1 text-[0.625rem] truncate w-full text-center">{iconName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
