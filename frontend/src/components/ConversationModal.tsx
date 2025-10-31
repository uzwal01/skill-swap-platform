import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMessageStore } from "@/store/messageStore";
import { useAuthStore } from "@/store/authStore";
import { SendHorizontal, X } from "lucide-react";

type Props = {
  conversationId: string;
  onClose: () => void;
};

const ConversationModal: React.FC<Props> = ({ conversationId, onClose }) => {
  const user = useAuthStore((s) => s.user);
  const openConversation = useMessageStore((s) => s.openConversation);
  const conversations = useMessageStore((s) => s.conversations);
  const messagesByConv = useMessageStore((s) => s.messages);
  const send = useMessageStore((s) => s.send);

  const [text, setText] = useState("");
  const messages = messagesByConv[conversationId] || [];
  const other = useMemo(() => {
    const conv = conversations.find((c) => c._id === conversationId);
    return conv?.participants.find((p) => p._id !== user?._id);
  }, [conversationId, conversations, user?._id]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const initials = (other?.name || "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  useEffect(() => {
    openConversation(conversationId);
  }, [conversationId, openConversation]);

  useEffect(() => {
    // Auto scroll to bottom when messages change
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  const fmtDate = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    const weekday = d.toLocaleDateString(undefined, { weekday: "long" });
    const day = d.getDate();
    const month = d.toLocaleDateString(undefined, { month: "long" });
    const year = d.getFullYear();
    // Example: Friday, 31 October 2025
    return `${weekday}, ${day} ${month} ${year}`;
  };
  const fmtTime = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    // Force 12-hour with AM/PM
    return d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  const sameDay = (a?: string, b?: string) => {
    if (!a || !b) return false;
    const da = new Date(a),
      db = new Date(b);
    return (
      da.getFullYear() === db.getFullYear() &&
      da.getMonth() === db.getMonth() &&
      da.getDate() === db.getDate()
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-[95vw] h-[92vh] max-w-[95vw] sm:w-full sm:h-auto sm:max-w-3xl max-h-[92vh] sm:max-h-[80vh] rounded-sm sm:rounded-md bg-white p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 p-4 flex items-center border-b border-gray-100 shadow-sm rounded-t-lg justify-between">
          <div className="text-base font-semibold flex gap-2 items-center justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
              {initials}
            </div>
            <div>{other?.name || "Conversation"}</div>
          </div>
          <button
            className="text-red-400 hover:text-red-700 transition"
            onClick={onClose}
          >
            <X />
          </button>
        </div>
        <div
          ref={scrollRef}
          className="mb-3 h-[74vh] max-h-[74vh] sm:max-h-[52vh] sm:h-auto overflow-y-auto overflow-x-hidden border px-2 border-gray-100 shadow-sm"
        >
          {messages.length === 0 ? (
            <p className="text-sm text-gray-500">No messages yet.</p>
          ) : (
            messages.map((m, i) => {
              const showDate =
                i === 0 || !sameDay(messages[i - 1]?.createdAt, m.createdAt);
              const mine = m.from === user?._id;
              return (
                <div key={m._id} className="mb-2">
                  {showDate && (
                    <div className="my-2 flex justify-center">
                      <span className="rounded-full bg-gray-100 px-3 py-0.5 text-[11px] text-gray-600">
                        {fmtDate(m.createdAt)}
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] whitespace-pre-wrap break-words break-all px-3 py-2 text-sm ${
                        mine
                          ? "bg-blue-500 text-white rounded-t-lg rounded-bl-xl shadow-sm "
                          : "bg-gray-100 text-gray-900 rounded-t-lg rounded-br-xl shadow-sm"
                      }`}
                    >
                      <div>{m.text}</div>
                      <div
                        className={`mt-1 text-[10px] ${
                          mine ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {fmtTime(m.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <form
          className="flex gap-2 justify-center items-center"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim() || !other) return;
            send(conversationId, other._id, text.trim());
            setText("");
          }}
        >
          <input
            className="flex-1 border border-gray-300 text-sm rounded-md focus:ring-1 mt-1 focus:ring-blue-300 focus:outline-none w-full p-2"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            className="text-blue-500 hover:text-blue-700 transition p-2 mt-1"
            type="submit"
          >
            <SendHorizontal />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConversationModal;
