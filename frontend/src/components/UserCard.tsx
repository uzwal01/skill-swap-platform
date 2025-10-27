import React from "react";
import { User } from "@/types/User";

type Props = {
  user: User;
  onRequest?: (user: User) => void;
  className: string;
};

const UserCard: React.FC<Props> = ({ user, onRequest, className }) => {
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const topTeach = (user.skillsOffered || []).slice(0, 2);

  return (
    <div className={`rounded-xl border border-gray-100 bg-white p-4 shadow-sm ${className}`}>
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
          {initials}
        </div>
        <div>
          <div className="font-medium text-gray-900">{user.name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs uppercase tracking-wide text-gray-400">Can teach:</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {topTeach.length === 0 ? (
            <span className="text-sm text-gray-500">No skills listed</span>
          ) : (
            topTeach.map((s, i) => (
              <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 mt-1 rounded-md">
                {s.skill}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm text-gray-400">Member since: </span>
          <span className="text-xs text-gray-500">
            {new Date(user.createdAt || Date.now()).toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        {onRequest && (
          <button
            onClick={() => onRequest(user)}
            className="rounded-md font-medium transition bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
          >
            Request Swap
          </button>
        )}
      </div>
    </div>
  );
};

export default UserCard;
