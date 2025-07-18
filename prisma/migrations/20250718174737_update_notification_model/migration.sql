/*
  Warnings:

  - Added the required column `title` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `notification` ADD COLUMN `title` VARCHAR(191) NOT NULL,
    ADD COLUMN `type` ENUM('TICKET', 'MESSAGE') NOT NULL;
