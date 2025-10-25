import React from "react";
import { User } from "@/types/User";

type Props = {
  user: User;
  onRequest?: (user: User) => void;
};

const UserCard: React.FC<Props> = ({ user, onRequest }) => {
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const topTeach = (user.skillsOffered || []).slice(0, 2);

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold">
          {initials}
        </div>
        <div>
          <div className="font-medium">{user.name}</div>
          <div className="text-xs text-gray-500">{user.email}</div>
        </div>
      </div>

      <div className="text-sm">
        <div className="mb-1 text-gray-600">Can teach:</div>
        <div className="flex flex-wrap gap-2">
          {topTeach.length === 0 ? (
            <span className="text-xs text-gray-400">No skills listed</span>
          ) : (
            topTeach.map((s, i) => (
              <span key={i} className="rounded bg-gray-100 px-2 py-0.5 text-xs">
                {s.skill}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm text-gray-600">Member since: </span>
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
            className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
          >
            Request Swap
          </button>
        )}
      </div>
    </div>
  );
};

export default UserCard;
