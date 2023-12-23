const bartenderRouter = express.Router();
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
var validate = require('uuid-validate');

const routerRole = 'bartender';

/**************************************
 **                                  **
 **              COMANDA             **
 **                                  **
 **************************************/

/***** POST *****/

/**
 * Retorna un JSON amb la comanda actual de l'usuari segons el seu id, el id de
 * la comanda i el uuid únic de la comanda.
 * 
 * @route POST /get-order-bartender
 * @group Command
 * @param {int} comId Id de la comanda
 * @param {int} usrId Id de l'usuari que ha fet la comanda
 * @param {string} uuid uuid assignat a la comanda
 * @returns {SuccessResponse} 200 - Llistat JSON amb la comanda completa
 * @returns {ErrorResponse} 400 - [-30] Error en els paràmetres. Array de "message"
 * @returns {ErrorResponse} 400 - [-31] El uuid proporcionat no té el format correcte
 * @returns {ErrorResponse} 401 - [-1] Accés no autoritzat
 * @returns {ErrorResponse} 500 - [-10] Error intern del servidor
 * @returns {ErrorResponse} 500 - [-11] No existeix comanda per usrId, comId i uuid proporcionats
 * @returns {ErrorResponse} 500 - [-20] Error de la base de dades
 */
bartenderRouter.post('/get-order-bartender',
  [
    body('comId').notEmpty().isInt().toInt().withMessage('L\'identificador de comanda és obligatori i ha de ser un número enter'),
    body('usrId').notEmpty().isInt().toInt().withMessage('L\'identificador de l\'usuari és obligatori')
  ], (req, res) => {
    if (req.userData.role === routerRole) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
            const messages = errors.array().map(error => error.msg);
            return res.status(400).json({ result: -30, data: { message: messages } });
            }

            const {comId, usrId, uuid} = req.body;

            if (!validate(uuid, 4)) {
                return res.status(400).json({ result: -31, data: {} });
            }

            dbConnection.execute('CALL getCommandByUuid(?, ?, ?)', [comId, usrId, uuid], (err, [results, fields]) => {
                if (err) { // Control d'errors: fallada de connexió amb la BD
                console.error('Database error:', err);
                return res.status(500).json({ result: -20, data: { message: 'Database error' } });
                }

                if (results && results[0]?.COM_Id > 0) {
                    dbConnection.execute('CALL getCommandById(?)', [comId], (err, [results1, results2, fields]) => {
                        if (err) { // Control d'errors: fallada de connexió amb la BD
                          console.error('Database error:', err);
                          return res.status(500).json({ result: -20, data: { message: 'Database error' } });
                        } else {
                          return res.status(200).json({ result: 0, data: { order: results1[0],
                                                                           lines: results2 } });
                        }
                    });
                } else {
                    return res.status(500).json({ result: -11, data: { message: 'Internal server error' } });
                }
            });
        } catch (error) {
            console.error('Internal server error:', error);
            res.status(500).json({ result: -10, data: { message: 'Internal server error' } });
        }
    } else {
        return res.status(401).json({ result: -1, data: { message: 'Unauthorized route' } });
    }
});

/**
 * Canvia l'estat de la comanda amb tal id de comanda, id d'usuari i uuid a 'entregada'
 * 
 * @route POST /order-delivery-confirmation
 * @group Command
 * @param {int} comId Id de la comanda
 * @param {int} usrId Id de l'usuari que ha fet la comanda
 * @param {string} uuid uuid assignat a la comanda
 * @returns {SuccessResponse} 200 - Llistat JSON amb la comanda completa
 * @returns {ErrorResponse} 400 - [-30] Error en els paràmetres. Array de "message"
 * @returns {ErrorResponse} 400 - [-31] El uuid proporcionat no té el format correcte
 * @returns {ErrorResponse} 401 - [-1] Accés no autoritzat
 * @returns {ErrorResponse} 500 - [-10] Error intern del servidor
 * @returns {ErrorResponse} 500 - [-11] No existeix comanda per usrId, comId i uuid proporcionats
 * @returns {ErrorResponse} 500 - [-20] Error de la base de dades
 * @returns {ErrorResponse} 500 - [-21] La base de dades no ha pogut canviar la comanda a l'estat pagada
 */
bartenderRouter.post('/order-delivery-confirmation',
  [
    body('comId').notEmpty().isInt().toInt().withMessage('L\'identificador de comanda és obligatori i ha de ser un número enter'),
    body('usrId').notEmpty().isInt().toInt().withMessage('L\'identificador de l\'usuari és obligatori')
  ], (req, res) => {
    if (req.userData.role === routerRole) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
            const messages = errors.array().map(error => error.msg);
            return res.status(400).json({ result: -30, data: { message: messages } });
            }

            const {comId, usrId, uuid} = req.body;

            if (!validate(uuid, 4)) {
                return res.status(400).json({ result: -31, data: {} });
            }

            dbConnection.execute('CALL getCommandByUuid(?, ?, ?)', [comId, usrId, uuid], (err, [results, fields]) => {
                if (err) { // Control d'errors: fallada de connexió amb la BD
                console.error('Database error:', err);
                return res.status(500).json({ result: -20, data: { message: 'Database error' } });
                }

                if (results && results[0]?.COM_Id > 0) {
                    dbConnection.execute('CALL updateCommandStatus(?, ?)', [comId, 'entregada'], (err, results) => {
                        // console.log(results);
                        if (err) { // Control d'errors: fallada de connexió amb la BD
                            console.error('Database error:', err);
                            return res.status(500).json({ result: -20, data: { message: 'Database error' } });
                        } else if (results.affectedRows > 0) {
                            return res.status(200).json({ result: 0, data: { message: 'Ok' } });
                        } else {
                            return res.status(500).json({ result: -21, data: { message: 'Database error' } });
                        }
                    });
                } else {
                    return res.status(500).json({ result: -11, data: { message: 'Internal server error' } });
                }
            });
        } catch (error) {
            console.error('Internal server error:', error);
            res.status(500).json({ result: -10, data: { message: 'Internal server error' } });
        }
    } else {
        return res.status(401).json({ result: -1, data: { message: 'Unauthorized route' } });
    }
});


module.exports = bartenderRouter;
