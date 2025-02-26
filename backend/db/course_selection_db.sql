-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: course_selection_db
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `admin_id` varchar(20) NOT NULL,
  `name` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`admin_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES ('A20240101','aa','$2a$10$GvC1da9JFB7rQshsnAC0C.MSWx26z0y2c6HgPtSq4bW3thyy77..O',NULL,NULL,'2025-01-26 03:33:25','2025-01-26 03:33:25');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `course_id` int NOT NULL AUTO_INCREMENT,
  `course_name` varchar(255) NOT NULL,
  `teacher_id` varchar(20) NOT NULL,
  `credits` int NOT NULL,
  `class_hours` int NOT NULL COMMENT '学时',
  `course_type` varchar(50) NOT NULL COMMENT '课程类别',
  `capacity` int NOT NULL DEFAULT '30' COMMENT '课程容量',
  PRIMARY KEY (`course_id`),
  KEY `fk_teacher` (`teacher_id`),
  CONSTRAINT `fk_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`teacher_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (5,'node.js基础教程','T20240101',3,36,'必修课',25),(12,'HTML基础教程','T20240101',3,24,'必修课',2),(13,'CSS基础教程','T20240101',3,24,'必修课',30),(14,'JavaScript基础教程','T20240101',4,36,'必修课',30),(15,'Vue基础教程','T20240101',3,36,'选修课',30),(16,'中国古代文学','T20240102',3,36,'必修课',30),(17,'中国现代文学','T20240102',3,36,'必修课',30),(18,'应用文写作','T20240102',4,36,'必修课',30),(19,'西方文化概述','T20240102',3,48,'选修课',30),(20,'民俗学','T20240102',3,36,'公共课',30),(21,'生理学','T20240103',4,48,'必修课',30),(22,'病理学','T20240103',4,48,'必修课',30),(23,'诊断学','T20240103',3,36,'必修课',30),(24,'医学史','T20240103',3,36,'公共课',30),(25,'临床流行病学','T20240103',3,48,'选修课',30);
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_courses`
--

DROP TABLE IF EXISTS `student_courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_courses` (
  `student_id` varchar(20) NOT NULL,
  `course_id` int NOT NULL,
  PRIMARY KEY (`student_id`,`course_id`),
  KEY `fk_course` (`course_id`),
  CONSTRAINT `fk_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE,
  CONSTRAINT `student_courses_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_courses`
--

LOCK TABLES `student_courses` WRITE;
/*!40000 ALTER TABLE `student_courses` DISABLE KEYS */;
INSERT INTO `student_courses` VALUES ('20240101',5),('20250102',5),('20240101',12),('20250102',12),('20240101',13),('20240101',14),('20240102',19),('20240101',20),('20240102',20);
/*!40000 ALTER TABLE `student_courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `student_id` varchar(20) NOT NULL,
  `name` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `gender` enum('男','女') DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT 'http://example.com/default-avatar.jpg',
  `faculty` varchar(50) DEFAULT NULL,
  `class_name` varchar(50) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES ('20240101','小伟','$2a$10$dRKe9asUT3VqABNpSaWqs.nmHfzixMu0bbGIbeXQeMSS11qltwvr2','男','/avatar/01.jpeg','计算机学院','软件工程3班','16639714055','2758673327@qq.com','2025-01-17 08:42:24','2025-01-28 09:01:05'),('20240102','小明','$2a$10$P/rjR30318jJeZ3hp1mEVOby6HApqCJ9S2NlYn.1nmNpKKmVPcbhO','男','/avatar/S3.png','传媒艺术学院','新媒体1班','12345678901','12345678901@qq.com','2025-01-24 07:28:42','2025-01-24 07:31:15'),('20240103','小红','$2a$10$r2MER4G3J3ybmLlsyF6DquGK.OHUEVZYAK3O99XqLEUTC5lwAIMhO','女','/avatar/çèè£èå°é¢.png','外国语学院','英语2班','12345678902','12345678902@qq.com','2025-01-24 12:32:30','2025-01-24 12:33:57'),('20240104','小华','$2a$10$hosUBjlKGFxVLtlGd8Wql.avYcx4oW2D1FHe6SWipPGQzy3dntQdu','男','/avatar/æçå¤´å.jpeg','医学院','护理1班','12345678903','12345678903@qq.com','2025-01-24 12:34:32','2025-01-24 12:36:14'),('20250101','小丽','$2a$10$3LW4syz7s67pVXA1XZxkIuWqnC19fsspq362Lo1sQqbG96AbGkiK6','女','/avatar/1657281326032.jpeg','文学院','汉语言3班','12345678911','12345678911@qq.com','2025-01-24 12:38:25','2025-01-24 12:41:36'),('20250102','小龙','$2a$10$GdDiKsfodmwBidAFN5A2Uu33atjtpSSpheyrAQqGyce9q3D1s/EU2','男','/avatar/IMG20220618205657.jpg','计算机学院','计算机科学与技术2班','12345678913','12345678913@qq.com','2025-01-24 12:50:29','2025-01-24 12:51:15');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teachers`
--

DROP TABLE IF EXISTS `teachers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teachers` (
  `teacher_id` varchar(20) NOT NULL,
  `name` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `gender` enum('男','女') DEFAULT NULL,
  `title` varchar(50) DEFAULT NULL,
  `department` varchar(50) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `avatar_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`teacher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teachers`
--

LOCK TABLES `teachers` WRITE;
/*!40000 ALTER TABLE `teachers` DISABLE KEYS */;
INSERT INTO `teachers` VALUES ('T20240101','张三','$2a$10$jkn/wyjJOjOdzS1XwW96V.YiCWkFrREFjP3WB.eisiB6y08Wgu73a','女','教授','计算机学院','12345678901','12345678901@qq.com','2025-01-17 04:55:54','2025-01-25 09:54:18','/avatar/T1.jpg'),('T20240102','李四','$2a$10$r4iylLVlUcQqFIxkUS2LIeWtMi.nS2zjjrk/iMumuOwfgrhCuBn/2','女','副教授','文学院','1234567891','1234567891@qq.com','2025-01-26 02:45:34','2025-01-26 02:48:49','/avatar/T3.jpeg'),('T20240103','王五','$2a$10$UnoG66TQ4JAW5zmYDRFmvOb7AVMuzrF8xJr7MeGKItJhScgKubAvi','男','副教授','医学院','1234567892','1234567892@qq.com','2025-01-26 02:51:50','2025-01-26 02:53:02','/avatar/T4.jpg');
/*!40000 ALTER TABLE `teachers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-14 10:08:27
