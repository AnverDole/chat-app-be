import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { FriendRequest } from "./friend-request.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    first_name: string;

    @Column()
    last_name: string;

    @OneToMany(() => FriendRequest, (request) => request.sender)
    outgoingRequests: FriendRequest[];

    @OneToMany(() => FriendRequest, (request) => request.receiver)
    incomingRequests: FriendRequest[];
}
