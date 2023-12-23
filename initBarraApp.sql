-- phpMyAdmin SQL Dump
-- version 5.1.1deb5ubuntu1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Temps de generació: 11-12-2023 a les 12:23:11
-- Versió del servidor: 8.0.35-0ubuntu0.22.04.1
-- Versió de PHP: 8.1.2-1ubuntu2.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de dades: `BarraApp`
--

DELIMITER $$
--
-- Procediments
--
CREATE DEFINER=`alumne`@`%` PROCEDURE `addCommand` (IN `usrId` INT, IN `statusEnum` VARCHAR(31), IN `uuid` VARCHAR(36))  MODIFIES SQL DATA
    SQL SECURITY INVOKER
BEGIN

INSERT INTO tblCommands 
     (COM_IdUser, COM_Status, COM_Uuid) VALUES (usrId, statusEnum, uuid);

     SELECT LAST_INSERT_ID() AS COM_Id;

END$$

CREATE DEFINER=`alumne`@`%` PROCEDURE `addCommandLine` (IN `idCom` INT, IN `idProd` INT, IN `prodPrice` DECIMAL(10,2), IN `amount` INT, IN `iva` DECIMAL(10,2))  SQL SECURITY INVOKER
BEGIN
    DECLARE existingId INT;

    -- Verificar si existeix una línea de comanda amb el mateix producte, iva i preu
    SELECT CL_Id INTO existingId
    FROM tblCommandLines
    WHERE CL_IdCommand = idCom AND CL_IdProduct = idProd AND CL_ProductPrice = prodPrice AND CL_IVA = iva
    LIMIT 1;

    IF existingId IS NOT NULL THEN
        -- Si ja existeix, actualitzem la cuantitat
        UPDATE tblCommandLines
        SET CL_Amount = CL_Amount + amount
        WHERE CL_Id = existingId;

        SELECT existingId AS CL_Id;  -- Retornem l'ID existent
    ELSE
        -- Si no existeix, insertem una nova linea de comanda
        INSERT INTO tblCommandLines
            (CL_IdCommand, CL_IdProduct, CL_ProductPrice, CL_Amount, CL_IVA) 
        VALUES (idCom, idProd, prodPrice, amount, iva);

        SELECT LAST_INSERT_ID() AS CL_Id;  -- Retornem el nou ID
    END IF;
END$$

CREATE DEFINER=`alumne`@`%` PROCEDURE `addInitTransaction` (IN `idUser` INT, IN `idPayment` VARCHAR(50), IN `importValue` DECIMAL(10,2), IN `idCommand` INT, IN `idPlatform` INT, IN `info` JSON)  MODIFIES SQL DATA
    SQL SECURITY INVOKER
BEGIN	      
 
INSERT INTO tblInitTransactions 
    (IT_IdUser, IT_IdPayment, IT_Import, IT_IdCommand, IT_IdPlatformTransaction, IT_Info)
    VALUES (idUser, idPayment, importValue, idCommand, idPlatform, info);

END$$

CREATE DEFINER=`alumne`@`%` PROCEDURE `addProduct` (IN `idProductFamily` INT, IN `name` VARCHAR(63), IN `price` DECIMAL(10,2), IN `description` VARCHAR(2027), IN `iva` DECIMAL(10,2))  SQL SECURITY INVOKER
BEGIN

INSERT INTO tblProducts
    (P_IdProductFamily, P_Name, P_Price, P_Description, P_IVA)
	VALUES (idProductFamily, name, price, description, iva);
    
    SELECT LAST_INSERT_ID() AS P_Id;
END$$

CREATE DEFINER=`alumne`@`%` PROCEDURE `addProductFamily` (IN `name` VARCHAR(63), IN `description` VARCHAR(255), IN `ageLimit` INT)  SQL SECURITY INVOKER
BEGIN
    INSERT INTO tblProductsFamily (PF_Name, PF_Description, PF_AgeLimit)
    VALUES (name, description, ageLimit);
    
    SELECT LAST_INSERT_ID() AS PF_Id;
END$$

CREATE DEFINER=`alumne`@`%` PROCEDURE `convertInitTransToEndedTrans` (IN `idPayment` VARCHAR(50), IN `idPlatform` INT, IN `importValue` DECIMAL(10,2), IN `info` JSON)  SQL SECURITY INVOKER
BEGIN
    
    DECLARE transId INT;
    DECLARE commandId INT;

    -- Busquem la intiTransaction
    SELECT IT_Id INTO transId
    FROM tblInitTransactions
    WHERE IT_IdPayment = idPayment AND IT_IdPlatformTransaction = idPlatform AND IT_Import = importValue;

    IF transId IS NOT NULL THEN
    
    	-- Recollim el Idcommand de la transacció 
        SELECT IT_IdCommand INTO commandId
        FROM tblInitTransactions
        WHERE IT_Id = transId;
    	
        -- Si existeix, incertem la transacció a tblEndedTransactions
        INSERT INTO tblEndedTransactions
              (ET_IdUser, ET_IdPayment, ET_Import, ET_IdCommand, ET_IdPlatformTransaction, ET_Info)
		SELECT IT_IdUser, IT_IdPayment, IT_Import, IT_IdCommand, IT_IdPlatformTransaction, info
		FROM tblInitTransactions
		WHERE IT_Id = transId;
        
        -- Marquem la comanda corresponent com a pagada
		UPDATE tblCommands
        SET COM_Status = 'pagada'
        WHERE COM_Id = commandId;
        
        -- Eliminem la transacció de tblInitTransactions
        DELETE FROM tblInitTransactions
        WHERE IT_Id = transId;

		-- Retornem el commandId
        SELECT commandId AS commandId;
        
    ELSE
        -- Si no es troba, retornem un conjunt vuit
        SELECT NULL AS commandId;
        
    END IF;
    
END$$

CREATE DEFINER=`alumne`@`%` PROCEDURE `deleteCommandLine` (IN `id` INT)  MODIFIES SQL DATA
    SQL SECURITY INVOKER
BEGIN

DELETE FROM tblCommandLines
WHERE CL_Id = id;

END$$

CREATE DEFINER=`alumne`@`%` PROCEDURE `disableProduct` (IN `id` INT)  SQL SECURITY INVOKER
BEGIN

UPDATE tblProducts
SET P_Disabled = 1
WHERE P_Id = id;

END$$

CREATE DEFINER=`alumne`@`%` PROCEDURE `disableProductFamily` (IN `id` INT)  SQL SECURITY INVOKER
BEGIN

UPDATE tblProductsFamily
SET PF_Disabled = 1
WHERE PF_IdFamily = id;

END$$

CREATE DEFINER=`alumne`@`%` PROCEDURE `enableProduct` (IN `id` INT)  SQL SECURITY INVOKER
BEGIN

UPDATE tblProducts
SET P_Disabled = 0
WHERE P_Id = id;

END$$

CREATE DEFINER=`alumne`@`%` PROCEDURE `enableProductFamily` (IN `id` INT)  SQL SECURITY INVOKER
BEGIN

UPDATE tblProductsFamily
SET PF_Disabled = 0
WHERE PF_IdFamily = id;

END$$

CREATE DEFINER=`alumne`@`%` PROCEDURE `getCommandById` (IN `id` INT)  READS SQL DATA
    SQL SECURITY INVOKER
BEGIN

SELECT * FROM tblCommands
WHERE COM_Id = id;
    
SELECT * 
FROM tblCommandLines INNER JOIN
	 tblProducts ON tblCommandLines.CL_IdProduct=tblProducts.P_Id
WHERE CL_IdCommand = id;
    
END$$

CREATE DEFINER=`alumne`@`%` PROCEDURE `getCommandByUuid` (IN `idCom` INT, IN `idUsr` INT, IN `uuid` VARCHAR(36))  READS SQL DATA
    SQL SECURITY INVOKER
BEGIN

SELECT * FROM tblCommands
WHERE COM_Id = idCom AND COM_IdUser = idUsr AND COM_Uuid = uuid; 

END$$

CREATE DEFINER=`alumne`@`%` PROCEDURE `getCommandLineByIdComIdProd` (IN `idCommand` INT, IN `idProduct` INT)  READS SQL DATA
    SQL SECURITY INVOKER
BEGIN

SELECT * FROM tblCommandLines
WHERE CL_IdCommand = idCommand AND CL_IdProduct = idProduct; 

END$$

CREATE DEFINER=`alumne`@`%` PROCEDURE `getCommandLineByIdCommandLine` (IN `idComLine` INT)  READS SQL DATA
    SQL SECURITY INVOKER
BEGIN

SELECT * FROM tblCommandLines
WHERE idComLine = CL_Id;

END$$

CREATE DEFINER=`alumne`@`%` PROCEDURE `getCommandLinesByIdCommand` (IN `idCom` INT)  READS SQL DATA
    SQL SECURITY INVOKER
BEGIN

SELECT * FROM tblCommandLines
WHERE idCom = CL_IdCommand;

END$$

CREATE DEFINER=`alumne`@`%` PROCEDURE `getCommandsByUserStatus` (IN `usrId` INT, IN `statusEnum` VARCHAR(31))  READS SQL DATA
    SQL SECURITY INVOKER
BEGIN

SELECT COM_Id FROM tblCommands
WHERE COM_IdUser = usrId AND COM_Status = statusEnum;

END$$

CREATE DEFINER=`alumne`@`%` PROCEDURE `getInitTByIdPayIdPlat` (IN `idPayment` VARCHAR(50), IN `idPlatform` INT)  READS SQL DATA
    SQL SECURITY INVOKER
BEGIN

SELECT * FROM tblInitTransactions
WHERE IT_IdPayment = idPayment AND IT_IdPlatformTransaction = idPlatform;

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `getProductsByDisabled` (IN `includeDisabled` BOOLEAN)  READS SQL DATA
    SQL SECURITY INVOKER
BEGIN

SELECT *
FROM tblProducts
WHERE ((NOT includeDisabled) AND P_Disabled = 0) OR includeDisabled;
   
END$$

CREATE DEFINER=`alumne`@`%` PROCEDURE `getProductsByFamilyAge` (IN `idProductFamily` INT, IN `usrId` INT)  READS SQL DATA
    SQL SECURITY INVOKER
BEGIN

    SELECT 
    P_Id, P_IdProductFamily, P_Name, P_Disabled, P_Price, P_Description, P_IVA
        FROM tblProducts AS p
        INNER JOIN tblProductsFamily AS pf ON p.P_IdProductFamily = pf.PF_IdFamily
        JOIN tblUsers AS u ON TIMESTAMPDIFF(YEAR, u.USR_BirthDate, CURDATE()) >= pf.PF_AgeLimit
        WHERE u.USR_Id = usrId 
        	AND pf.PF_Disabled = 0 
            AND p.P_Disabled = 0 
            AND pf.PF_IdFamily = idProductFamily;

END$$

CREATE DEFINER=`alumne`@`%` PROCEDURE `getProductsById` (IN `id` INT)  READS SQL DATA
    SQL SECURITY INVOKER
BEGIN

SELECT * FROM tblProducts
WHERE P_Id = id;

END$$

CREATE DEFINER=`alumne`@`%` PROCEDURE `getProductsFamilyByDisabled` (IN `includeDisabled` BOOLEAN)  READS SQL DATA
    SQL SECURITY INVOKER
BEGIN

SELECT  JSON_ARRAYAGG(
    JSON_OBJECT(
        'PF_IdFamily', PF_IdFamily,
        'PF_Name', PF_Name,
        'PF_Disabled', PF_Disabled,
        'PF_Description', PF_Description,
        'PF_AgeLimit', PF_AgeLimit
    ) 
)AS jsonPF

FROM tblProductsFamily
WHERE ((NOT includeDisabled) AND PF_Disabled = 0) OR includeDisabled;
   
END$$

CREATE DEFINER=`alumne`@`%` PROCEDURE `getProductsFamilyById` (IN `id` INT)  READS SQL DATA
    SQL SECURITY INVOKER
BEGIN

SELECT * FROM tblProductsFamily
WHERE PF_IdFamily = id;

END$$

CREATE DEFINER=`phpmyadmin`@`localhost` PROCEDURE `getProductsFamilyByUser` (IN `userId` INT)  NO SQL
    SQL SECURITY INVOKER
BEGIN

SELECT PF_IdFamily, PF_Name, PF_Disabled, PF_Description, PF_AgeLimit
FROM tblProductsFamily AS pf
JOIN tblUsers AS u ON TIMESTAMPDIFF(YEAR, u.USR_BirthDate, CURDATE()) >= pf.PF_AgeLimit
WHERE u.USR_Id = userId AND PF_Disabled = 0;
   
END$$

CREATE DEFINER=`alumne`@`%` PROCEDURE `getUserById` (IN `id` INT)  READS SQL DATA
    SQL SECURITY INVOKER
BEGIN

SELECT * FROM tblUsers
WHERE USR_Id = id;

END$$

CREATE DEFINER=`alumne`@`%` PROCEDURE `loginCheck` (IN `user` VARCHAR(100), IN `password` VARCHAR(100))  READS SQL DATA
    SQL SECURITY INVOKER
BEGIN
    SELECT USR_Id, USR_Email, USR_Email, USR_Role, USR_Name, USR_Surname1, USR_Surname2, USR_BirthDate FROM tblUsers WHERE USR_Email = `user` AND SHA1(`password`)= USR_Password;
END$$

CREATE DEFINER=`alumne`@`%` PROCEDURE `updateCommandLineAmount` (IN `id` INT, IN `amount` INT)  SQL SECURITY INVOKER
BEGIN

    IF amount > 0 THEN
        -- Si amount mes gran que 0, actualitza la columna CL_Amount
        UPDATE tblCommandLines
        SET CL_Amount = amount
        WHERE CL_Id = id;
        
    ELSE
        -- Si amount es igual o menor que 0, elimina la línea de comanda
        DELETE FROM tblCommandLines
        WHERE CL_Id = id;
    END IF;
    
END$$

CREATE DEFINER=`alumne`@`%` PROCEDURE `updateCommandStatus` (IN `id` INT, IN `statusEnum` VARCHAR(31))  MODIFIES SQL DATA
    SQL SECURITY INVOKER
BEGIN

UPDATE tblCommands
SET COM_Status = statusEnum
WHERE COM_Id = id;

END$$

CREATE DEFINER=`alumne`@`%` PROCEDURE `updateInitTransInfo` (IN `idPayment` VARCHAR(50), IN `idPlatform` INT, IN `info` JSON)  SQL SECURITY INVOKER
BEGIN

DECLARE commandId INT;

-- Actualitzem el camp IT_Info
UPDATE tblInitTransactions
SET IT_Info = info
WHERE IT_IdPayment = idPayment AND IT_IdPlatformTransaction = idPlatform;

-- Agafem el IT_IdCommand
SELECT IT_IdCommand INTO commandId
FROM tblInitTransactions
WHERE IT_IdPayment = idPayment AND IT_IdPlatformTransaction = idPlatform;

-- Retornem el valor de commandId
IF commandId IS NOT NULL THEN
    SELECT commandId AS IT_IdCommand;
ELSE
    SELECT NULL AS IT_IdCommand;
END IF;

END$$

CREATE DEFINER=`alumne`@`%` PROCEDURE `updateProduct` (IN `id` INT, IN `idProductFamily` INT, IN `name` VARCHAR(63), IN `disabled` BOOLEAN, IN `price` DECIMAL(10,2), IN `description` VARCHAR(2027), IN `iva` DECIMAL(10,2))  MODIFIES SQL DATA
    SQL SECURITY INVOKER
BEGIN

UPDATE tblProducts

	SET P_idProductFamily = idProductFamily,
		P_Name = name,
        P_Disabled = disabled,
        P_Price = price,
        P_Description = description,
        P_IVA = iva
        
WHERE P_Id = id;

END$$

CREATE DEFINER=`alumne`@`%` PROCEDURE `updateProductFamily` (IN `newDataJson` JSON)  SQL SECURITY INVOKER
BEGIN

UPDATE tblProductsFamily
SET
    PF_Name = JSON_UNQUOTE(JSON_EXTRACT(newDataJson, '$.PF_Name')),
    PF_Disabled = JSON_UNQUOTE(JSON_EXTRACT(newDataJson, '$.PF_Disabled')),
    PF_Description = JSON_UNQUOTE(JSON_EXTRACT(newDataJson, '$.PF_Description')),
    PF_AgeLimit = JSON_UNQUOTE(JSON_EXTRACT(newDataJson, '$.PF_AgeLimit'))
WHERE PF_IdFamily = JSON_UNQUOTE(JSON_EXTRACT(newDataJson, '$.PF_IdFamily'));

    
END$$

CREATE DEFINER=`alumne`@`%` PROCEDURE `updateUserBalance` (IN `id` INT, IN `newBalance` DECIMAL(10,2))  SQL SECURITY INVOKER
BEGIN

UPDATE tblUsers
SET USR_Balance = newBalance
WHERE USR_Id = id;

END$$

CREATE DEFINER=`alumne`@`%` PROCEDURE `updateUserRole` (IN `id` INT, IN `newRole` VARCHAR(31))  SQL SECURITY INVOKER
BEGIN

UPDATE tblUsers
SET USR_Role = newRole
WHERE USR_Id = id;

END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de la taula `tblCommandLines`
--

CREATE TABLE `tblCommandLines` (
  `CL_Id` int NOT NULL,
  `CL_IdCommand` int NOT NULL,
  `CL_IdProduct` int NOT NULL,
  `CL_ProductPrice` decimal(10,2) NOT NULL,
  `CL_Amount` int NOT NULL,
  `CL_IVA` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Bolcament de dades per a la taula `tblCommandLines`
--

INSERT INTO `tblCommandLines` (`CL_Id`, `CL_IdCommand`, `CL_IdProduct`, `CL_ProductPrice`, `CL_Amount`, `CL_IVA`) VALUES
(1, 1, 1, '2.00', 3, '21.00'),
(2, 1, 2, '4.50', 2, '21.00'),
(3, 2, 1, '3.00', 3, '21.00'),
(7, 10, 3, '5.59', 1, '11.50'),
(8, 10, 7, '3.50', 2, '21.00'),
(9, 11, 7, '3.50', 2, '21.00'),
(10, 10, 3, '6.59', 4, '11.50'),
(17, 10, 2, '4.50', 2, '21.00'),
(18, 12, 2, '4.50', 3, '21.00'),
(22, 12, 8, '2.00', 1, '21.00'),
(23, 13, 2, '4.50', 2, '21.00'),
(25, 13, 3, '5.59', 1, '11.50'),
(26, 14, 9, '14.00', 2, '21.00'),
(27, 14, 3, '5.59', 1, '11.50'),
(31, 15, 16, '5.00', 2, '21.00'),
(32, 15, 15, '1.50', 1, '12.00'),
(33, 16, 1, '2.00', 1, '21.00'),
(34, 17, 2, '4.50', 1, '21.00'),
(35, 18, 3, '5.59', 1, '11.50');

-- --------------------------------------------------------

--
-- Estructura de la taula `tblCommands`
--

CREATE TABLE `tblCommands` (
  `COM_Id` int NOT NULL,
  `COM_IdUser` int NOT NULL,
  `COM_TimeStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `COM_Status` varchar(31) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'pendent, pagada, entregada',
  `COM_Uuid` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Bolcament de dades per a la taula `tblCommands`
--

INSERT INTO `tblCommands` (`COM_Id`, `COM_IdUser`, `COM_TimeStamp`, `COM_Status`, `COM_Uuid`) VALUES
(1, 2, '2023-11-06 12:14:04', 'entregada', '07484bcb-6db2-4495-8246-500b6918f219'),
(2, 2, '2023-11-21 20:23:30', 'entregada', '0ebb6aff-28f0-43cc-879e-e1ac401b6f17'),
(3, 3, '2023-11-25 11:51:52', 'pendent', '8d92bd1c-46d7-4da9-a66d-32bf9e6cab44'),
(10, 2, '2023-11-26 12:40:37', 'entregada', 'bd2903a0-052f-4b6d-8b3a-e5161596b386'),
(11, 5, '2023-11-26 13:19:43', 'pendent', 'ff13290b-1d5b-463e-af8f-7cd8e4ac6796'),
(12, 2, '2023-11-29 08:54:44', 'entregada', '1fff478c-ae91-49ac-8cf4-00e9dc6b0a6f'),
(13, 2, '2023-11-30 12:28:47', 'entregada', 'e66171f7-dcb4-4a4c-9c50-f132c30df51b'),
(14, 2, '2023-11-30 14:23:12', 'entregada', '55d85ad9-0390-435c-984f-d0b905e61f21'),
(15, 2, '2023-11-30 14:43:02', 'entregada', '8aba804c-5e53-4839-85a2-f06ecf1fb7b0'),
(16, 2, '2023-11-30 16:51:43', 'entregada', '0aa8c029-ab0e-40bd-9c67-2f662a45128c'),
(17, 2, '2023-12-06 21:26:21', 'entregada', 'f7fa15e3-7840-44c8-808d-651011c95988'),
(18, 2, '2023-12-07 19:58:45', 'pagada', '3f27f30f-103f-4b9b-92b5-fea98d30c761');

-- --------------------------------------------------------

--
-- Estructura de la taula `tblEndedTransactions`
--

CREATE TABLE `tblEndedTransactions` (
  `ET_Id` int NOT NULL,
  `ET_IdUser` int NOT NULL,
  `ET_IdPayment` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ET_Import` decimal(10,2) NOT NULL,
  `ET_RefundAmount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `ET_IdCommand` int NOT NULL,
  `ET_IdPlatformTransaction` int NOT NULL,
  `ET_Info` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Bolcament de dades per a la taula `tblEndedTransactions`
--

INSERT INTO `tblEndedTransactions` (`ET_Id`, `ET_IdUser`, `ET_IdPayment`, `ET_Import`, `ET_RefundAmount`, `ET_IdCommand`, `ET_IdPlatformTransaction`, `ET_Info`) VALUES
(2, 2, '2', '0.00', '0.00', 1, 2, NULL),
(11, 2, '4D364089SY930014G', '15.00', '0.00', 1, 1, NULL),
(14, 2, 'PROVA', '19.00', '0.00', 2, 2, '{\"name\": \"Visa canvi a EndedT\", \"CardId\": 3030, \"redNums\": null}'),
(15, 2, '0VL10701LW8029749', '15.00', '0.00', 1, 1, '{\"id\": \"0VL10701LW8029749\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/0VL10701LW8029749\", \"method\": \"GET\"}], \"payer\": {\"name\": {\"surname\": \"buyer\", \"given_name\": \"test\"}, \"address\": {\"country_code\": \"ES\"}, \"payer_id\": \"JW5PQBJ2KRWCE\", \"email_address\": \"jcgil1969-buyer@gmail.com\"}, \"status\": \"COMPLETED\", \"payment_source\": {\"paypal\": {\"name\": {\"surname\": \"buyer\", \"given_name\": \"test\"}, \"address\": {\"country_code\": \"ES\"}, \"account_id\": \"JW5PQBJ2KRWCE\", \"email_address\": \"jcgil1969-buyer@gmail.com\", \"account_status\": \"VERIFIED\"}}, \"purchase_units\": [{\"payments\": {\"captures\": [{\"id\": \"7DA22418ST0118222\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/payments/captures/7DA22418ST0118222\", \"method\": \"GET\"}, {\"rel\": \"refund\", \"href\": \"https://api.sandbox.paypal.com/v2/payments/captures/7DA22418ST0118222/refund\", \"method\": \"POST\"}, {\"rel\": \"up\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/0VL10701LW8029749\", \"method\": \"GET\"}], \"amount\": {\"value\": \"15.00\", \"currency_code\": \"EUR\"}, \"status\": \"COMPLETED\", \"invoice_id\": \"1/001\", \"create_time\": \"2023-11-25T12:50:15Z\", \"update_time\": \"2023-11-25T12:50:15Z\", \"final_capture\": true, \"seller_protection\": {\"status\": \"ELIGIBLE\", \"dispute_categories\": [\"ITEM_NOT_RECEIVED\", \"UNAUTHORIZED_TRANSACTION\"]}, \"seller_receivable_breakdown\": {\"net_amount\": {\"value\": \"14.14\", \"currency_code\": \"EUR\"}, \"paypal_fee\": {\"value\": \"0.86\", \"currency_code\": \"EUR\"}, \"gross_amount\": {\"value\": \"15.00\", \"currency_code\": \"EUR\"}}}]}, \"reference_id\": \"default\"}]}'),
(16, 2, '9D509878MJ154560K', '15.00', '0.00', 1, 1, '{\"id\": \"9D509878MJ154560K\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/9D509878MJ154560K\", \"method\": \"GET\"}], \"payer\": {\"name\": {\"surname\": \"buyer\", \"given_name\": \"test\"}, \"address\": {\"country_code\": \"ES\"}, \"payer_id\": \"JW5PQBJ2KRWCE\", \"email_address\": \"jcgil1969-buyer@gmail.com\"}, \"status\": \"COMPLETED\", \"payment_source\": {\"paypal\": {\"name\": {\"surname\": \"buyer\", \"given_name\": \"test\"}, \"address\": {\"country_code\": \"ES\"}, \"account_id\": \"JW5PQBJ2KRWCE\", \"email_address\": \"jcgil1969-buyer@gmail.com\", \"account_status\": \"VERIFIED\"}}, \"purchase_units\": [{\"payments\": {\"captures\": [{\"id\": \"3LC53425TB987853F\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/payments/captures/3LC53425TB987853F\", \"method\": \"GET\"}, {\"rel\": \"refund\", \"href\": \"https://api.sandbox.paypal.com/v2/payments/captures/3LC53425TB987853F/refund\", \"method\": \"POST\"}, {\"rel\": \"up\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/9D509878MJ154560K\", \"method\": \"GET\"}], \"amount\": {\"value\": \"15.00\", \"currency_code\": \"EUR\"}, \"status\": \"COMPLETED\", \"invoice_id\": \"00000001/OEZ\", \"create_time\": \"2023-11-28T08:49:54Z\", \"update_time\": \"2023-11-28T08:49:54Z\", \"final_capture\": true, \"seller_protection\": {\"status\": \"ELIGIBLE\", \"dispute_categories\": [\"ITEM_NOT_RECEIVED\", \"UNAUTHORIZED_TRANSACTION\"]}, \"seller_receivable_breakdown\": {\"net_amount\": {\"value\": \"14.14\", \"currency_code\": \"EUR\"}, \"paypal_fee\": {\"value\": \"0.86\", \"currency_code\": \"EUR\"}, \"gross_amount\": {\"value\": \"15.00\", \"currency_code\": \"EUR\"}}}]}, \"reference_id\": \"default\"}]}'),
(17, 2, '6RS335113T350300J', '15.00', '0.00', 1, 1, '{\"id\": \"6RS335113T350300J\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/6RS335113T350300J\", \"method\": \"GET\"}], \"payer\": {\"name\": {\"surname\": \"buyer\", \"given_name\": \"test\"}, \"address\": {\"country_code\": \"ES\"}, \"payer_id\": \"JW5PQBJ2KRWCE\", \"email_address\": \"jcgil1969-buyer@gmail.com\"}, \"status\": \"COMPLETED\", \"payment_source\": {\"paypal\": {\"name\": {\"surname\": \"buyer\", \"given_name\": \"test\"}, \"address\": {\"country_code\": \"ES\"}, \"account_id\": \"JW5PQBJ2KRWCE\", \"email_address\": \"jcgil1969-buyer@gmail.com\", \"account_status\": \"VERIFIED\"}}, \"purchase_units\": [{\"payments\": {\"captures\": [{\"id\": \"25528658N4174650J\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/payments/captures/25528658N4174650J\", \"method\": \"GET\"}, {\"rel\": \"refund\", \"href\": \"https://api.sandbox.paypal.com/v2/payments/captures/25528658N4174650J/refund\", \"method\": \"POST\"}, {\"rel\": \"up\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/6RS335113T350300J\", \"method\": \"GET\"}], \"amount\": {\"value\": \"15.00\", \"currency_code\": \"EUR\"}, \"status\": \"COMPLETED\", \"invoice_id\": \"00000001/FLA\", \"create_time\": \"2023-11-28T08:58:01Z\", \"update_time\": \"2023-11-28T08:58:01Z\", \"final_capture\": true, \"seller_protection\": {\"status\": \"ELIGIBLE\", \"dispute_categories\": [\"ITEM_NOT_RECEIVED\", \"UNAUTHORIZED_TRANSACTION\"]}, \"seller_receivable_breakdown\": {\"net_amount\": {\"value\": \"14.14\", \"currency_code\": \"EUR\"}, \"paypal_fee\": {\"value\": \"0.86\", \"currency_code\": \"EUR\"}, \"gross_amount\": {\"value\": \"15.00\", \"currency_code\": \"EUR\"}}}]}, \"reference_id\": \"default\"}]}'),
(18, 2, '3VM22096TJ779260P', '47.95', '0.00', 10, 1, '{}'),
(19, 2, '06D07963CD959514D', '33.59', '0.00', 14, 1, '{\"id\": \"06D07963CD959514D\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/06D07963CD959514D\", \"method\": \"GET\"}], \"payer\": {\"name\": {\"surname\": \"buyer\", \"given_name\": \"test\"}, \"address\": {\"country_code\": \"ES\"}, \"payer_id\": \"JW5PQBJ2KRWCE\", \"email_address\": \"jcgil1969-buyer@gmail.com\"}, \"status\": \"COMPLETED\", \"payment_source\": {\"paypal\": {\"name\": {\"surname\": \"buyer\", \"given_name\": \"test\"}, \"address\": {\"country_code\": \"ES\"}, \"account_id\": \"JW5PQBJ2KRWCE\", \"email_address\": \"jcgil1969-buyer@gmail.com\", \"account_status\": \"VERIFIED\"}}, \"purchase_units\": [{\"payments\": {\"captures\": [{\"id\": \"7XF39310E77863904\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/payments/captures/7XF39310E77863904\", \"method\": \"GET\"}, {\"rel\": \"refund\", \"href\": \"https://api.sandbox.paypal.com/v2/payments/captures/7XF39310E77863904/refund\", \"method\": \"POST\"}, {\"rel\": \"up\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/06D07963CD959514D\", \"method\": \"GET\"}], \"amount\": {\"value\": \"33.59\", \"currency_code\": \"EUR\"}, \"status\": \"COMPLETED\", \"invoice_id\": \"00000014/TPJ\", \"create_time\": \"2023-11-30T14:25:16Z\", \"update_time\": \"2023-11-30T14:25:16Z\", \"final_capture\": true, \"seller_protection\": {\"status\": \"ELIGIBLE\", \"dispute_categories\": [\"ITEM_NOT_RECEIVED\", \"UNAUTHORIZED_TRANSACTION\"]}, \"seller_receivable_breakdown\": {\"net_amount\": {\"value\": \"32.10\", \"currency_code\": \"EUR\"}, \"paypal_fee\": {\"value\": \"1.49\", \"currency_code\": \"EUR\"}, \"gross_amount\": {\"value\": \"33.59\", \"currency_code\": \"EUR\"}}}]}, \"reference_id\": \"default\"}]}'),
(20, 2, '1UY71304WB4019023', '33.59', '0.00', 14, 1, '{\"id\": \"1UY71304WB4019023\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/1UY71304WB4019023\", \"method\": \"GET\"}], \"payer\": {\"name\": {\"surname\": \"buyer\", \"given_name\": \"test\"}, \"address\": {\"country_code\": \"ES\"}, \"payer_id\": \"JW5PQBJ2KRWCE\", \"email_address\": \"jcgil1969-buyer@gmail.com\"}, \"status\": \"COMPLETED\", \"payment_source\": {\"paypal\": {\"name\": {\"surname\": \"buyer\", \"given_name\": \"test\"}, \"address\": {\"country_code\": \"ES\"}, \"account_id\": \"JW5PQBJ2KRWCE\", \"email_address\": \"jcgil1969-buyer@gmail.com\", \"account_status\": \"VERIFIED\"}}, \"purchase_units\": [{\"payments\": {\"captures\": [{\"id\": \"8EL04904X5174615A\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/payments/captures/8EL04904X5174615A\", \"method\": \"GET\"}, {\"rel\": \"refund\", \"href\": \"https://api.sandbox.paypal.com/v2/payments/captures/8EL04904X5174615A/refund\", \"method\": \"POST\"}, {\"rel\": \"up\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/1UY71304WB4019023\", \"method\": \"GET\"}], \"amount\": {\"value\": \"33.59\", \"currency_code\": \"EUR\"}, \"status\": \"COMPLETED\", \"invoice_id\": \"00000014/QRR\", \"create_time\": \"2023-11-30T14:27:54Z\", \"update_time\": \"2023-11-30T14:27:54Z\", \"final_capture\": true, \"seller_protection\": {\"status\": \"ELIGIBLE\", \"dispute_categories\": [\"ITEM_NOT_RECEIVED\", \"UNAUTHORIZED_TRANSACTION\"]}, \"seller_receivable_breakdown\": {\"net_amount\": {\"value\": \"32.10\", \"currency_code\": \"EUR\"}, \"paypal_fee\": {\"value\": \"1.49\", \"currency_code\": \"EUR\"}, \"gross_amount\": {\"value\": \"33.59\", \"currency_code\": \"EUR\"}}}]}, \"reference_id\": \"default\"}]}'),
(21, 2, '4321477150054204V', '11.50', '0.00', 15, 1, '{\"id\": \"4321477150054204V\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/4321477150054204V\", \"method\": \"GET\"}], \"payer\": {\"name\": {\"surname\": \"buyer\", \"given_name\": \"test\"}, \"address\": {\"country_code\": \"ES\"}, \"payer_id\": \"JW5PQBJ2KRWCE\", \"email_address\": \"jcgil1969-buyer@gmail.com\"}, \"status\": \"COMPLETED\", \"payment_source\": {\"paypal\": {\"name\": {\"surname\": \"buyer\", \"given_name\": \"test\"}, \"address\": {\"country_code\": \"ES\"}, \"account_id\": \"JW5PQBJ2KRWCE\", \"email_address\": \"jcgil1969-buyer@gmail.com\", \"account_status\": \"VERIFIED\"}}, \"purchase_units\": [{\"payments\": {\"captures\": [{\"id\": \"3GX74596BF267300R\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/payments/captures/3GX74596BF267300R\", \"method\": \"GET\"}, {\"rel\": \"refund\", \"href\": \"https://api.sandbox.paypal.com/v2/payments/captures/3GX74596BF267300R/refund\", \"method\": \"POST\"}, {\"rel\": \"up\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/4321477150054204V\", \"method\": \"GET\"}], \"amount\": {\"value\": \"11.50\", \"currency_code\": \"EUR\"}, \"status\": \"COMPLETED\", \"invoice_id\": \"00000015/HEV\", \"create_time\": \"2023-11-30T16:44:21Z\", \"update_time\": \"2023-11-30T16:44:21Z\", \"final_capture\": true, \"seller_protection\": {\"status\": \"ELIGIBLE\", \"dispute_categories\": [\"ITEM_NOT_RECEIVED\", \"UNAUTHORIZED_TRANSACTION\"]}, \"seller_receivable_breakdown\": {\"net_amount\": {\"value\": \"10.76\", \"currency_code\": \"EUR\"}, \"paypal_fee\": {\"value\": \"0.74\", \"currency_code\": \"EUR\"}, \"gross_amount\": {\"value\": \"11.50\", \"currency_code\": \"EUR\"}}}]}, \"reference_id\": \"default\"}]}'),
(22, 2, '35698960HL929054Y', '5.59', '0.00', 18, 1, '{\"id\": \"35698960HL929054Y\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/35698960HL929054Y\", \"method\": \"GET\"}], \"payer\": {\"name\": {\"surname\": \"buyer\", \"given_name\": \"test\"}, \"address\": {\"country_code\": \"ES\"}, \"payer_id\": \"JW5PQBJ2KRWCE\", \"email_address\": \"jcgil1969-buyer@gmail.com\"}, \"status\": \"COMPLETED\", \"payment_source\": {\"paypal\": {\"name\": {\"surname\": \"buyer\", \"given_name\": \"test\"}, \"address\": {\"country_code\": \"ES\"}, \"account_id\": \"JW5PQBJ2KRWCE\", \"email_address\": \"jcgil1969-buyer@gmail.com\", \"account_status\": \"VERIFIED\"}}, \"purchase_units\": [{\"payments\": {\"captures\": [{\"id\": \"1U878175EV663814F\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/payments/captures/1U878175EV663814F\", \"method\": \"GET\"}, {\"rel\": \"refund\", \"href\": \"https://api.sandbox.paypal.com/v2/payments/captures/1U878175EV663814F/refund\", \"method\": \"POST\"}, {\"rel\": \"up\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/35698960HL929054Y\", \"method\": \"GET\"}], \"amount\": {\"value\": \"5.59\", \"currency_code\": \"EUR\"}, \"status\": \"COMPLETED\", \"invoice_id\": \"00000018/NHG\", \"create_time\": \"2023-12-07T19:59:44Z\", \"update_time\": \"2023-12-07T19:59:44Z\", \"final_capture\": true, \"seller_protection\": {\"status\": \"ELIGIBLE\", \"dispute_categories\": [\"ITEM_NOT_RECEIVED\", \"UNAUTHORIZED_TRANSACTION\"]}, \"seller_receivable_breakdown\": {\"net_amount\": {\"value\": \"5.05\", \"currency_code\": \"EUR\"}, \"paypal_fee\": {\"value\": \"0.54\", \"currency_code\": \"EUR\"}, \"gross_amount\": {\"value\": \"5.59\", \"currency_code\": \"EUR\"}}}]}, \"reference_id\": \"default\"}]}');

-- --------------------------------------------------------

--
-- Estructura de la taula `tblEventConfig`
--

CREATE TABLE `tblEventConfig` (
  `EC_Id` int NOT NULL,
  `EC_Name` varchar(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EC_Logo` varchar(127) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EC_Description` varchar(255) DEFAULT NULL,
  `EC_Ubication` varchar(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EC_InitDate` datetime DEFAULT NULL,
  `EC_EndDate` datetime DEFAULT NULL,
  `EC_PaymentPlatform` varchar(63) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de la taula `tblInitTransactions`
--

CREATE TABLE `tblInitTransactions` (
  `IT_Id` int NOT NULL,
  `IT_IdUser` int NOT NULL,
  `IT_IdPayment` varchar(50) NOT NULL,
  `IT_Import` decimal(10,2) NOT NULL,
  `IT_IdCommand` int NOT NULL,
  `IT_IdPlatformTransaction` int NOT NULL,
  `IT_Info` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Bolcament de dades per a la taula `tblInitTransactions`
--

INSERT INTO `tblInitTransactions` (`IT_Id`, `IT_IdUser`, `IT_IdPayment`, `IT_Import`, `IT_IdCommand`, `IT_IdPlatformTransaction`, `IT_Info`) VALUES
(1, 3, '1', '34.45', 1, 1, 'null'),
(5, 2, '18M46403GG159383E', '15.00', 1, 1, 'null'),
(6, 2, '8T1198035C513804D', '15.00', 1, 1, 'null'),
(7, 2, '4GT24778FC263180W', '15.00', 1, 1, 'null'),
(8, 2, '2SU74458CB582480L', '15.00', 1, 1, 'null'),
(9, 2, '339905153H273801U', '15.00', 1, 1, 'null'),
(10, 2, '51J89494MV7771054', '15.00', 1, 1, 'null'),
(12, 2, '6D165883TS144140V', '15.00', 1, 1, 'null'),
(13, 2, '0VE6603025667931P', '15.00', 1, 1, 'null'),
(14, 2, '226641452K9893716', '15.00', 1, 1, 'null'),
(15, 2, '3MA840560Y6015310', '15.00', 1, 1, 'null'),
(19, 2, 'PROVA', '19.00', 2, 1, '{\"name\": \"Visa change 2.0 initTrans\", \"CardId\": 3030}'),
(20, 2, '8FX00895HG135870W', '15.00', 1, 1, '{\"id\": \"8FX00895HG135870W\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/8FX00895HG135870W\", \"method\": \"GET\"}, {\"rel\": \"payer-action\", \"href\": \"https://www.sandbox.paypal.com/checkoutnow?token=8FX00895HG135870W\", \"method\": \"GET\"}], \"status\": \"PAYER_ACTION_REQUIRED\", \"payment_source\": {\"paypal\": {}}}'),
(21, 2, '8BP526657E246184F', '15.00', 1, 1, '{\"id\": \"8BP526657E246184F\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/8BP526657E246184F\", \"method\": \"GET\"}, {\"rel\": \"payer-action\", \"href\": \"https://www.sandbox.paypal.com/checkoutnow?token=8BP526657E246184F\", \"method\": \"GET\"}], \"status\": \"PAYER_ACTION_REQUIRED\", \"payment_source\": {\"paypal\": {}}}'),
(23, 2, '30D23303KS725971E', '15.00', 1, 1, '{\"id\": \"30D23303KS725971E\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/30D23303KS725971E\", \"method\": \"GET\"}, {\"rel\": \"payer-action\", \"href\": \"https://www.sandbox.paypal.com/checkoutnow?token=30D23303KS725971E\", \"method\": \"GET\"}], \"status\": \"PAYER_ACTION_REQUIRED\", \"payment_source\": {\"paypal\": {}}}'),
(26, 2, '0TJ65840N4469642K', '47.95', 10, 1, '{\"id\": \"0TJ65840N4469642K\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/0TJ65840N4469642K\", \"method\": \"GET\"}], \"payer\": {\"name\": {\"surname\": \"buyer\", \"given_name\": \"test\"}, \"address\": {\"country_code\": \"ES\"}, \"payer_id\": \"JW5PQBJ2KRWCE\", \"email_address\": \"jcgil1969-buyer@gmail.com\"}, \"status\": \"COMPLETED\", \"payment_source\": {\"paypal\": {\"name\": {\"surname\": \"buyer\", \"given_name\": \"test\"}, \"address\": {\"country_code\": \"ES\"}, \"account_id\": \"JW5PQBJ2KRWCE\", \"email_address\": \"jcgil1969-buyer@gmail.com\", \"account_status\": \"VERIFIED\"}}, \"purchase_units\": [{\"payments\": {\"captures\": [{\"id\": \"3HM906843X8425234\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/payments/captures/3HM906843X8425234\", \"method\": \"GET\"}, {\"rel\": \"refund\", \"href\": \"https://api.sandbox.paypal.com/v2/payments/captures/3HM906843X8425234/refund\", \"method\": \"POST\"}, {\"rel\": \"up\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/0TJ65840N4469642K\", \"method\": \"GET\"}], \"amount\": {\"value\": \"47.95\", \"currency_code\": \"EUR\"}, \"status\": \"COMPLETED\", \"invoice_id\": \"00000010/YGM\", \"create_time\": \"2023-11-28T09:01:10Z\", \"update_time\": \"2023-11-28T09:01:10Z\", \"final_capture\": true, \"seller_protection\": {\"status\": \"ELIGIBLE\", \"dispute_categories\": [\"ITEM_NOT_RECEIVED\", \"UNAUTHORIZED_TRANSACTION\"]}, \"seller_receivable_breakdown\": {\"net_amount\": {\"value\": \"45.97\", \"currency_code\": \"EUR\"}, \"paypal_fee\": {\"value\": \"1.98\", \"currency_code\": \"EUR\"}, \"gross_amount\": {\"value\": \"47.95\", \"currency_code\": \"EUR\"}}}]}, \"reference_id\": \"default\"}]}'),
(27, 2, '7GA025334J218184W', '47.95', 10, 1, '{\"id\": \"7GA025334J218184W\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/7GA025334J218184W\", \"method\": \"GET\"}], \"payer\": {\"name\": {\"surname\": \"buyer\", \"given_name\": \"test\"}, \"address\": {\"country_code\": \"ES\"}, \"payer_id\": \"JW5PQBJ2KRWCE\", \"email_address\": \"jcgil1969-buyer@gmail.com\"}, \"status\": \"COMPLETED\", \"payment_source\": {\"paypal\": {\"name\": {\"surname\": \"buyer\", \"given_name\": \"test\"}, \"address\": {\"country_code\": \"ES\"}, \"account_id\": \"JW5PQBJ2KRWCE\", \"email_address\": \"jcgil1969-buyer@gmail.com\", \"account_status\": \"VERIFIED\"}}, \"purchase_units\": [{\"payments\": {\"captures\": [{\"id\": \"4RH65848L54058040\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/payments/captures/4RH65848L54058040\", \"method\": \"GET\"}, {\"rel\": \"refund\", \"href\": \"https://api.sandbox.paypal.com/v2/payments/captures/4RH65848L54058040/refund\", \"method\": \"POST\"}, {\"rel\": \"up\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/7GA025334J218184W\", \"method\": \"GET\"}], \"amount\": {\"value\": \"47.95\", \"currency_code\": \"EUR\"}, \"status\": \"COMPLETED\", \"invoice_id\": \"00000010/WWI\", \"create_time\": \"2023-11-28T09:13:24Z\", \"update_time\": \"2023-11-28T09:13:24Z\", \"final_capture\": true, \"seller_protection\": {\"status\": \"ELIGIBLE\", \"dispute_categories\": [\"ITEM_NOT_RECEIVED\", \"UNAUTHORIZED_TRANSACTION\"]}, \"seller_receivable_breakdown\": {\"net_amount\": {\"value\": \"45.97\", \"currency_code\": \"EUR\"}, \"paypal_fee\": {\"value\": \"1.98\", \"currency_code\": \"EUR\"}, \"gross_amount\": {\"value\": \"47.95\", \"currency_code\": \"EUR\"}}}]}, \"reference_id\": \"default\"}]}'),
(29, 2, '0WM89435G9580850U', '28.09', 12, 1, '{\"id\": \"0WM89435G9580850U\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/0WM89435G9580850U\", \"method\": \"GET\"}, {\"rel\": \"payer-action\", \"href\": \"https://www.sandbox.paypal.com/checkoutnow?token=0WM89435G9580850U\", \"method\": \"GET\"}], \"status\": \"PAYER_ACTION_REQUIRED\", \"payment_source\": {\"paypal\": {}}}'),
(30, 2, '9MS37437J4553204X', '28.09', 12, 1, '{\"id\": \"9MS37437J4553204X\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/9MS37437J4553204X\", \"method\": \"GET\"}, {\"rel\": \"payer-action\", \"href\": \"https://www.sandbox.paypal.com/checkoutnow?token=9MS37437J4553204X\", \"method\": \"GET\"}], \"status\": \"PAYER_ACTION_REQUIRED\", \"payment_source\": {\"paypal\": {}}}'),
(31, 2, '0N235173SF6970354', '9.00', 12, 1, '{\"id\": \"0N235173SF6970354\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/0N235173SF6970354\", \"method\": \"GET\"}, {\"rel\": \"payer-action\", \"href\": \"https://www.sandbox.paypal.com/checkoutnow?token=0N235173SF6970354\", \"method\": \"GET\"}], \"status\": \"PAYER_ACTION_REQUIRED\", \"payment_source\": {\"paypal\": {}}}'),
(32, 2, '0YL31009DW111800H', '9.00', 12, 1, '{\"id\": \"0YL31009DW111800H\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/0YL31009DW111800H\", \"method\": \"GET\"}, {\"rel\": \"payer-action\", \"href\": \"https://www.sandbox.paypal.com/checkoutnow?token=0YL31009DW111800H\", \"method\": \"GET\"}], \"status\": \"PAYER_ACTION_REQUIRED\", \"payment_source\": {\"paypal\": {}}}'),
(33, 2, '19H34261KU215603L', '15.50', 12, 1, '{\"id\": \"19H34261KU215603L\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/19H34261KU215603L\", \"method\": \"GET\"}, {\"rel\": \"payer-action\", \"href\": \"https://www.sandbox.paypal.com/checkoutnow?token=19H34261KU215603L\", \"method\": \"GET\"}], \"status\": \"PAYER_ACTION_REQUIRED\", \"payment_source\": {\"paypal\": {}}}'),
(34, 2, '5HG03711S9330753E', '15.50', 12, 1, '{\"id\": \"5HG03711S9330753E\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/5HG03711S9330753E\", \"method\": \"GET\"}, {\"rel\": \"payer-action\", \"href\": \"https://www.sandbox.paypal.com/checkoutnow?token=5HG03711S9330753E\", \"method\": \"GET\"}], \"status\": \"PAYER_ACTION_REQUIRED\", \"payment_source\": {\"paypal\": {}}}'),
(35, 2, '85119379CX595222H', '15.50', 12, 1, '{\"id\": \"85119379CX595222H\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/85119379CX595222H\", \"method\": \"GET\"}, {\"rel\": \"payer-action\", \"href\": \"https://www.sandbox.paypal.com/checkoutnow?token=85119379CX595222H\", \"method\": \"GET\"}], \"status\": \"PAYER_ACTION_REQUIRED\", \"payment_source\": {\"paypal\": {}}}'),
(36, 2, '00000013/MNE', '18.50', 13, 2, '{\"Ds_Signature\": \"NWD8ykh/UKytba0JQGZhVqxplEJcb/OaIUJYMOJuviA=\", \"Ds_SignatureVersion\": \"HMAC_SHA256_V1\", \"Ds_MerchantParameters\": \"eyJEU19NRVJDSEFOVF9BTU9VTlQiOiIxODUwIiwiRFNfTUVSQ0hBTlRfQ1VSUkVOQ1kiOiI5NzgiLCJEU19NRVJDSEFOVF9NRVJDSEFOVENPREUiOiI5OTkwMDg4ODEiLCJEU19NRVJDSEFOVF9NRVJDSEFOVFVSTCI6Imh0dHBzOi8vNmN2Yjg3ZzUtODAxMy51a3MxLmRldnR1bm5lbHMubXMvcmVkc3lzL25vdGkiLCJEU19NRVJDSEFOVF9PUkRFUiI6IjAwMDAwMDEzL01ORSIsIkRTX01FUkNIQU5UX1RFUk1JTkFMIjoiMDAxIiwiRFNfTUVSQ0hBTlRfVFJBTlNBQ1RJT05UWVBFIjoiMCIsIkRTX01FUkNIQU5UX1VSTEtPIjoiaHR0cHM6Ly82Y3ZiODdnNS04MDEzLnVrczEuZGV2dHVubmVscy5tcy9yZWRzeXMva28iLCJEU19NRVJDSEFOVF9VUkxPSyI6Imh0dHBzOi8vNmN2Yjg3ZzUtODAxMy51a3MxLmRldnR1bm5lbHMubXMvcmVkc3lzL29rIiwiRFNfTUVSQ0hBTlRfTUVSQ0hBTlREQVRBIjoidGVzdCJ9\"}'),
(37, 2, '00000013/AIZ', '18.50', 13, 2, '{\"Ds_Signature\": \"RfD7M1n5KFZv4g2xCucCSbpjwepHQyacqSFlIbmnkT8=\", \"Ds_SignatureVersion\": \"HMAC_SHA256_V1\", \"Ds_MerchantParameters\": \"eyJEU19NRVJDSEFOVF9BTU9VTlQiOiIxODUwIiwiRFNfTUVSQ0hBTlRfQ1VSUkVOQ1kiOiI5NzgiLCJEU19NRVJDSEFOVF9NRVJDSEFOVENPREUiOiI5OTkwMDg4ODEiLCJEU19NRVJDSEFOVF9NRVJDSEFOVFVSTCI6Imh0dHBzOi8vNmN2Yjg3ZzUtODAxMy51a3MxLmRldnR1bm5lbHMubXMvcmVkc3lzL25vdGkiLCJEU19NRVJDSEFOVF9PUkRFUiI6IjAwMDAwMDEzL0FJWiIsIkRTX01FUkNIQU5UX1RFUk1JTkFMIjoiMDAxIiwiRFNfTUVSQ0hBTlRfVFJBTlNBQ1RJT05UWVBFIjoiMCIsIkRTX01FUkNIQU5UX1VSTEtPIjoiaHR0cHM6Ly82Y3ZiODdnNS04MDEzLnVrczEuZGV2dHVubmVscy5tcy9yZWRzeXMva28iLCJEU19NRVJDSEFOVF9VUkxPSyI6Imh0dHBzOi8vNmN2Yjg3ZzUtODAxMy51a3MxLmRldnR1bm5lbHMubXMvcmVkc3lzL29rIiwiRFNfTUVSQ0hBTlRfTUVSQ0hBTlREQVRBIjoidGVzdCJ9\"}'),
(38, 2, '07505022758231450', '14.59', 13, 1, '{\"id\": \"07505022758231450\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/07505022758231450\", \"method\": \"GET\"}, {\"rel\": \"payer-action\", \"href\": \"https://www.sandbox.paypal.com/checkoutnow?token=07505022758231450\", \"method\": \"GET\"}], \"status\": \"PAYER_ACTION_REQUIRED\", \"payment_source\": {\"paypal\": {}}}'),
(39, 2, '00000013/BOE', '14.59', 13, 2, '{\"Ds_Signature\": \"qgkEhXyY4+JdwTqW361T6ltqHwtkYpoFdztQYHCLFm8=\", \"Ds_SignatureVersion\": \"HMAC_SHA256_V1\", \"Ds_MerchantParameters\": \"eyJEU19NRVJDSEFOVF9BTU9VTlQiOiIxNDU5IiwiRFNfTUVSQ0hBTlRfQ1VSUkVOQ1kiOiI5NzgiLCJEU19NRVJDSEFOVF9NRVJDSEFOVENPREUiOiI5OTkwMDg4ODEiLCJEU19NRVJDSEFOVF9NRVJDSEFOVFVSTCI6Imh0dHBzOi8vYmFycmFhcHAuZXUvcmVkc3lzL25vdGkiLCJEU19NRVJDSEFOVF9PUkRFUiI6IjAwMDAwMDEzL0JPRSIsIkRTX01FUkNIQU5UX1RFUk1JTkFMIjoiMDAxIiwiRFNfTUVSQ0hBTlRfVFJBTlNBQ1RJT05UWVBFIjoiMCIsIkRTX01FUkNIQU5UX1VSTEtPIjoiaHR0cHM6Ly9iYXJyYWFwcC5ldS9yZWRzeXMva28iLCJEU19NRVJDSEFOVF9VUkxPSyI6Imh0dHBzOi8vYmFycmFhcHAuZXUvcmVkc3lzL29rIiwiRFNfTUVSQ0hBTlRfTUVSQ0hBTlREQVRBIjoidGVzdCJ9\"}'),
(40, 2, '63Y501775V7143610', '14.59', 13, 1, '{\"id\": \"63Y501775V7143610\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/63Y501775V7143610\", \"method\": \"GET\"}, {\"rel\": \"payer-action\", \"href\": \"https://www.sandbox.paypal.com/checkoutnow?token=63Y501775V7143610\", \"method\": \"GET\"}], \"status\": \"PAYER_ACTION_REQUIRED\", \"payment_source\": {\"paypal\": {}}}'),
(41, 2, '8VH62204NR1843040', '14.59', 13, 1, '{\"id\": \"8VH62204NR1843040\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/8VH62204NR1843040\", \"method\": \"GET\"}, {\"rel\": \"payer-action\", \"href\": \"https://www.sandbox.paypal.com/checkoutnow?token=8VH62204NR1843040\", \"method\": \"GET\"}], \"status\": \"PAYER_ACTION_REQUIRED\", \"payment_source\": {\"paypal\": {}}}'),
(42, 2, '6NU62625PE113093S', '33.59', 14, 1, '{\"id\": \"6NU62625PE113093S\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/6NU62625PE113093S\", \"method\": \"GET\"}, {\"rel\": \"payer-action\", \"href\": \"https://www.sandbox.paypal.com/checkoutnow?token=6NU62625PE113093S\", \"method\": \"GET\"}], \"status\": \"PAYER_ACTION_REQUIRED\", \"payment_source\": {\"paypal\": {}}}'),
(46, 2, '88E89297SE101683Y', '4.50', 17, 1, '{\"id\": \"88E89297SE101683Y\", \"links\": [{\"rel\": \"self\", \"href\": \"https://api.sandbox.paypal.com/v2/checkout/orders/88E89297SE101683Y\", \"method\": \"GET\"}, {\"rel\": \"payer-action\", \"href\": \"https://www.sandbox.paypal.com/checkoutnow?token=88E89297SE101683Y\", \"method\": \"GET\"}], \"status\": \"PAYER_ACTION_REQUIRED\", \"payment_source\": {\"paypal\": {}}}');

-- --------------------------------------------------------

--
-- Estructura de la taula `tblProducts`
--

CREATE TABLE `tblProducts` (
  `P_Id` int NOT NULL,
  `P_IdProductFamily` int NOT NULL,
  `P_Name` varchar(63) NOT NULL,
  `P_Disabled` int NOT NULL DEFAULT '0',
  `P_Price` decimal(10,2) NOT NULL,
  `P_Description` varchar(2027) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `P_IVA` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Bolcament de dades per a la taula `tblProducts`
--

INSERT INTO `tblProducts` (`P_Id`, `P_IdProductFamily`, `P_Name`, `P_Disabled`, `P_Price`, `P_Description`, `P_IVA`) VALUES
(1, 1, 'Estrella Damm', 0, '2.00', 'Estrella Damm, 4.5% amb blat', '21.00'),
(2, 3, 'Combinat senzill', 0, '4.50', 'Combinat senzill (no es pot posar RedBull ni BlueLabel)', '21.00'),
(3, 5, 'Entrepà de verdures', 0, '5.59', 'Entrepa de pebrot vermell i ceba. Amb oli i tomàquet qualsevol combinació de les dues.', '11.50'),
(5, 1, 'prova de producte', 1, '13.00', 'un producte de prova', '21.20'),
(7, 1, 'Voll Damm', 0, '3.50', 'Cervesa doble malta feta als llocs mes macos del Pirineu Català, amb una textura maltesca i de caire rugos', '21.00'),
(8, 4, 'Fanta de Llimona', 0, '2.00', 'Fanta de LLimona, amb 38g de sucre cada 100g\r\nGas de tipus C0459', '21.00'),
(9, 3, 'St Francisco', 0, '14.00', 'Recepta secreta', '21.00'),
(10, 4, 'Fanta de LLimona', 1, '2.00', 'Fanta de LLimona, amb 38g de sucre cada 100g\r\nGas de tipus C0459', '21.00'),
(11, 3, 'St Francisco', 1, '14.00', 'Recepta secreta', '21.00'),
(12, 5, 'as', 1, '21.00', 'as', '12.00'),
(13, 1, 'Amstel', 0, '2.10', 'Com una bona Amstel, enlloc', '21.00'),
(14, 4, 'Fanta de Taronja', 0, '2.00', 'Una fanta de taronja bona bona', '21.00'),
(15, 5, 'Entrepà de pernil', 0, '1.50', 'Entrepa de pernil dolç amb tomàquet', '12.00'),
(16, 45, 'coctel', 0, '5.00', 'coctel', '21.00');

-- --------------------------------------------------------

--
-- Estructura de la taula `tblProductsFamily`
--

CREATE TABLE `tblProductsFamily` (
  `PF_IdFamily` int NOT NULL,
  `PF_Name` varchar(63) NOT NULL,
  `PF_Disabled` int NOT NULL DEFAULT '0',
  `PF_Description` varchar(255) NOT NULL,
  `PF_AgeLimit` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Bolcament de dades per a la taula `tblProductsFamily`
--

INSERT INTO `tblProductsFamily` (`PF_IdFamily`, `PF_Name`, `PF_Disabled`, `PF_Description`, `PF_AgeLimit`) VALUES
(1, 'Begudes fermentades', 0, 'Cerveses', 18),
(2, 'a', 1, 'a', 2),
(3, 'Begudes VIP', 0, 'Combinats', 18),
(4, 'Refrescs amb gas', 0, 'Un cojunt de refrescs que porten gas', 12),
(5, 'Menjar', 0, 'Conjunt de productes de menjar', 0),
(8, '123456', 1, '123456', 12),
(9, 'zxc', 1, 'zxc', 21),
(10, '123', 1, '123', 123),
(42, 'Coctels', 1, 'update fet correctament', 17),
(44, 'coctels', 0, 'coctels', 18),
(45, 'coctels', 0, 'coctels', 18);

-- --------------------------------------------------------

--
-- Estructura de la taula `tblUsers`
--

CREATE TABLE `tblUsers` (
  `USR_Id` int NOT NULL,
  `USR_Email` varchar(100) NOT NULL,
  `USR_Password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'Generated using bcrypt (contains salt)',
  `USR_Role` varchar(31) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT ' admin - bartender - customer',
  `USR_Name` varchar(100) NOT NULL,
  `USR_Surname1` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `USR_Surname2` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `USR_BirthDate` date NOT NULL,
  `USR_Balance` decimal(10,2) NOT NULL DEFAULT '0.00',
  `USR_VerificationKey` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'Tipus Uuid',
  `USR_Verified` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Bolcament de dades per a la taula `tblUsers`
--

INSERT INTO `tblUsers` (`USR_Id`, `USR_Email`, `USR_Password`, `USR_Role`, `USR_Name`, `USR_Surname1`, `USR_Surname2`, `USR_BirthDate`, `USR_Balance`, `USR_VerificationKey`, `USR_Verified`) VALUES
(1, 'admin@gmail.com', '$2a$12$r9/JJCPKP7ltn.ZY3bQrhe9sz6vC068By/hH5.I7kpUfp2l0nlSAe', 'admin', 'Joan', 'Gil', 'Morales', '2000-12-04', '0.99', '21302d62-c08b-4a7c-b2d0-f9e4944659bb', 1),
(2, 'customer@gmail.com', '$2a$12$HkZ0lvUWqqgsRAVJfcTiiuG9OuegbKLnlP27pisAxmPXIx2wydCRC', 'customer', 'Joan', 'gil', 'momo', '1995-10-03', '5.56', 'f9918a8d-9730-4cf5-8b79-fbbf1c323cab', 1),
(3, 'asdasd@asdasd.com', '$2a$12$YZsz4/..6iotjtwyiSotiuP6C3fvTaO3XAHqVPo0FYS7ScwIQUzrq', 'customer', 'Menor21', 'Uhmil', '', '2003-01-03', '99.99', '23e3beee-9ab0-451b-9ab6-7b21f2a24927', 0),
(4, 'prova@gmail.com', '$2a$12$FwcyJkaihZjyZyJFNXuSpO6Zp5pfWHPc1qPojAhmcwIh/V8NpzgEa', 'customer', 'Menor18', 'prova', NULL, '2010-11-15', '31.99', 'e6cb44ea-bcc7-4e63-9c1b-eabd4ace0232', 0),
(5, 'bartender@gmail.com', '$2a$12$SHpla9UzHG0yszkIIGGG5ujDlwwIz9M.OS1Um7GjzET3bRz/Q.9T2', 'bartender', 'Bart', 'Simpson', 'otro', '1969-05-09', '0.00', '9a713ecb-75ab-4a1c-a08e-f5e6c4c9c222', 1),
(6, 'nacholladocortes@gmail.com', '$2b$05$ZlOrzrnUCIP0e6/7FjxwVe955vhVyqhCaqviROeKcNZ44SMHxY7K2', 'customer', 'Nacho', 'Lladó', '', '2001-04-03', '0.00', '80c6b9fd-a600-4503-9577-64218b329441', 0);

--
-- Índexs per a les taules bolcades
--

--
-- Índexs per a la taula `tblCommandLines`
--
ALTER TABLE `tblCommandLines`
  ADD PRIMARY KEY (`CL_Id`),
  ADD KEY `CL_IdCommand` (`CL_IdCommand`),
  ADD KEY `CL_IdProduct` (`CL_IdProduct`);

--
-- Índexs per a la taula `tblCommands`
--
ALTER TABLE `tblCommands`
  ADD PRIMARY KEY (`COM_Id`),
  ADD UNIQUE KEY `idx_unique_uuid` (`COM_Uuid`) USING BTREE,
  ADD KEY `COM_IdUser` (`COM_IdUser`);

--
-- Índexs per a la taula `tblEndedTransactions`
--
ALTER TABLE `tblEndedTransactions`
  ADD PRIMARY KEY (`ET_Id`),
  ADD KEY `T_IdUser` (`ET_IdUser`),
  ADD KEY `T_IdCommand` (`ET_IdCommand`);

--
-- Índexs per a la taula `tblEventConfig`
--
ALTER TABLE `tblEventConfig`
  ADD PRIMARY KEY (`EC_Id`);

--
-- Índexs per a la taula `tblInitTransactions`
--
ALTER TABLE `tblInitTransactions`
  ADD PRIMARY KEY (`IT_Id`),
  ADD KEY `IT_IdUser` (`IT_IdUser`),
  ADD KEY `IT_IdCommand` (`IT_IdCommand`);

--
-- Índexs per a la taula `tblProducts`
--
ALTER TABLE `tblProducts`
  ADD PRIMARY KEY (`P_Id`),
  ADD KEY `P_IdProductFamily` (`P_IdProductFamily`);

--
-- Índexs per a la taula `tblProductsFamily`
--
ALTER TABLE `tblProductsFamily`
  ADD PRIMARY KEY (`PF_IdFamily`);

--
-- Índexs per a la taula `tblUsers`
--
ALTER TABLE `tblUsers`
  ADD PRIMARY KEY (`USR_Id`),
  ADD UNIQUE KEY `USR_Email` (`USR_Email`),
  ADD UNIQUE KEY `USR_VerificationKey` (`USR_VerificationKey`);

--
-- AUTO_INCREMENT per les taules bolcades
--

--
-- AUTO_INCREMENT per la taula `tblCommandLines`
--
ALTER TABLE `tblCommandLines`
  MODIFY `CL_Id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT per la taula `tblCommands`
--
ALTER TABLE `tblCommands`
  MODIFY `COM_Id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT per la taula `tblEndedTransactions`
--
ALTER TABLE `tblEndedTransactions`
  MODIFY `ET_Id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT per la taula `tblEventConfig`
--
ALTER TABLE `tblEventConfig`
  MODIFY `EC_Id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la taula `tblInitTransactions`
--
ALTER TABLE `tblInitTransactions`
  MODIFY `IT_Id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT per la taula `tblProducts`
--
ALTER TABLE `tblProducts`
  MODIFY `P_Id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT per la taula `tblProductsFamily`
--
ALTER TABLE `tblProductsFamily`
  MODIFY `PF_IdFamily` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT per la taula `tblUsers`
--
ALTER TABLE `tblUsers`
  MODIFY `USR_Id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restriccions per a les taules bolcades
--

--
-- Restriccions per a la taula `tblCommandLines`
--
ALTER TABLE `tblCommandLines`
  ADD CONSTRAINT `tblCommandLines_ibfk_1` FOREIGN KEY (`CL_IdCommand`) REFERENCES `tblCommands` (`COM_Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tblCommandLines_ibfk_2` FOREIGN KEY (`CL_IdProduct`) REFERENCES `tblProducts` (`P_Id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restriccions per a la taula `tblCommands`
--
ALTER TABLE `tblCommands`
  ADD CONSTRAINT `tblCommands_ibfk_1` FOREIGN KEY (`COM_IdUser`) REFERENCES `tblUsers` (`USR_Id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restriccions per a la taula `tblEndedTransactions`
--
ALTER TABLE `tblEndedTransactions`
  ADD CONSTRAINT `tblEndedTransactions_ibfk_1` FOREIGN KEY (`ET_IdUser`) REFERENCES `tblUsers` (`USR_Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tblEndedTransactions_ibfk_2` FOREIGN KEY (`ET_IdCommand`) REFERENCES `tblCommands` (`COM_Id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restriccions per a la taula `tblInitTransactions`
--
ALTER TABLE `tblInitTransactions`
  ADD CONSTRAINT `tblInitTransactions_ibfk_1` FOREIGN KEY (`IT_IdUser`) REFERENCES `tblUsers` (`USR_Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tblInitTransactions_ibfk_2` FOREIGN KEY (`IT_IdCommand`) REFERENCES `tblCommands` (`COM_Id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restriccions per a la taula `tblProducts`
--
ALTER TABLE `tblProducts`
  ADD CONSTRAINT `tblProducts_ibfk_1` FOREIGN KEY (`P_IdProductFamily`) REFERENCES `tblProductsFamily` (`PF_IdFamily`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
