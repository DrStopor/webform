CREATE TABLE `imy_migration` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `date` DATE,
    `num` INT NOT NULL default 1,
    `cdate` DATETIME,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;