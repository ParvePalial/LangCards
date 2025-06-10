import React from 'react';
import { languageOptions } from '../utils/languageOptions';

interface LanguageSelectorProps {
  value: string;
  onChange: (code: string) => void;
  label: string;
  excludeCode?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  value, 
  onChange, 
  label,
  excludeCode 
}) => {
  const filteredOptions = excludeCode 
    ? languageOptions.filter(lang => lang.code !== excludeCode)
    : languageOptions;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {filteredOptions.map((language) => (
          <option key={language.code} value={language.code}>
            {language.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector; 