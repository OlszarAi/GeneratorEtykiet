import React from 'react';

interface CompanyInfoFormProps {
  companyName: string;
  onUpdateCompanyName: (name: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function CompanyInfoForm({ 
  companyName, 
  onUpdateCompanyName, 
  onBack, 
  onNext 
}: CompanyInfoFormProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">3. Company Information</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => onUpdateCompanyName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Enter company name"
        />
      </div>
      <div className="flex gap-4 mt-4">
        <button
          onClick={onBack}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}