CREATE TABLE `appointments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patient_name` text NOT NULL,
	`doctor_name` text NOT NULL,
	`specialty` text NOT NULL,
	`date` integer NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `history_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`date` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `iot_metrics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`metric` text NOT NULL,
	`value` real NOT NULL,
	`recorded_at` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
