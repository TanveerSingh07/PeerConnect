import React from "react";

export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex space-x-4 border-b border-gray-300 dark:border-gray-700 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`pb-2 font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 ${
            activeTab === tab.id
              ? "border-b-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400"
              : ""
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
