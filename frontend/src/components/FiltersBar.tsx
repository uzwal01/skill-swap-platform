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
    <div className="rounded border bg-white p-4">
      <div className="mb-4 text-sm font-semibold">Filters</div>
      <div className="mb-4">
        <label className="mb-1 block text-sm">Skill Categories</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`rounded border px-2 py-1 text-xs ${value.category === c ? 'bg-black text-white' : 'bg-white'}`}
              onClick={() => onChange({ ...value, category: value.category === c ? undefined : c })}
              type="button"
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm">Specific Skill</label>
        <input
          className="w-full rounded border px-3 py-2 text-sm"
          placeholder="e.g. React, Photoshop"
          value={value.skill ?? ''}
          onChange={(e) => onChange({ ...value, skill: e.target.value })}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="rounded border px-3 py-1 text-sm"
          onClick={onReset}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default FiltersBar;

