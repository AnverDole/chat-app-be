import {
    BadRequestException,
    ConflictException,
    Get,
    Injectable,
    NotFoundException,
    Post,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import { User } from "src/entities/user.entity";
import { FindPeopleDto } from "./dto/find-people.dto";
import { FriendRequest } from "src/entities/friend-request.entity";
import { RequestsDto } from "./dto/requests.dto";

export enum FriendStatus {
    None = 0,
    Friend = 10,
    Pending = 20,
}

interface FindPeopleResponse {
    users: User[];
    limit: number;
    page: number;
}
interface RequestsResponse {
    users: User[];
    limit: number;
    page: number;
}

@Injectable()
export class FriendsService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(FriendRequest)
        private readonly friendRequestRepository: Repository<FriendRequest>,
    ) {}

    async findPeople(
        data: FindPeopleDto,
        userId: string,
    ): Promise<FindPeopleResponse> {
        let limit = data.per_page ?? 10;
        if (limit < 0) limit = 10;

        const page = Math.max(1, data.page ?? 1);
        const offset = (page - 1) * limit;

        const searchTerm = `${data.search_term}%`; // match from beginning
        let users = await this.userRepository
            .createQueryBuilder("user")
            .where("user.email = :email", { email: data.search_term })
            .orWhere("user.first_name like :term", { term: searchTerm })
            .orWhere("user.last_name like :term", { term: searchTerm })
            .orWhere(
                `CONCAT(user.first_name, " ", user.last_name) like :term`,
                { term: searchTerm },
            )
            .skip(offset)
            .take(limit)
            .getMany();

        users = await Promise.all(
            users.map(async (u) => {
                const requests = await this.friendRequestRepository
                    .createQueryBuilder("requests")
                    .where("requests.sender_user_id = :sender", {
                        sender: userId,
                    })
                    .andWhere("requests.receiver_user_id = :receiver", {
                        receiver: u.id,
                    })
                    .getMany();

                return {
                    ...u,
                    friend_status:
                        requests.length > 0
                            ? requests[0].status
                            : FriendStatus.None,
                };
            }),
        );

        return {
            users,
            limit,
            page,
        };
    }

    async getRequests(
        data: RequestsDto,
        userId: string,
    ): Promise<RequestsResponse> {
        let limit = data.per_page ?? 10;
        if (limit < 0) limit = 10;

        const page = Math.max(1, data.page ?? 1);
        const offset = (page - 1) * limit;

        let users = await this.userRepository
            .createQueryBuilder("user")
            .leftJoin("user.incomingRequests", "incomingRequest")
            .leftJoin("user.outgoingRequests", "outgoingRequest")
            .where(
                new Brackets((qb) => {
                    qb.andWhere(
                        new Brackets((qb) => {
                            qb.where(
                                "incomingRequest.sender_user_id = :senderId",
                                {
                                    senderId: userId,
                                },
                            ).andWhere("incomingRequest.status = :pending", {
                                pending: FriendStatus.Pending,
                            });
                        }),
                    ).orWhere(
                        new Brackets((qb) => {
                            qb.where(
                                "outgoingRequest.receiver_user_id = :receiverId",
                                {
                                    receiverId: userId,
                                },
                            ).andWhere("outgoingRequest.status = :pending", {
                                pending: FriendStatus.Pending,
                            });
                        }),
                    );
                }),
            )

            .andWhere(
                new Brackets((qb) => {
                    if (data?.search_term?.length > 1) {
                        const searchTerm = `${data.search_term}%`; // match from beginning

                        qb.where("user.email = :email", {
                            email: data.search_term,
                        })
                            .orWhere("user.first_name like :term", {
                                term: searchTerm,
                            })
                            .orWhere("user.last_name like :term", {
                                term: searchTerm,
                            })
                            .orWhere(
                                `CONCAT(user.first_name, " ", user.last_name) like :term`,
                                { term: searchTerm },
                            );
                    }
                }),
            )
            .skip(offset)
            .take(limit)
            .getMany();

        users = await Promise.all(
            users.map(async (u) => {
                const requests = await this.friendRequestRepository
                    .createQueryBuilder("requests")

                    .where("requests.sender_user_id = :sender", {
                        sender: userId,
                    })
                    .andWhere("requests.receiver_user_id = :receiver", {
                        receiver: u.id,
                    })
                    .getMany();

                return {
                    ...u,
                    sent_by_me: requests.length > 0,
                    friend_status:
                        requests.length > 0
                            ? requests[0].status
                            : FriendStatus.None,
                };
            }),
        );

        return {
            users,
            limit,
            page,
        };
    }
    async getFriends(
        data: RequestsDto,
        userId: string,
    ): Promise<RequestsResponse> {
        let limit = data.per_page ?? 10;
        if (limit < 0) limit = 10;

        const page = Math.max(1, data.page ?? 1);
        const offset = (page - 1) * limit;

        let users = await this.userRepository
            .createQueryBuilder("user")
            .leftJoin("user.incomingRequests", "incomingRequest")
            .leftJoin("user.outgoingRequests", "outgoingRequest")
            .where(
                new Brackets((qb) => {
                    qb.andWhere(
                        new Brackets((qb) => {
                            qb.where(
                                "incomingRequest.sender_user_id = :senderId",
                                {
                                    senderId: userId,
                                },
                            ).andWhere("incomingRequest.status = :friend", {
                                friend: FriendStatus.Friend,
                            });
                        }),
                    ).orWhere(
                        new Brackets((qb) => {
                            qb.where(
                                "outgoingRequest.receiver_user_id = :receiverId",
                                {
                                    receiverId: userId,
                                },
                            ).andWhere("outgoingRequest.status = :friend", {
                                friend: FriendStatus.Friend,
                            });
                        }),
                    );
                }),
            )

            .andWhere(
                new Brackets((qb) => {
                    if (data?.search_term?.length > 1) {
                        const searchTerm = `${data.search_term}%`; // match from beginning

                        qb.where("user.email = :email", {
                            email: data.search_term,
                        })
                            .orWhere("user.first_name like :term", {
                                term: searchTerm,
                            })
                            .orWhere("user.last_name like :term", {
                                term: searchTerm,
                            })
                            .orWhere(
                                `CONCAT(user.first_name, " ", user.last_name) like :term`,
                                { term: searchTerm },
                            );
                    }
                }),
            )
            .skip(offset)
            .take(limit)
            .getMany();

        users = await Promise.all(
            users.map(async (u) => {
                const requests = await this.friendRequestRepository
                    .createQueryBuilder("requests")

                    .where("requests.sender_user_id = :sender", {
                        sender: userId,
                    })
                    .andWhere("requests.receiver_user_id = :receiver", {
                        receiver: u.id,
                    })
                    .getMany();

                return {
                    ...u,
                    sent_by_me: requests.length > 0,
                    friend_status:
                        requests.length > 0
                            ? requests[0].status
                            : FriendStatus.None,
                };
            }),
        );

        return {
            users,
            limit,
            page,
        };
    }

    async sendRequest(
        senderId: string,
        receiverId: string,
    ): Promise<FriendRequest> {
        if (senderId === receiverId) {
            throw new BadRequestException(
                "You cannot send a friend request to yourself.",
            );
        }

        const sender = await this.userRepository.findOne({
            where: { id: senderId },
        });
        const receiver = await this.userRepository.findOne({
            where: { id: receiverId },
        });

        if (!sender || !receiver) {
            throw new NotFoundException("Invalid receiver.");
        }

        const existingRequest = await this.friendRequestRepository.findOne({
            where: [
                { sender: sender, receiver: receiver },
                { sender: receiver, receiver: sender }, // avoid duplicates in reverse
            ],
        });

        if (existingRequest) {
            throw new ConflictException("A friend request already exists.");
        }

        const request = this.friendRequestRepository.create({
            sender: sender,
            receiver: receiver,
            status: FriendStatus.Pending,
        });

        return await this.friendRequestRepository.save(request);
    }

    async cancelRequest(
        senderId: string,
        receiverId: string,
    ): Promise<{ success: boolean }> {
        const sender = await this.userRepository.findOne({
            where: { id: senderId },
        });
        const receiver = await this.userRepository.findOne({
            where: { id: receiverId },
        });

        if (!sender || !receiver) {
            throw new NotFoundException("Invalid sender or receiver.");
        }

        const existingRequest = await this.friendRequestRepository.findOne({
            where: [{ sender, receiver }, { status: FriendStatus.Pending }],
        });

        if (!existingRequest) {
            throw new NotFoundException("No friend request found to cancel.");
        }

        await this.friendRequestRepository.remove(existingRequest);

        return { success: true };
    }
    async rejectRequest(
        senderId: string,
        receiverId: string,
    ): Promise<{ success: boolean }> {
        const sender = await this.userRepository.findOne({
            where: { id: senderId },
        });
        const receiver = await this.userRepository.findOne({
            where: { id: receiverId },
        });

        if (!sender || !receiver) {
            throw new NotFoundException("Invalid sender or receiver.");
        }

        const existingRequest = await this.friendRequestRepository.findOne({
            where: [{ sender, receiver }, { status: FriendStatus.Pending }],
        });

        if (!existingRequest) {
            throw new NotFoundException("No friend request found to reject.");
        }

        await this.friendRequestRepository.remove(existingRequest);

        return { success: true };
    }
    async approveRequest(
        senderId: string,
        receiverId: string,
    ): Promise<{ success: boolean }> {
        const sender = await this.userRepository.findOne({
            where: { id: senderId },
        });
        const receiver = await this.userRepository.findOne({
            where: { id: receiverId },
        });

        if (!sender || !receiver) {
            throw new NotFoundException("Invalid sender or receiver.");
        }

        const existingRequest = await this.friendRequestRepository.findOne({
            where: {
                sender: sender,
                receiver: receiver,
                status: FriendStatus.Pending,
            },
        });

        if (!existingRequest) {
            throw new NotFoundException(
                "No pending friend request found to approve.",
            );
        }

        existingRequest.status = FriendStatus.Friend; 
        await this.friendRequestRepository.save(existingRequest);

        return { success: true };
    }

    async unFriend(
        senderId: string,
        receiverId: string,
    ): Promise<{ success: boolean }> {
        const sender = await this.userRepository.findOne({
            where: { id: senderId },
        });
        const receiver = await this.userRepository.findOne({
            where: { id: receiverId },
        });

        if (!sender || !receiver) {
            throw new NotFoundException("Invalid sender or receiver.");
        }

        const existingRequest = await this.friendRequestRepository.findOne({
            where: [
                { sender, receiver },
                { sender: receiver, receiver: sender }, // reverse direction if needed
                { status: FriendStatus.Friend },
            ],
        });

        if (!existingRequest) {
            throw new NotFoundException("No friend request found to cancel.");
        }

        await this.friendRequestRepository.remove(existingRequest);

        return { success: true };
    }
}
