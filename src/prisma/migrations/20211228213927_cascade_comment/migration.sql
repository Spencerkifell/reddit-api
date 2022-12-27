-- DropForeignKey
ALTER TABLE `comment` DROP FOREIGN KEY `fk_comment_reply`;

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `fk_comment_reply` FOREIGN KEY (`reply_id`) REFERENCES `comment`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
