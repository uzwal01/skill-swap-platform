import React, { useEffect, useState } from "react";
import { useMessageStore } from "@/store/messageStore";
import { useAuthStore } from "@/store/authStore";
import ConversationModal from "@/components/ConversationModal";
import { getMessages } from "@/services/messageService";
import { MoveRight } from "lucide-react";

type LastPreview = {
  text: string;
  createdAt: string;
  from?: string;
  to?: string;
};
type LastByConvMap = Record<string, LastPreview>;

const MessagesPane: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const loadConversations = useMessageStore((s) => s.loadConversations);
  const conversations = useMessageStore((s) => s.conversations);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [lastByConv, setLastByConv] = useState(() => ({} as LastByConvMap));

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load latest message preview for each conversation
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const entries = await Promise.all(
        conversations.map(async (c) => {
          try {
            const page = await getMessages(c._id, undefined, 1);
            const m = page.data[page.data.length - 1];
            if (!m) return [c._id, undefined] as const;
            // Parse seeded "Skill Request" text to show a skill chip
            let from: string | undefined;
            let to: string | undefined;
            const rx =
              /learn\s+([^\s]+.*?)\s+and can offer\s+([^\s]+.*?)(\.|\s|$)/i;
            const match = m.text.match(rx);
            if (match) {
              to = match[1];
              from = match[2];
            }
            return [
              c._id,
              { text: m.text, createdAt: m.createdAt, from, to },
            ] as const;
          } catch {
            return [c._id, undefined] as const;
          }
        })
      );
      if (cancelled) return;
      const next: LastByConvMap = {} as LastByConvMap;
      for (const [id, v] of entries) if (v) next[id] = v;
      setLastByConv(next);
    };
    if (conversations.length) load();
    return () => {
      cancelled = true;
    };
  }, [conversations]);

  return (
    <div className="grid grid-cols-3 gap-4">
      <aside className="col-span-3 rounded-xl border border-gray-100 shadow-sm bg-white p-3">
        <h3 className="mb-2 text-sm font-semibold">Conversations</h3>
        <ul className="space-y-1 text-sm">
          {conversations.map((c) => {
            const other = c.participants.find((p) => p._id !== user?._id);
            const initials = (other?.name || "U")
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();
            const last = lastByConv[c._id];
            return (
              <li key={c._id} className="border border-gray-200 rounded-lg">
                <button
                  className={`w-full rounded-lg px-3 py-3 text-left flex items-start justify-between overflow-hidden transition ${
                    activeConv === c._id ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveConv(c._id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-200 text-xs font-semibold text-blue-600">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {other?.name || "Conversation"}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-gray-600 max-w-[220px] sm:max-w-[320px]">
                        {last?.text || " "}
                      </div>
                      {last?.from && last?.to && (
                        <span className="mt-2 inline-flex items-center self-center gap-2 font-medium rounded bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700">
                          {`${last.from}`} <MoveRight className="w-3 h-3" />{" "}
                          {`${last.to}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-gray-500">
                      {new Date(
                        last?.createdAt || c.lastMessageAt || ""
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    {c.unread ? (
                      <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] text-white">
                        {c.unread}
                      </span>
                    ) : null}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {activeConv && (
        <ConversationModal
          conversationId={activeConv}
          onClose={() => setActiveConv(null)}
        />
      )}
    </div>
  );
};

export default MessagesPane;
