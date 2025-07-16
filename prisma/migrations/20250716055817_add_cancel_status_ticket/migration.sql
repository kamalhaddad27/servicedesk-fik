-- AlterTable
ALTER TABLE `ticket` MODIFY `status` ENUM('progress', 'pending', 'cancel', 'done') NOT NULL;
