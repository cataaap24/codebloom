CREATE TABLE `publicGardens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`shareToken` varchar(64) NOT NULL,
	`isPublic` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `publicGardens_id` PRIMARY KEY(`id`),
	CONSTRAINT `publicGardens_shareToken_unique` UNIQUE(`shareToken`)
);
