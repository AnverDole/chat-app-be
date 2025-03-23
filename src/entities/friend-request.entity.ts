import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    Index,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity()
@Index("IDX_user_pair", ["sender_user_id", "receiver_user_id"], {
    unique: true,
})
@Index("IDX_user_pair_inverse", ["receiver_user_id", "sender_user_id"], {
    unique: true,
})
export class FriendRequest {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    @Index()
    sender_user_id: string;

    @Column()
    @Index()
    receiver_user_id: string;

    @Index()
    @Column()
    status: number;

    @ManyToOne(() => User, (user) => user.outgoingRequests)
    @JoinColumn({ name: "sender_user_id" })
    sender: User;

    @ManyToOne(() => User, (user) => user.incomingRequests)
    @JoinColumn({ name: "receiver_user_id" })
    receiver: User;
}
