import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { AuthService } from "src/auth/auth.service";
import { ChatService } from "./chat.service";
import { AuthenticatedSocket } from "src/types/authenticated-socket";

@WebSocketGateway({
    cors: {
        origin: "*",
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private userSocketMap: Map<string, AuthenticatedSocket[]> = new Map();
    private socketUserMap: Map<string, string> = new Map();

    constructor(
        private readonly authService: AuthService,
        private readonly chatService: ChatService,
    ) { }

    async handleConnection(client: AuthenticatedSocket) {
        try {
            if (!(client.handshake?.auth?.token ?? null)) client.disconnect();

            const token = client.handshake?.auth?.token as string;
            const user = await this.authService.getAuthUser(token);
            if (!user) {
                client.disconnect();
                return;
            }

            // Save mapping
            const existingConnections =
                (this.userSocketMap.get(user.id) as AuthenticatedSocket[]) ??
                [];
            existingConnections.push(client);
            this.userSocketMap.set(user.id, existingConnections);

            this.socketUserMap.set(client.id, user.id);
            client.data = {
                user: {
                    id: user.id,
                },
            };
        } catch (err: any) {
            console.error("Socket auth error:", err);
            client.disconnect();
        }
    }

    handleDisconnect(client: AuthenticatedSocket) {
        try {
            const userId = this.socketUserMap.get(client.id);
            if (!userId) {
                client.disconnect();
                return;
            }

            this.userSocketMap.delete(userId);
            this.socketUserMap.delete(client.id);
        } catch (err: any) {
            console.error("Socket disconnect error:", err);
        }

        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage("send_message")
    async handleSendMessage(
        @MessageBody() data: { receiver_id: string; message: string },
        @ConnectedSocket() client: AuthenticatedSocket,
    ) {
        try {
            if (!data.receiver_id) return;
            if (!client.data.user.id) return;
            if (data.message.length <= 0) return;

            const newMessage = await this.chatService.createNewMessage(
                client.data.user.id,
                data.receiver_id,
                data.message,
            );
            const receiverConnections = this.userSocketMap.get(
                data.receiver_id,
            );
            receiverConnections?.forEach((connection) => {
                connection.emit("receive_message", newMessage);
            });

            const senderConnections = this.userSocketMap.get(
                client.data.user.id,
            );
            senderConnections?.forEach((connection) => {
                connection.emit("message_sent", newMessage);
            });
        } catch (err) {
            console.error("Socket message delivery error:", err);
        }
    }
    @SubscribeMessage("send_message_delivered_notification")
    async handleOnMessageDelivered(
        @MessageBody() data: { message_id: string },
        @ConnectedSocket() client: AuthenticatedSocket,
    ) {
        try {
            if (!data.message_id) return;

            let message = await this.chatService.getMessage(data.message_id);
            if (!message) return;
            if (client.data.user?.id == message.sender_id) return;

            message = await this.chatService.markAsDelivered(data.message_id);
            if (!message) return;

            const receiverConnections = this.userSocketMap.get(
                message.sender_id,
            );
            receiverConnections?.forEach((connection) => {
                connection.emit(
                    "on_message_delivered_update_notification",
                    message,
                );
            });
        } catch (err) {
            console.error("Socket message delivery error:", err);
        }
    }

    @SubscribeMessage("send_message_seen_notification")
    async handleOnMessageSeen(
        @MessageBody() data: { message_id: string },
        @ConnectedSocket() client: AuthenticatedSocket,
    ) {
        try {
            if (!data.message_id) return;

            let message = await this.chatService.getMessage(data.message_id);
            if (!message) return;
            if (client.data.user?.id == message.sender_id) return;

            message = await this.chatService.markAsSeen(data.message_id);
            if (!message) return;

            const receiverConnections = this.userSocketMap.get(
                message.sender_id,
            );
            receiverConnections?.forEach((connection) => {
                connection.emit("on_message_seen_update_notification", message);
            });
        } catch (err) {
            console.error("Socket message delivery error:", err);
        }
    }
}
