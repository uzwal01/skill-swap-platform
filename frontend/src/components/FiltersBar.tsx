import React from "react";
import { BrowseUsersQuery } from "@/services/userService";

type Props = {
  value: BrowseUsersQuery;
  onChange: (next: BrowseUsersQuery) => void;
  onReset?: () => void;
};

const CATEGORIES = [
  "Design",
  "Development",
  "Music",
  "Language",
  "Business",
  "Lifestyle",
  "Photography",
  "Education",
];

const FiltersBar: React.FC<Props> = ({ value, onChange, onReset }) => {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm ">
      <div className="mb-4 text-sm text-gray-900 font-semibold">Filters</div>
      <div className="mb-4">
        <label className="mb-1 block text-gray-600 text-sm">Skill Categories</label>
        <div className="flex flex-wrap mt-2 gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`rounded border border-gray-100 px-2 py-1 text-xs ${value.category === c ? 'bg-blue-400 text-white' : 'bg-gray-100'}`}
              onClick={() => onChange({ ...value, category: value.category === c ? undefined : c })}
              type="button"
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 pt-4">
        <label className="mb-1 block text-gray-600 text-sm ">Specific Skill</label>
        <input
          className="p-2 border border-gray-300 text-sm rounded-md focus:ring-1 mt-2 focus:ring-blue-300 focus:outline-none w-full"
          placeholder="e.g. React, Photoshop"
          value={value.skill ?? ''}
          onChange={(e) => onChange({ ...value, skill: e.target.value })}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition hidden sm:block"
          onClick={onReset}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default FiltersBar;

