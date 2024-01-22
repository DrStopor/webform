CREATE TABLE `messages`
(
    `id`        int(11) NOT NULL AUTO_INCREMENT,
    `user_name` varchar(255) NOT NULL DEFAULT 'anonymous',
    `message`   text         NOT NULL,
    `cdate`     datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `mdate`     datetime     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;