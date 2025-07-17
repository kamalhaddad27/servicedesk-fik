/*
  Warnings:

  - The values [hight] on the enum `Ticket_priority` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `ticket` MODIFY `priority` ENUM('low', 'medium', 'high', 'urgent') NOT NULL;
