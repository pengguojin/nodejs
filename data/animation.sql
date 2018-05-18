/*
Navicat MySQL Data Transfer

Source Server         : 本地数据库
Source Server Version : 50714
Source Host           : localhost:3306
Source Database       : animation

Target Server Type    : MYSQL
Target Server Version : 50714
File Encoding         : 65001

Date: 2018-05-18 10:34:48
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for t_episode
-- ----------------------------
DROP TABLE IF EXISTS `t_episode`;
CREATE TABLE `t_episode` (
  `id` int(10) NOT NULL,
  `episode` varchar(50) DEFAULT NULL,
  `title` varchar(100) DEFAULT NULL,
  `anime_id` int(10) NOT NULL COMMENT '关联ID',
  `is_sp` int(10) DEFAULT NULL,
  `sort` int(10) DEFAULT NULL,
  `create_time` varchar(50) DEFAULT NULL,
  `ctime` bigint(20) DEFAULT NULL,
  `source` varchar(50) DEFAULT NULL,
  `sign` varchar(50) DEFAULT NULL,
  `vid` varchar(50) DEFAULT NULL,
  `play` int(10) DEFAULT NULL,
  `vurl` varchar(255) DEFAULT NULL,
  `page` int(10) DEFAULT NULL,
  PRIMARY KEY (`id`,`anime_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for t_lines
-- ----------------------------
DROP TABLE IF EXISTS `t_lines`;
CREATE TABLE `t_lines` (
  `id` int(10) NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `status` varchar(10) DEFAULT NULL,
  `list_id` int(10) NOT NULL,
  PRIMARY KEY (`id`,`list_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for t_list
-- ----------------------------
DROP TABLE IF EXISTS `t_list`;
CREATE TABLE `t_list` (
  `id` int(10) NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `is_new` varchar(10) DEFAULT NULL,
  `is_limit` varchar(10) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `line` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
