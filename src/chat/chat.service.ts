import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatMessage } from "src/entities/chat-message.entity";
import { Brackets, Repository } from "typeorm";
import { User } from "src/entities/user.entity";

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(ChatMessage)
        private readonly chatMessageRepository: Repository<ChatMessage>,
    ) { }

    async getChat(data: {
        sender_id: string;
        receiver_id: string;
        per_page: number | undefined;
        page: number | undefined;
    }): Promise<any> {
        let limit = data.per_page ?? 10;
        if (limit < 0) limit = 10;

        const page = Math.max(1, data.page ?? 1);
        const offset = (page - 1) * limit;

        const chats = await this.chatMessageRepository
            .createQueryBuilder("chats")
            .where(
                new Brackets((qb) => {
                    qb.where(
                        new Brackets((qb) => {
                            qb.where("chats.sender_id = :senderId1", {
                                senderId1: data.sender_id,
                            }).andWhere("chats.receiver_id = :receiverId1", {
                                receiverId1: data.receiver_id,
                            });
                        }),
                    ).orWhere(
                        new Brackets((qb) => {
                            qb.where("chats.sender_id = :senderId2", {
                                senderId2: data.receiver_id,
                            }).andWhere("chats.receiver_id = :receiverId2", {
                                receiverId2: data.sender_id,
                            });
                        }),
                    );
                }),
            )
            .orderBy("created_at", "DESC")
            .skip(offset)
            .take(limit)
            .getMany();

        return {
            chats,
            limit,
            page,
        };
    }
    async getMessage(messageId: string): Promise<ChatMessage | null> {
        return await this.chatMessageRepository.findOne({
            where: { id: messageId },
        });
    }

    async createNewMessage(
        sender_id: string,
        receiver_id: string,
        message: string,
    ): Promise<ChatMessage | { sender_name: string } | null> {
        const sender = await this.userRepository.findOne({
            where: { id: sender_id },
        });
        if (!sender) return null;

        const newMessage = await this.chatMessageRepository.save({
            sender_id,
            receiver_id,
            message,
        });

        return {
            ...newMessage,
            sender_name: sender?.first_name + " " + sender?.last_name,
        };
    }
    async markAsSeen(message_id: string): Promise<ChatMessage | null> {
        const message = await this.chatMessageRepository.findOne({
            where: { id: message_id },
        });
        if (!message) return null;
        if (!message_id) return null;

        message.seen_at = new Date();
        await this.chatMessageRepository.save(message);

        return message;
    }
    async markAsDelivered(message_id: string): Promise<ChatMessage | null> {
        const message = await this.chatMessageRepository.findOne({
            where: { id: message_id },
        });
        if (!message) return null;
        if (!message_id) return null;

        message.downloaded_at = new Date();
        await this.chatMessageRepository.save(message);

        return message;
    }
}
