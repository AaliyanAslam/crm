import { Server } from "socket.io";
import { Message, User } from "@/models";
import { connectDB } from "@/config/sequelize";

export const config = {
    api: {
        bodyParser: false,
        externalResolver: true,
    },
};

export default function SocketHandler(req, res) {
    if (res.socket.server.io) {
        res.end();
        return;
    }

    const io = new Server(res.socket.server, {
        path: "/api/socket",
        addTrailingSlash: false,
        connectTimeout: 45_000,
        pingTimeout: 30_000,
        pingInterval: 10_000,
        transports: ["websocket", "polling"],
        allowUpgrades: true,
        cors: {
            origin: true,
            credentials: true,
            methods: ["GET", "POST", "OPTIONS"],
        },
    });
    res.socket.server.io = io;

    io.on("connection", (socket) => {
        socket.on("join_room", async (roomId) => {
            if (!roomId) return;
            try {
                await socket.join(String(roomId));
            } catch (e) {
                console.error("join_room error:", e);
            }
        });

        socket.on("leave_room", async (roomId) => {
            if (!roomId) return;
            try {
                await socket.leave(String(roomId));
            } catch (e) {
                console.error("leave_room error:", e);
            }
        });

        socket.on("send_msg", async (data) => {
            try {
                if (!data?.room_id || data.user_id == null || !data.text?.trim()) {
                    return;
                }

                await connectDB();

                const msg = await Message.create({
                    room_id: data.room_id,
                    user_id: data.user_id,
                    text: data.text.trim(),
                });

                const fullMsg = await Message.findByPk(msg.id, {
                    include: [{ model: User, as: "sender", attributes: ["name"] }],
                });

                await socket.join(String(data.room_id));

                const payload = fullMsg ? fullMsg.get({ plain: true }) : null;
                if (payload) {
                    io.to(String(data.room_id)).emit("receive_msg", payload);
                }
            } catch (err) {
                console.error("❌ Save Error:", err);
            }
        });

        socket.on("update_msg", (data) => {
            if (data?.room_id) {
                io.to(String(data.room_id)).emit("update_msg", data);
            }
        });

        socket.on("delete_msg", (data) => {
            if (data?.room_id) {
                io.to(String(data.room_id)).emit("delete_msg", data);
            }
        });
    });

    res.end();
}
