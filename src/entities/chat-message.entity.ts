import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    Index,
    CreateDateColumn,
} from "typeorm";

@Entity()
@Index("IDX_message_sender_receiver_id", ["sender_id", "receiver_id"])
@Index("IDX_message_sender_receiver_id_inverse", ["receiver_id", "sender_id"])
export class ChatMessage {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Index("IDX_chat_message_sender_id")
    @Column()
    sender_id: string;

    @Index("IDX_chat_message_receiver_id")
    @Column()
    receiver_id: string;

    @Column({ type: "longtext" })
    message: string;

    @CreateDateColumn()
    created_at: Date;

    @Column({ nullable: true })
    downloaded_at: Date;

    @Column({ nullable: true })
    seen_at: Date;
}
