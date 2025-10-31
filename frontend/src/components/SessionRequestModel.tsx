import React, { useMemo, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Match } from "@/types/Match";
import { User } from "@/types/User";
import { CreateSessionData } from "@/services/sessionService";

type Props = {
  open: boolean;
  match: Match | User;
  onClose: () => void;
  onSubmit: (data: CreateSessionData) => Promise<void> | void;
};

type Availability = 'weekdays' | 'weekends' | 'any';
type Duration = 30 | 60 | 90 | 120;

const SessionRequestModel: React.FC<Props> = ({ open, match, onClose, onSubmit }) => {
  const user = useAuthStore((s) => s.user);
  const [fromUserSkill, setFromUserSkill] = useState("");
  const [toUserSkill, setToUserSkill] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [message, setMessage] = useState("");
  const [availability, setAvailability] = useState<Availability | undefined>(undefined);
  const [durationMinutes, setDurationMinutes] = useState<Duration | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const teachOptions = useMemo(() => {
    if (!user) return [] as { skill: string; category: string }[];
    return user.skillsOffered.filter((mine) =>
      match.skillsWanted.some((their) => their.skill === mine.skill)
    );
  }, [user, match]);

  const learnOptions = useMemo(() => {
    if (!user) return [] as { skill: string; category: string }[];
    return user.skillsWanted.filter((mine) =>
      match.skillsOffered.some((their) => their.skill === mine.skill)
    );
  }, [user, match]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setSubmitting(true);
      await onSubmit({
        toUser: match._id,
        fromUserSkill,
        toUserSkill,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        message: message.trim() || undefined,
        availability,
        durationMinutes,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold">Request Session with {match.name}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">What you can teach</label>
            <select
              className="p-2 border border-gray-300 text-sm rounded-md focus:ring-1 focus:ring-blue-300 focus:outline-none w-full"
              value={fromUserSkill}
              onChange={(e) => setFromUserSkill(e.target.value)}
              required
            >
              <option value="" disabled>
                Select a skill
              </option>
              {teachOptions.map((opt, idx) => (
                <option key={idx} value={opt.skill}>
                  {opt.category}: {opt.skill}
                </option>
              ))}
            </select>
            {teachOptions.length === 0 && (
              <p className="mt-1 text-xs text-gray-500">
                No matching skills found that they want to learn.
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">What you want to learn</label>
            <select
              className="p-2 border border-gray-300 text-sm rounded-md focus:ring-1 focus:ring-blue-300 focus:outline-none w-full"
              value={toUserSkill}
              onChange={(e) => setToUserSkill(e.target.value)}
              required
            >
              <option value="" disabled>
                Select a skill
              </option>
              {learnOptions.map((opt, idx) => (
                <option key={idx} value={opt.skill}>
                  {opt.category}: {opt.skill}
                </option>
              ))}
            </select>
            {learnOptions.length === 0 && (
              <p className="mt-1 text-xs text-gray-500">
                No matching skills found that they can teach.
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Your Message</label>
            <textarea
              className="p-2 border border-gray-300 text-sm rounded-md focus:ring-1 focus:ring-blue-300 focus:outline-none w-full"
              rows={3}
              placeholder="I want to learn ..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Availability</label>
              <select
                className="p-2 border border-gray-300 text-sm rounded-md focus:ring-1 focus:ring-blue-300 focus:outline-none w-full"
                value={availability ?? ''}
                onChange={(e) => setAvailability(e.target.value ? (e.target.value as Availability) : undefined)}
              >
                <option value="">Select availability</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends</option>
                <option value="any">Any</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Session Duration</label>
              <select
                className="p-2 border border-gray-300 text-sm rounded-md focus:ring-1 focus:ring-blue-300 focus:outline-none w-full"
                value={durationMinutes ?? ''}
                onChange={(e) => {
                  const v = e.target.value ? (Number(e.target.value) as Duration) : undefined;
                  setDurationMinutes(v);
                }}
              >
                <option value="">Select duration</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Schedule (optional)</label>
            <input
              type="datetime-local"
              className="p-2 border border-gray-300 text-sm rounded-md focus:ring-1 focus:ring-blue-300 focus:outline-none w-full"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border text-sm border-red-100 text-red-400 hover:bg-red-400 transition hover:text-white px-3 py-2"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded text-sm bg-blue-500 hover:bg-blue-600 transition px-3 py-2 text-white disabled:opacity-50"
              disabled={submitting || teachOptions.length === 0 || learnOptions.length === 0}
            >
              {submitting ? "Requesting..." : "Request Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionRequestModel;
