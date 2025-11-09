import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { Message } from "../models/Message";
import { Conversation } from "../models/Conversation";

type JWTpayload = { userId: string };

export function initSocket(httpServer: any) {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        const allowedOrigins = [
          "http://localhost:5173",
          "https://skill-swap-platform-swart.vercel.app",
        ];
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string;
      if (!token) return next(new Error("No token"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTpayload;
      (socket as any).userId = decoded.userId;
      next();
    } catch (e) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = (socket as any).userId;

    // Join user personal room for presence/notifications (optional)
    socket.join(`user:${userId}`);

    // Join conversation rooms when client requests
    socket.on("conversation:join", (conversationId: string) => {
      socket.join(`conv:${conversationId}`);
    });

    // Send a message (persist + broadcast)
    socket.on(
      "message:send",
      async (payload: {
        conversationId: string;
        toUserId: string;
        text: string;
      }) => {
        const fromUserId = userId;
        const { conversationId, toUserId, text } = payload;

        const msg = await Message.create({
          conversation: conversationId,
          from: fromUserId,
          to: toUserId,
          text,
        });

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessageAt: new Date(),
        });

        const messagePayload = {
          _id: msg._id,
          conversation: conversationId,
          from: fromUserId,
          to: toUserId,
          text,
          createdAt: msg.createdAt,
        };
        // Emit to conversation room (open threads)
        io.to(`conv:${conversationId}`).emit("message:new", messagePayload);
        // Also notify recipient's personal room so badges can update even if thread not open
        io.to(`user:${toUserId}`).emit("message:new", messagePayload);
      }
    );

    socket.on(
      "typing",
      ({
        conversationId,
        isTyping,
      }: {
        conversationId: string;
        isTyping: boolean;
      }) => {
        socket
          .to(`conv:${conversationId}`)
          .emit("typing", { userId, isTyping });
      }
    );
  });

  return io;
}
