CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(10) DEFAULT '🏆',
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `calendar_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`courseId` int,
	`taskId` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`eventType` enum('study','deadline','reminder','other') NOT NULL DEFAULT 'study',
	`startTime` timestamp NOT NULL,
	`endTime` timestamp,
	`allDay` boolean NOT NULL DEFAULT false,
	`color` varchar(20) DEFAULT '#c4b5fd',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `calendar_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`progress` float NOT NULL DEFAULT 0,
	`status` enum('active','completed','paused') NOT NULL DEFAULT 'active',
	`color` varchar(20) DEFAULT '#c4b5fd',
	`emoji` varchar(10) DEFAULT '🌸',
	`totalHours` float NOT NULL DEFAULT 0,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `garden_flowers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`courseId` int NOT NULL,
	`courseName` varchar(255) NOT NULL,
	`flowerType` int NOT NULL DEFAULT 1,
	`positionX` float NOT NULL DEFAULT 0,
	`positionY` float NOT NULL DEFAULT 0,
	`bloomedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `garden_flowers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`courseId` int,
	`title` varchar(255) NOT NULL,
	`content` text,
	`isSnippet` boolean NOT NULL DEFAULT false,
	`language` varchar(50),
	`tags` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `study_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`courseId` int,
	`durationMinutes` int NOT NULL,
	`sessionDate` date NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `study_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`courseId` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`label` enum('course','project','practice') NOT NULL DEFAULT 'course',
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`status` enum('pending','in_progress','completed') NOT NULL DEFAULT 'pending',
	`dueDate` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
