-- Rollback for 000002: restore 'thrash' spelling.

USE `article`;

ALTER TABLE `posts` DROP CHECK `chk_posts_status`;

UPDATE `posts` SET `status` = 'thrash' WHERE `status` = 'trash';

ALTER TABLE `posts`
  ADD CONSTRAINT `chk_posts_status` CHECK (`status` IN ('publish', 'draft', 'thrash'));
