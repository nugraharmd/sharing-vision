-- Rename soft-delete status 'thrash' (typo) -> 'trash' on existing databases.
-- Fresh installs already get 'trash' from 000001.

USE `article`;

ALTER TABLE `posts` DROP CHECK `chk_posts_status`;

UPDATE `posts` SET `status` = 'trash' WHERE `status` = 'thrash';

ALTER TABLE `posts`
  ADD CONSTRAINT `chk_posts_status` CHECK (`status` IN ('publish', 'draft', 'trash'));
