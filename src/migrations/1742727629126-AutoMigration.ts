import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1742727629126 implements MigrationInterface {
    name = 'AutoMigration1742727629126'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`friend_request\` (\`id\` varchar(36) NOT NULL, \`sender_user_id\` varchar(255) NOT NULL, \`receiver_user_id\` varchar(255) NOT NULL, \`status\` int NOT NULL, INDEX \`IDX_b90c8b54e39d856aab629e80ee\` (\`sender_user_id\`), INDEX \`IDX_33005a83b93b77c9c596f5b63b\` (\`receiver_user_id\`), INDEX \`IDX_4b49bf01535b1d41801eabe45a\` (\`status\`), UNIQUE INDEX \`IDX_user_pair_inverse\` (\`receiver_user_id\`, \`sender_user_id\`), UNIQUE INDEX \`IDX_user_pair\` (\`sender_user_id\`, \`receiver_user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` varchar(36) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`first_name\` varchar(255) NOT NULL, \`last_name\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`chat_message\` (\`id\` varchar(36) NOT NULL, \`sender_id\` varchar(255) NOT NULL, \`receiver_id\` varchar(255) NOT NULL, \`message\` longtext NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`downloaded_at\` datetime NULL, \`seen_at\` datetime NULL, INDEX \`IDX_chat_message_sender_id\` (\`sender_id\`), INDEX \`IDX_chat_message_receiver_id\` (\`receiver_id\`), INDEX \`IDX_message_sender_receiver_id_inverse\` (\`receiver_id\`, \`sender_id\`), INDEX \`IDX_message_sender_receiver_id\` (\`sender_id\`, \`receiver_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`token\` (\`id\` varchar(36) NOT NULL, \`token\` varchar(512) NOT NULL, \`revoked\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_d9959ee7e17e2293893444ea37\` (\`token\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`friend_request\` ADD CONSTRAINT \`FK_b90c8b54e39d856aab629e80ee2\` FOREIGN KEY (\`sender_user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`friend_request\` ADD CONSTRAINT \`FK_33005a83b93b77c9c596f5b63b1\` FOREIGN KEY (\`receiver_user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`friend_request\` DROP FOREIGN KEY \`FK_33005a83b93b77c9c596f5b63b1\``);
        await queryRunner.query(`ALTER TABLE \`friend_request\` DROP FOREIGN KEY \`FK_b90c8b54e39d856aab629e80ee2\``);
        await queryRunner.query(`DROP INDEX \`IDX_d9959ee7e17e2293893444ea37\` ON \`token\``);
        await queryRunner.query(`DROP TABLE \`token\``);
        await queryRunner.query(`DROP INDEX \`IDX_message_sender_receiver_id\` ON \`chat_message\``);
        await queryRunner.query(`DROP INDEX \`IDX_message_sender_receiver_id_inverse\` ON \`chat_message\``);
        await queryRunner.query(`DROP INDEX \`IDX_chat_message_receiver_id\` ON \`chat_message\``);
        await queryRunner.query(`DROP INDEX \`IDX_chat_message_sender_id\` ON \`chat_message\``);
        await queryRunner.query(`DROP TABLE \`chat_message\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_user_pair\` ON \`friend_request\``);
        await queryRunner.query(`DROP INDEX \`IDX_user_pair_inverse\` ON \`friend_request\``);
        await queryRunner.query(`DROP INDEX \`IDX_4b49bf01535b1d41801eabe45a\` ON \`friend_request\``);
        await queryRunner.query(`DROP INDEX \`IDX_33005a83b93b77c9c596f5b63b\` ON \`friend_request\``);
        await queryRunner.query(`DROP INDEX \`IDX_b90c8b54e39d856aab629e80ee\` ON \`friend_request\``);
        await queryRunner.query(`DROP TABLE \`friend_request\``);
    }

}
