-- CreateTable
CREATE TABLE `bookmarked_comment` (
    `comment_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,

    INDEX `fk_bookmarked_comment_user`(`user_id`),
    PRIMARY KEY (`comment_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookmarked_post` (
    `post_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,

    INDEX `fk_bookmarked_post_user`(`user_id`),
    PRIMARY KEY (`post_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `title` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `edited_at` DATETIME(0) NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `uq_category_title`(`title`),
    INDEX `fk_category_user`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category_moderator` (
    `category_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,

    INDEX `fk_category_moderator_user`(`user_id`),
    PRIMARY KEY (`category_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_id` INTEGER NOT NULL,
    `user_id` INTEGER NULL,
    `reply_id` INTEGER NULL,
    `content` TEXT NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `edited_at` DATETIME(0) NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `fk_comment_post`(`post_id`),
    INDEX `fk_comment_reply`(`reply_id`),
    INDEX `fk_comment_user`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comment_vote` (
    `user_id` INTEGER NOT NULL,
    `comment_id` INTEGER NOT NULL,
    `type` ENUM('Up', 'Down') NOT NULL,

    INDEX `fk_comment_vote_comment`(`comment_id`),
    PRIMARY KEY (`user_id`, `comment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `category_id` INTEGER NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `type` ENUM('URL', 'Text') NOT NULL,
    `content` TEXT NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `edited_at` DATETIME(0) NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `uq_post_title`(`title`),
    INDEX `fk_post_category`(`category_id`),
    INDEX `fk_post_user`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post_vote` (
    `user_id` INTEGER NOT NULL,
    `post_id` INTEGER NOT NULL,
    `type` ENUM('Up', 'Down') NOT NULL,

    INDEX `fk_post_vote_post`(`post_id`),
    PRIMARY KEY (`user_id`, `post_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscription` (
    `category_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,

    INDEX `fk_subscription_user`(`user_id`),
    PRIMARY KEY (`category_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `avatar` VARCHAR(1000) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `edited_at` DATETIME(0) NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `uq_user_username`(`username`),
    UNIQUE INDEX `uq_user_email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bookmarked_comment` ADD CONSTRAINT `fk_bookmarked_comment_comment` FOREIGN KEY (`comment_id`) REFERENCES `comment`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bookmarked_comment` ADD CONSTRAINT `fk_bookmarked_comment_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bookmarked_post` ADD CONSTRAINT `fk_bookmarked_post_post` FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bookmarked_post` ADD CONSTRAINT `fk_bookmarked_post_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `category` ADD CONSTRAINT `fk_category_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `category_moderator` ADD CONSTRAINT `fk_category_moderator_category` FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `category_moderator` ADD CONSTRAINT `fk_category_moderator_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `fk_comment_post` FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `fk_comment_reply` FOREIGN KEY (`reply_id`) REFERENCES `comment`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `fk_comment_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `comment_vote` ADD CONSTRAINT `fk_comment_vote_comment` FOREIGN KEY (`comment_id`) REFERENCES `comment`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `comment_vote` ADD CONSTRAINT `fk_comment_vote_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `post` ADD CONSTRAINT `fk_post_category` FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `post` ADD CONSTRAINT `fk_post_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `post_vote` ADD CONSTRAINT `fk_post_vote_post` FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `post_vote` ADD CONSTRAINT `fk_post_vote_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `subscription` ADD CONSTRAINT `fk_subscription_category` FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `subscription` ADD CONSTRAINT `fk_subscription_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
