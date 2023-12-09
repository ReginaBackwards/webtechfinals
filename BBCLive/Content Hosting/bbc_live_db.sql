-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Dec 09, 2023 at 09:50 PM
-- Server version: 8.0.31
-- PHP Version: 8.0.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bbc_live_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `resources`
--

DROP TABLE IF EXISTS `resources`;
CREATE TABLE IF NOT EXISTS `resources` (
  `filename` varchar(100) NOT NULL,
  `filepath` varchar(100) NOT NULL,
  `author` varchar(20) NOT NULL,
  `dateuploaded` date NOT NULL,
  `type` varchar(11) NOT NULL,
  PRIMARY KEY (`filename`),
  KEY `author` (`author`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `resources`
--

INSERT INTO `resources` (`filename`, `filepath`, `author`, `dateuploaded`, `type`) VALUES
('10 Second Timer (1).mp4', '/Content Hosting/videos/clips/alwin/10 Second Timer (1).mp4', 'alwin', '2023-12-09', 'videos'),
('Dame Pol (1).mp4', '/Content Hosting/videos/clips/alwin/Dame Pol (1).mp4', 'alwin', '2023-12-09', 'videos'),
('foodp2 (1).mp4', '/Content Hosting/videos/clips/alwin/foodp2 (1).mp4', 'alwin', '2023-12-09', 'videos'),
('Tim Henson _ Polyphia All Falls Apart Playthrough _ Ibanez TOD10 (720p) (1).mp4', '/Content Hosting/videos/clips/alwin/Tim Henson _ Polyphia All Falls Apart Playthrough _ Ibanez TOD10', 'alwin', '2023-12-09', 'videos'),
('VID20211128201054 (1).mp4', '/Content Hosting/videos/clips/alwin/VID20211128201054 (1).mp4', 'alwin', '2023-12-09', 'videos');

-- --------------------------------------------------------

--
-- Table structure for table `scenes`
--

DROP TABLE IF EXISTS `scenes`;
CREATE TABLE IF NOT EXISTS `scenes` (
  `scenename` varchar(30) NOT NULL,
  `filepath` varchar(100) NOT NULL,
  `date` date NOT NULL,
  `starttime` time NOT NULL,
  `endtime` time NOT NULL,
  PRIMARY KEY (`scenename`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `scenes`
--

INSERT INTO `scenes` (`scenename`, `filepath`, `date`, `starttime`, `endtime`) VALUES
('Lupang Hinirang', '/Content Hosting/videos/scenes/lupangHinirang.mp4', '2023-12-08', '18:56:00', '01:20:44'),
('Bing Chilling', '/Content Hosting/videos/scenes/bingChilling.mp4', '2023-12-10', '05:05:20', '05:05:30'),
('Hood Naruto', '/Content Hosting/videos/scenes/hoodNaruto.mp4', '2023-12-10', '05:05:31', '05:05:00'),
('Dame Pol (1).mp4', 'Content%20Hosting\\videos\\clips\\alwin\\Dame%20Pol%20(1).mp4', '2023-12-09', '08:00:40', '08:00:56'),
('foodp2 (1).mp4', 'Content%20Hosting\\videos\\clips\\alwin\\foodp2%20(1).mp4', '2023-12-09', '08:00:30', '08:00:40'),
('VID20211128201054 (1).mp4', 'Content%20Hosting\\videos\\clips\\alwin\\VID20211128201054%20(1).mp4', '2023-12-09', '08:00:00', '08:00:30');

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

DROP TABLE IF EXISTS `schedules`;
CREATE TABLE IF NOT EXISTS `schedules` (
  `day` varchar(9) NOT NULL,
  `username` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`day`),
  KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`day`, `username`) VALUES
('Monday', 'alwin'),
('Wednesday', 'alwin'),
('Friday', 'DABABY'),
('Saturday', 'DABABY'),
('Sunday', 'DABABY'),
('Thursday', 'DABABY'),
('Tuesday', 'DABABY');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `username` varchar(20) NOT NULL,
  `dp` varchar(50) NOT NULL,
  `password` varchar(20) NOT NULL,
  `firstname` varchar(50) NOT NULL,
  `lastname` varchar(50) NOT NULL,
  `role` varchar(5) NOT NULL,
  `banstatus` tinyint(1) NOT NULL DEFAULT '0',
  `sessions` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`username`, `dp`, `password`, `firstname`, `lastname`, `role`, `banstatus`, `sessions`) VALUES
('alwin', '/res/avatars/alwin.jpg', 'alwin', 'Marvin', 'Rosanto', 'cm', 0, 0),
('ami', '/res/avatars/ami.jpg', 'ami', 'America', 'Slay', 'cm', 0, 0),
('asfasf', '/res/avatars/default.png', 'asfasf', '   awyhawtgawsg', '   ashgasgasg              !!!!!!', 'cm', 0, 0),
('DABABY', '/res/avatars/default.png', 'DABABY', 'BABY', 'DC', 'cm', 0, 0),
('fettuccine', '/res/avatars/default.png', 'fettuccine', 'Abby', 'Lacorte', 'cm', 1, 0),
('heehee123', '/res/avatars/default.png', 'heehee123', 'Jichael', 'Mackson', 'cm', 0, 0),
('jabsTV', '/res/avatars/jabsTV.jpg', 'jabsTV123', 'Jabs', 'TV', 'admin', 0, 0),
('MYIDOL123', '/res/avatars/default.png', 'MYIDOL123', 'LEO', 'PALA', 'cm', 0, 0);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `resources`
--
ALTER TABLE `resources`
  ADD CONSTRAINT `author` FOREIGN KEY (`author`) REFERENCES `users` (`username`) ON DELETE CASCADE ON UPDATE RESTRICT;

--
-- Constraints for table `schedules`
--
ALTER TABLE `schedules`
  ADD CONSTRAINT `username` FOREIGN KEY (`username`) REFERENCES `users` (`username`) ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
