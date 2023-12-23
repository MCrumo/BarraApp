const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const config = require('../config/config');
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require('uuid');
const { validationResult, param, body } = require('express-validator');
var validate = require('uuid-validate');
const publicRouter = express.Router();
const secretKey = config.jwtKey;
const path = require('path');
const fs = require('fs');

const transporter = nodemailer.createTransport({
    service: config.mailTransporter.service,
    host: config.mailTransporter.host,
    port: config.mailTransporter.port,
    secure: config.mailTransporter.secure,
    auth: {
        user: config.mailTransporter.auth.user,
        pass: config.mailTransporter.auth.pass,
    },
});

/**************************************
 **                                  **
 **              LOGIN               **
 **                                  **
 **************************************/

/***** GET *****/

/**
 * Inicia la sessió per l'usuari i assigna un token de sessió
 * 
 * @route GET /ba-login/:user/:pass
 * @group Login
 * @param {string} user Nom d'usuari (format e-mail)
 * @param {string} pass Contrasenya de l'usuari
 * @returns {SuccessResponse} 200 - Login correcte
 * @returns {ErrorResponse} 400 - [-30] Error en els paràmetres. Array de "message"
 * @returns {ErrorResponse} 404 - [-11] Credencials invàlides
 * @returns {ErrorResponse} 401 - [-12] Usuari amb email sense verificar
 * @returns {ErrorResponse} 500 - [-10] Error intern del servidor
 * @returns {ErrorResponse} 500 - [-20] Error de la base de dades
 */
publicRouter.get('/ba-login/:user/:pass',
    [
        param('user').notEmpty().isEmail().withMessage('L\'usuari ha de ser un e-mail vàlid.'),
        param('pass').notEmpty().withMessage('Has de proporcionar una contrasenya vàlida.')
    ],
    (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const messages = errors.array().map(error => error.msg);
                return res.status(400).json({ result: -30, data: { message: messages } });
            }

            const user = req.params.user;
            const pass = req.params.pass;

            dbConnection.query('SELECT * FROM tblUsers WHERE USR_Email=?', [user], (err, results, fields) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).send({ result: -20, data: { message: 'Database error' } });
                }

                // No hi ha cap usuari amb tal email
                if (results.length === 0) {
                    return res.status(404).send({ result: -11, data: { message: 'Invalid credentials' } });

                }

                // L'usuari no ha verificat el seu compte
                else if (!results[0].USR_Verified) {
                    return res.status(401).send({ result: -12, data: { message: 'User not verified' } });
                }

                // Existeix un usuari amb tal email
                else {
                    bcrypt.compare(pass, results[0].USR_Password, function (err, isValid) {
                        if (err) {
                            console.error('Internal server error (user password check):', err);
                            res.status(400).send({ result: -10, data: { message: 'Internal server error' } });
                            return;
                        }

                        if (isValid) { // Contrasenya correcte
                            const payload = {
                                id: results[0].USR_Id,
                                email: user
                            }

                            const token = jwt.sign(payload, config.jwtKey, { expiresIn: '5h' });
                            return res.status(200).send({
                                result: 0,
                                data: {
                                    USR_Id: results[0].USR_Id,
                                    USR_Email: results[0].USR_Email,
                                    USR_Role: results[0].USR_Role,
                                    USR_Name: results[0].USR_Name,
                                    USR_Surname1: results[0].USR_Surname1,
                                    USR_Surname2: results[0].USR_Surname2,
                                    token
                                }
                            });
                        } else { // Contrasenya incorrecte
                            return res.status(404).send({ result: -11, data: {  message: 'Invalid credentials' } });
                        }
                    });
                }
            });
        } catch (error) {
            console.error('Internal server error:', error);
            return res.status(400).json({ result: -10, data: { message: 'Internal server error' } });
        }
    });

/***** POST *****/

/**
 * Verifica el token de sessió
 * 
 * @route GET /verify-token
 * @group Login
 * @param {string} token Bearer token
 * @returns {SuccessResponse} 200 - Login correcte
 * @returns {ErrorResponse} 400 - [-10] Error intern del servidor
 * @returns {ErrorResponse} 404 - [-11] Token invàlid
 * @returns {ErrorResponse} 404 - [-12] Usuari no reconegut
 * @returns {ErrorResponse} 500 - [-20] Error de la base de dades
 */
publicRouter.post('/verify-token', (req, res) => {
    try {
        const token = req.body.token;

        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.status(400).send({ result: -11, data: { message: 'Token inválido' } });
            }
            req.userData = decoded;

            // Recull les dades de l'usuari
            dbConnection.query('SELECT USR_Id, USR_Role, USR_Email, USR_Name, USR_Surname1, USR_Surname2 FROM tblUsers WHERE USR_ID=?', [decoded.id], (err, results, fields) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).send({ result: -20, data: { message: 'Database error' } });
                }

                if (results.length === 0) {
                    return res.status(404).send({ result: -12, data: { message: 'User unknown' } });
                } else {
                    return res.status(200).send({
                        result: 0,
                        data: {
                            USR_Id: results[0].USR_Id,
                            USR_Email: results[0].USR_Email,
                            USR_Role: results[0].USR_Role,
                            USR_Name: results[0].USR_Name,
                            USR_Surname1: results[0].USR_Surname1,
                            USR_Surname2: results[0].USR_Surname2,
                            token  
                        }  
                    });
                }
            });
        });
    } catch (error) {
        console.error('Internal server error:', error);
        return res.status(400).json({ result: -10, data: { message: 'Internal server error' } });
    }
});

/**************************************
 **                                  **
 **            ENROLLMENT            **
 **                                  **
 **************************************/

/***** GET *****/

/**
 * Verifica el correu de l'usuari
 * 
 * @route POST /email-verification/:user/:key
 * @group Login
 * @param {string} user Nom d'usuari (format e-mail)
 * @param {string} key Clau uuid de confirmació d'email
 * @returns {SuccessResponse} 200 - [0] Usuari autenticat correctament
 * @returns {SuccessResponse} 200 - [1] Usuari ja autenticat
 * @returns {ErrorResponse} 400 - [-30] Error en els paràmetres. Array de "message"
 * @returns {ErrorResponse} 400 - [-10] Error intern del servidor
 * @returns {ErrorResponse} 400 - [-11] Error no existeix cap usuari amb tal email i clau de verificació
 * @returns {ErrorResponse} 400 - [-12] Error l'usuari ja té el compte verificat
 * @returns {ErrorResponse} 500 - [-20] Error de la base de dades
 */
publicRouter.get('/email-verification/:user/:key',
    [
        param('user').notEmpty().isEmail().withMessage("L\'usuari ha de ser un e-mail vàlid."),
        param('key').custom((value, { req }) => {
            if (!validate(value, 4)) {
                throw new Error('La clau no és vàlida.');
            } return true; })
    ], (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const messages = errors.array().map(error => error.msg);
                return res.status(400).json({ result: -30, data: { message: messages } });
            }

            const {user, key} = req.params;

            dbConnection.query('SELECT * FROM tblUsers WHERE USR_Email=? AND USR_VerificationKey=?', [user, key], (err, results, fields) => {
                if (err) { // Control d'errors: fallada de connexió amb la BD
                    console.error('Database error:', err);
                    return res.status(500).json({ result: -20, data: { message: 'Database error' } });
                }

                if (results.length === 0) { 
                    return res.status(404).send({ result: -11, data: { message: 'Email or key not valid' } });

                }

                // L'usuari ja ha verificat el seu compte
                else if (results[0].USR_Verified) { 
                    return res.status(200).send({ result: 1, data: {  message: 'User already verified' } });
                }

                else {
                    dbConnection.query('UPDATE tblUsers SET USR_Verified=1 WHERE USR_Email=? AND USR_VerificationKey=?', [user, key], (err, results, fields) => {
                        if (err) { // Control d'errors: fallada de connexió amb la BD
                            console.error('Database error:', err);
                            return res.status(500).json({ result: -20, data: { message: 'Database error' } });
                        }
                        // HAIG DE FER AIXI LA REDIRECCIÓ ????????
                        return res.status(200).json({ result: 0, data: { message: 'Correu verificat correctament' } });
                    });
                }
            });
        } catch (error) {
            console.error('Internal server error:', error);
            return res.status(400).json({ result: -10, data: { message: 'Internal server error' } });
        }
});

/***** POST *****/

/**
 * Verifica el token de sessió
 * 
 * @route GET /verify-token
 * @group Login
 * @param {string} token Bearer token
 * @returns {SuccessResponse} 200 - Login correcte
 * @returns {ErrorResponse} 400 - [-10] Error intern del servidor
 * @returns {ErrorResponse} 404 - [-11] Token invàlid
 * @returns {ErrorResponse} 404 - [-12] Usuari no reconegut
 * @returns {ErrorResponse} 500 - [-20] Error de la base de dades
 */
publicRouter.post('/verify-token', (req, res) => {
    try {
        const token = req.body.token;

        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.status(400).send({ result: -11, data: { message: 'Token inválido' } });
            }
            req.userData = decoded;

            // Recull les dades de l'usuari
            dbConnection.query('SELECT USR_Id, USR_Role, USR_Email, USR_Name, USR_Surname1, USR_Surname2 FROM tblUsers WHERE USR_ID=?', [decoded.id], (err, results, fields) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).send({ result: -20, data: { message: 'Database error' } });
                }

                if (results.length === 0) {
                    return res.status(404).send({ result: -12, data: { message: 'User unknown' } });
                } else {
                    return res.status(200).send({
                        result: 0,
                        data: {
                            USR_Id: results[0].USR_Id,
                            USR_Email: results[0].USR_Email,
                            USR_Role: results[0].USR_Role,
                            USR_Name: results[0].USR_Name,
                            USR_Surname1: results[0].USR_Surname1,
                            USR_Surname2: results[0].USR_Surname2,
                            token  
                        }  
                    });
                }
            });
        });
    } catch (error) {
        console.error('Internal server error:', error);
        return res.status(400).json({ result: -10, data: { message: 'Internal server error' } });
    }
});

/**************************************
 **                                  **
 **            ENROLLMENT            **
 **                                  **
 **************************************/

/***** GET *****/

/**
 * Verifica el correu de l'usuari
 * 
 * @route POST /email-verification/:user/:key
 * @group Login
 * @param {string} user Nom d'usuari (format e-mail)
 * @param {string} key Clau uuid de confirmació d'email
 * @returns {SuccessResponse} 200 - [0] Usuari autenticat correctament
 * @returns {SuccessResponse} 200 - [1] Usuari ja autenticat
 * @returns {ErrorResponse} 400 - [-30] Error en els paràmetres. Array de "message"
 * @returns {ErrorResponse} 400 - [-10] Error intern del servidor
 * @returns {ErrorResponse} 400 - [-11] Error no existeix cap usuari amb tal email i clau de verificació
 * @returns {ErrorResponse} 400 - [-12] Error l'usuari ja té el compte verificat
 * @returns {ErrorResponse} 500 - [-20] Error de la base de dades
 */
publicRouter.get('/email-verification/:user/:key',
    [
        param('user').notEmpty().isEmail().withMessage("L\'usuari ha de ser un e-mail vàlid."),
        param('key').custom((value, { req }) => {
            if (!validate(value, 4)) {
                throw new Error('La clau no és vàlida.');
            } return true; })
    ], (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const messages = errors.array().map(error => error.msg);
                return res.status(400).json({ result: -30, data: { message: messages } });
            }

            const {user, key} = req.params;

            dbConnection.query('SELECT * FROM tblUsers WHERE USR_Email=? AND USR_VerificationKey=?', [user, key], (err, results, fields) => {
                if (err) { // Control d'errors: fallada de connexió amb la BD
                    console.error('Database error:', err);
                    return res.status(500).json({ result: -20, data: { message: 'Database error' } });
                }

                if (results.length === 0) { 
                    return res.status(404).send({ result: -11, data: { message: 'Email or key not valid' } });

                }

                // L'usuari ja ha verificat el seu compte
                else if (results[0].USR_Verified) { 
                    return res.status(200).send({ result: 1, data: {  message: 'User already verified' } });
                }

                else {
                    dbConnection.query('UPDATE tblUsers SET USR_Verified=1 WHERE USR_Email=? AND USR_VerificationKey=?', [user, key], (err, results, fields) => {
                        if (err) { // Control d'errors: fallada de connexió amb la BD
                            console.error('Database error:', err);
                            return res.status(500).json({ result: -20, data: { message: 'Database error' } });
                        }
                        // HAIG DE FER AIXI LA REDIRECCIÓ ????????
                        return res.status(200).json({ result: 0, data: { message: 'Correu verificat correctament' } });
                    });
                }
            });
        } catch (error) {
            console.error('Internal server error:', error);
            return res.status(400).json({ result: -10, data: { message: 'Internal server error' } });
        }
});

/***** POST *****/

/**
 * Registra un usuari i envia el correu de verificació
 * 
 * @route POST /user-enrollment
 * @group Login
 * @param {string} user Nom d'usuari (format e-mail)
 * @param {string} pass Contrasenya de l'usuari
 * @param {string} name Nom de l'usuari  (max 100 caràcters)
 * @param {string} surname1 Cognom 1 de l'usuari (max 100 caràcters)
 * @param {string} surname2 Cognom 2 de l'usuari [opcional] (max 100 caràcters)
 * @param {string} birth Data de naixament (format yyyy-MM-dd)
 * @returns {SuccessResponse} 200 - Login correcte
 * @returns {ErrorResponse} 400 - [-30] Error en els paràmetres. Array de "message"
 * @returns {ErrorResponse} 400 - [-10] Error intern del servidor
 * @returns {ErrorResponse} 400 - [-11] Error de Bcrypt en processar el Hash del password
 * @returns {ErrorResponse} 500 - [-12] Error en enviar correu de verificació
 * @returns {ErrorResponse} 500 - [-13] Error falta model mail a la carpeta assets
 * @returns {ErrorResponse} 500 - [-20] Error de la base de dades
 * @returns {ErrorResponse} 500 - [-21] Error de la base de dades, l'usuari ja està donat d'alta
 */
publicRouter.post('/user-enrollment',
    [
        body('user').notEmpty().isEmail().withMessage("L\'usuari ha de ser un e-mail vàlid."),
        body('pass').notEmpty().withMessage("La contrasenya no pot estar buida"),
        body('name').notEmpty().isLength({ max: 100 }).withMessage("S'ha de proporcionar un nom. Màxim 100 caràcters."),
        body('surname1').notEmpty().isLength({ max: 100 }).withMessage("S'ha de proporcionar el primer cognom. Màxim 100 caràcters."),
        body('surname2').optional({ checkFalsy: true }).isLength({ max: 100 }).withMessage("El segon cognom pot ocupar màxim 100 caràcteres."),
        body('birth').notEmpty().isDate({ format: 'yyyy-MM-dd' }).withMessage("La data de naixament ha d'estar en format yyyy-MM-dd.")
    ], (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const messages = errors.array().map(error => error.msg);
                return res.status(400).json({ result: -30, data: { message: messages } });
            }

            const { user, pass, name, surname1, surname2 = null, birth } = req.body;

            bcrypt.hash(pass, config.Bycript_Hashing_Cost, function(err, hashedPass) {
                if (err) {
                    console.error('Bcrypt error:', err);
                    return res.status(400).send({ result: -11, data: { message: 'Internal server error' } });
                }

                // Consulta sql afegir usuari
                const sql = `INSERT INTO tblUsers (USR_Email, USR_Password, USR_Role, USR_Name, USR_Surname1, USR_Surname2, USR_BirthDate, USR_Balance, USR_VerificationKey, USR_Verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                // Parametrizació de la consulta
                const values = [
                    user,       // USR_Email
                    hashedPass, // USR_Password
                    'customer', // USR_Role, valor por defecte 
                    name,       // USR_Name
                    surname1,   // USR_Surname1
                    surname2,   // USR_Surname2
                    birth,      // USR_BirthDate
                    0,          // USR_Balance, valor por defecte
                    uuidv4(),   // USR_VerificationKey, de tipus Uuid v4
                    0           // USR_Verified, valor por defecte
                ];

                // Ejecución de la consulta
                dbConnection.query(sql, values, (err, results, fields) => {
                    if (err) { // Control d'errors: fallada de connexió amb la BD
                        console.error('Database error:', err);
                        
                        if (err.code = 'ER_DUP_ENTRY') return res.status(500).json({ result: -21, data: { message: 'Database error' } });
                        return res.status(500).json({ result: -20, data: { message: 'Database error' } });
                    }

                    // Nom de l'arxiu plantilla de mail
                    const templateFileName = 'verificationEmailTemplate.html';
                    const templateFilePath = path.join(config.filePathGeneric, templateFileName);
                    fs.readFile(templateFilePath, 'utf8', (err, data) => {
                        if (err) {
                            console.error('Error en llegir el template de correu', err);
                            return res.status(500).json({ result: -13, data: { message: 'Internal server error' } });
                        }

                        // Canvio els links pels propis de l'usuari

                        const info = transporter.sendMail({
                            from: '"Barra App" <' + config.mailTransporter.auth.user + '>',
                            to: user,
                            subject: "Barra App - Verificació del compte",
                            text: "Enganxa el següent enllaç al navegador per confirmar la teva adreça electrònica per BarraApp: " + config.verifyBaseURL + user + "/" + values[8], // No es mostra
                            html: data.replace(/REPLACE FOR VERIFICATION URL/g, config.verifyBaseURL + user + "/" + values[8] /* UUID */),
                        });
                        // Tractar enviament del correu
                        info.then((resultat) => {
                            console.log('Email enviat correctament: ', resultat);
                            res.status(200).json({ result: 0, data: { message: 'Email enviat correctament' } });
                        })
                        .catch((error) => {
                            console.error('Error al enviar el correo:', error);
                            res.status(500).json({ result: -12, data: { message: 'Error en enviar el correu' } });
                        });
                    });
                });
            });
        } catch (error) {
            console.error('Internal server error:', error);
            return res.status(400).json({ result: -10, data: { message: 'Internal server error' } });
        }
});


/**************************************
 **                                  **
 **        PASSWORD RECOVERY         **
 **                                  **
 **************************************/

/***** GET *****/
publicRouter.get('/reset-password/:user/:key',
    [
        param('user').notEmpty().isEmail().withMessage("L\'usuari ha de ser un e-mail vàlid.")
    ], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const messages = errors.array().map(error => error.msg);
            return res.status(400).json({ result: -30, data: { message: messages } });
        }

        const user = req.params.user;
        //Verifica que el user i la key son vàlids i envia un ok per a que el front envii a canviar el password

    } catch (error) {
        console.error('Internal server error:', error);
        return res.status(400).json({ result: -10, data: { message: 'Internal server error' } });
    }
});

/***** POST *****/
publicRouter.post('/password-recovery/:user',
    [
        param('user').notEmpty().isEmail().withMessage("L\'usuari ha de ser un e-mail vàlid.")
    ], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const messages = errors.array().map(error => error.msg);
            return res.status(400).json({ result: -30, data: { message: messages } });
        }

        const user = req.params.user;

    } catch (error) {
        console.error('Internal server error:', error);
        return res.status(400).json({ result: -10, data: { message: 'Internal server error' } });
    }
});

publicRouter.get('/assets/images/:folder/:file', (req, res) => {
    const filePath = path.join(config.imagesFolder, req.params.folder, req.params.file);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            const defaultFilePath = path.join(config.imagesFolder, 'no-image.png');
            res.sendFile(defaultFilePath);
        } else {
            res.sendFile(filePath);
        }
    });
});

module.exports = publicRouter;
