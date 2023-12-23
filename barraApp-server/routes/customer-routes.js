const customerRouter = express.Router();
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const routerRole = 'customer';
const axios = require("axios");

/**************************************
 **                                  **
 **             PROMESES             **
 **                                  **
 **************************************/
/*const xxx = (params) => {
  return new Promise((resolve, reject) => {
    dbConnection.execute('CALL dbMethod(?)', [params], (err, [results, fields]) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};*/
// Conjunt de trucades a la Base de Dades en forma de promesa per necessitat en el codi

// Obté l'usuari segons el id
const getUserById = (userId) => {
  return new Promise((resolve, reject) => {
    dbConnection.execute('CALL getUserById(?)', [userId], (err, [results, fields]) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const getCommandsByUserStatus = (userId, status) => {
  return new Promise((resolve, reject) => {
    dbConnection.execute('CALL getCommandsByUserStatus(?,?)', [userId, status], (err, [results, fields]) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Obté la comanda segons el id
const getCommandById = (commandId) => {
  return new Promise((resolve, reject) => {
    dbConnection.execute('CALL getCommandById(?)', [commandId], (err, [results1, results2, fields]) => {
      if (err) {
        reject(err);
      } else {
        resolve({ results1, results2 });
      }
    });
  });
};

// Afegeix una comanda
const addCommand = (userId, status, uuid) => {
  return new Promise((resolve, reject) => {
    dbConnection.execute('CALL addCommand(?,?,?)', [userId, status, uuid], (err, [results, fields]) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Afegeix una linea a la comanda
const addCommandLine = (commandId, productId, productPrice, amount, iva) => {
  return new Promise((resolve, reject) => {
    dbConnection.execute('CALL addCommandLine(?,?,?,?,?)', [commandId, productId, productPrice, amount, iva], (err, [results, fields]) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Retorna els productes segons el id proporcionat
const getProductById = (productId) => {
  return new Promise((resolve, reject) => {
    dbConnection.execute('CALL getProductsById(?)', [productId], (err, [results, fields]) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Retorna la família de productes segons el id proporcionat
const getProductsFamilyById = (productFamilyId) => {
  return new Promise((resolve, reject) => {
    dbConnection.execute('CALL getProductsFamilyById(?)', [productFamilyId], (err, [results, fields]) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};


/**************************************
 **                                  **
 **             PRODUCTS             **
 **                                  **
 **************************************/

/***** GET *****/

// TODO: faltaria cambiarlo para que devuelva las familias activas autorizadas para un cliente en concreto

/**
 * Retorna un JSON amb un llistat de totes les families de productes
 * 
 * @route GET /list-product-families
 * @group ProductFamilies
 * @returns {SuccessResponse} 200 - Llistat JSON amb una combinació
 * @returns {ErrorResponse} 401 - [-1] Accés no autoritzat
 * @returns {ErrorResponse} 500 - [-10] Error intern del servidor
 * @returns {ErrorResponse} 500 - [-20] Error de la base de dades
 */
customerRouter.get('/list-product-families', (req, res) => {
  if (req.userData.role === routerRole) {
    try {
      // Crida a la base de dades
      dbConnection.execute('CALL getProductsFamilyByUser(?)', [req.userData.id], (err, [results, fields]) => {
        if (err) { // Control d'errors: fallada de connexió amb la BD
          console.error('Database error:', err);
          res.status(500).json({ result: -20, data: { message: 'Database error' } });
          return;
        }
        if (!results || typeof results !== 'object') { //Control d'errors: DB no retorna un JSON
          console.error('Unexpected database response:', results);
          res.status(500).json({ result: -20, data: { message: 'Unexpected database response, expecting JSON' } });
          return;
        }

        // Enviar els resultats verificats correctes
        res.json({ result: 0, data: results });
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
 * Retorna un JSON amb un llistat de tots els productes habilitats del sistema
 * 
 * @route GET /list-products
 * @group Products
 * @returns {SuccessResponse} 200 - Llistat JSON amb una combinació
 * @returns {ErrorResponse} 400 - [-30] Error en els paràmetres. Array de "message"
 * @returns {ErrorResponse} 401 - [-1] Accés no autoritzat
 * @returns {ErrorResponse} 500 - [-10] Error intern del servidor
 * @returns {ErrorResponse} 500 - [-20] Error de la base de dades
 */
customerRouter.get('/list-products', (req, res) => {
  if (req.userData.role === routerRole) {
    try {
      // Crida a la base de dades
      dbConnection.execute('CALL getProductsByDisabled(?)', [0], (err, [results, fields]) => {
        if (err) { // Control d'errors: fallada de connexió amb la BD
          console.error('Database error:', err);
          return res.status(500).json({ result: -20, data: { message: 'Database error' } });
        }

        if (!results || typeof results !== 'object'){ //Control d'errors: DB no retorna un JSON
          console.error('Unexpected database response:', results);
          return res.status(500).json({ result: -20, data: { message: 'Unexpected database response, expecting JSON' } });
        }

        // Enviar els resultats verificats correctes
        return res.status(200).json({ result: 0, data: results });
      });
    } catch (error) {
      console.error('Internal server error:', error);
      return res.status(500).json({ result: -10, data: { message: 'Internal server error' } });
    }
  } else {
    return res.status(401).json({ result: -1, data: { message: 'Unauthorized route' } });
  }
});

/**************************************
 **                                  **
 **             COMMANDS             **
 **                                  **
 **************************************/

/***** GET *****/

/**
 * Retorna la comanda de l'usuari que està en estat pagada o pendent.
 * 
 * @route GET /current-order
 * @group Commands
 * @returns {SuccessResponse} 200 - [0] JSON amb les linies de comanda de la comanda activa de l'usuari
 * @returns {SuccessResponse} 200 - [1] No hi ha comandes en estat pagada o pendent
 * @returns {ErrorResponse} 400 - [-30] Error en els paràmetres
 * @returns {ErrorResponse} 401 - [-1] Accés no autoritzat
 * @returns {ErrorResponse} 500 - [-10] Error intern del servidor
 * @returns {ErrorResponse} 500 - [-11] L'usuari té més d'una comanda en estat pagada o pendent
 * @returns {ErrorResponse} 500 - [-20] Error de la base de dades
 */

/* CODI SENSE PROMESES

customerRouter.get('/current-order', (req, res) => {
  if (req.userData.role === routerRole) {
    try {
      let id_command = [];

      // AGAFO TOTES LES COMANDES AMB ESTAT "PAGADA"
      dbConnection.execute('CALL getCommandsByUserStatus(?,?)', [req.userData.id, 'pagada'], (err, [results, fields]) => {
        if (err) { // Control d'errors: fallada de connexió amb la BD
          console.error('Database error:', err);
          return res.status(500).json({ result: -20, data: { message: 'Database error' } });
        }

        if (results && results.length > 0) {
          id_command.push(...results.map(result => result.COM_Id));
        }

        // AGAFO TOTES LES COMANDES AMB ESTAT "PENDENT"
        dbConnection.execute('CALL getCommandsByUserStatus(?,?)', [req.userData.id, 'pendent'], (err, [results, fields]) => {
          if (err) { // Control d'errors: fallada de connexió amb la BD
            console.error('Database error:', err);
            return res.status(500).json({ result: -20, data: { message: 'Database error' } });
          }

          if (results && results.length > 0) {
            id_command.push(...results.map(result => result.COM_Id));
          }

          // VERIFICO QUE NO HI HA MÉS D'UNA COMANDA EN ESTAT PENDENT O PAGADA PER AQUEST USUARI
          if (id_command.length > 1) {
            return res.status(500).json({ result: -11, data: { message: 'Internal server error' } });
          } else if (id_command.length === 0) {
            return res.status(200).json({ result: 1, data: {}}); // No hi ha comandes en estat pendents o pagades per l'usuari
          }
          
          // retorno la comanda i les seves respectives linies de comanda
          dbConnection.execute('CALL getCommandById(?)', [id_command[0]], (err, [results1, results2, fields]) => {
            if (err) { // Control d'errors: fallada de connexió amb la BD
              console.error('Database error:', err);
              return res.status(500).json({ result: -20, data: { message: 'Database error' } });
            }
            
            res.status(200).json({ result: 0, data: {order: results1,
                                                     lines: results2 }});
          });
        });
      });
    } catch (error) {
      console.error('Internal server error:', error);
      res.status(500).json({ result: -1, data: { message: 'Internal server error' } });
    }
  } else {
    return res.status(401).json({ error: 'Unauthorized route' });
  }
});*/

customerRouter.get('/current-order', async (req, res) => {
  if (req.userData.role === routerRole) {
    try {
      let id_command = [];

      // AGAFO TOTES LES COMANDES AMB ESTAT "PAGAT"
      const pagadaResults = await getCommandsByUserStatus(req.userData.id, 'pagada');
      if (pagadaResults && pagadaResults.length > 0) {
        id_command.push(...pagadaResults.map(result => result.COM_Id));
      }

      // AGAFO TOTES LES COMANDES AMB ESTAT "PENDENT"
      const pendentResults = await getCommandsByUserStatus(req.userData.id, 'pendent');
      if (pendentResults && pendentResults.length > 0) {
        id_command.push(...pendentResults.map(result => result.COM_Id));
      }

      if (id_command.length > 1) {
        return res.status(500).json({ result: -11, data: { message: 'Internal server error' } });
      } else if (id_command.length === 0) {
        return res.status(200).json({ result: 1, data: {} });
      }

      const { results1, results2 } = await getCommandById(id_command[0]);
      return res.status(200).json({ result: 0, data: { order: results1[0], lines: results2 } });
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({ result: -20, data: { message: 'Database error' } });
    }
  } else {
    return res.status(401).json({ result: -1, data: { message: 'Unauthorized route' } });
  }
});

/**************************************
 **                                  **
 **        PAYMENT PLATFORMS         **
 **                                  **
 **************************************/
 customerRouter.post('/pay', (req, res) => {
  if (req.userData.role === routerRole) {
    const orderId = req.body.orderId;
    const platform = req.body.platform;
    let body = {
      orderId
    }
    axios.post(`${config.payments[platform].url}/${platform}/pay`, body, {
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${result}`
      }
    }).then(({ data: response }) => {
      res.send(response);
    }).catch((error) => {
      console.error(`(${new Date()})Error ${config.payments[platform].url}/${platform}/pay: `, error);
      res.send({ result: -4, data: { message: 'Order creation error' } });
    });
  } else {
    return res.status(401).json({ result: -10, data:{error: 'Unauthorized route' }});
  }
});

customerRouter.post('/payment-check', (req, res) => {
  if (req.userData.role === routerRole) {
    const body = req.body.data;
    const platform = req.body.platform;
    axios.post(`${config.payments[platform].url}/${platform}/payment-check`, body, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(({ data: response }) => {
      res.send(response);
    }).catch((error) => {
      console.error(`(${new Date()})Error ${config.payments[platform].url}/${platform}/pay: `, error);
      res.send({ result: -4, data: { message: 'Order capture error' } });
    });
  } else {
    return res.status(401).json({ result: -10, data:{error: 'Unauthorized route' }});
  }
});


/**
 * Retorna la comanda de l'usuari actual amb valor orderId
 * 
 * @route GET /order/:orderId
 * @group Commands
 * @param {int} orderId Comanda de l'usuari actual amb valor orderId
 * @returns {SuccessResponse} 200 - JSON amb les linies de comanda de la comanda de l'usuari amb tal orderId
 * @returns {ErrorResponse} 400 - [-30] orderId no és un enter
 * @returns {ErrorResponse} 401 - [-1] Accés no autoritzat
 * @returns {ErrorResponse} 403 - [-11] Accés prohibit (la comanda no és de l'usuari autenticat)
 * @returns {ErrorResponse} 500 - [-10] Error intern del servidor
 * @returns {ErrorResponse} 500 - [-20] Error de la base de dades
 */
customerRouter.get('/order/:orderId', (req, res) => {
  if (req.userData.role === routerRole) {
    /****
     * VERIFICAR QUE LA COMANDA AMB VALOR orderId ÉS DE L'USUARI ACTUAL!!!!!
     */
    try {
      const paramOrderId = req.params.orderId;
      if (!(/^\d+$/.test(paramOrderId))) { //testejo que orderId és un enter
        return res.status(400).json({ result: -30, data: { message: 'orderId no és un enter' } });
      }

      dbConnection.execute('CALL getCommandById(?)', [paramOrderId], (err, [results1, results2, fields]) => {
        if (err) { // Control d'errors: fallada de connexió amb la BD
          console.error('Database error:', err);
          res.status(500).json({ result: -20, data: { message: 'Database error' } });
          return;
        }
        
        if (results1[0].COM_IdUser === req.userData.id) { // Verifico que la comanda és de l'usuari
          res.status(200).json({ result: 0, data: {order: results1,
                                                   lines: results2 }});
        } else {
          res.status(403).json({ result: -11, data: { message: 'Access forbidden'}})
        }
      });
    } catch (error) {
      console.error('Internal server error:', error);
      return res.status(500).json({ result: -10, data: { message: 'Internal server error' } });
    }
  } else {
    return res.status(401).json({ result: -1, data: { message: 'Unauthorized route' } });
  }
});

/***** POST *****/


/**************************************
 **                                  **
 **          COMMAND LINES           **
 **                                  **
 **************************************/

/***** GET *****/


/***** POST *****/

/**
 * Afegeix una linea de comanda nova amb el producte i la quantitat.
 * Si no hi ha una comanda la crea. Si hi ha una comanda pagada retorna error.
 * 
 * @route POST /add-new-line
 * @group CommandLines
 * @param {int} idProduct Id del producte a afegir
 * @param {int} amount Quantitat del producte a afegir
 * @returns {SuccessResponse} 200 - [0] JSON amb les linies de comanda de la comanda activa de l'usuari
 * @returns {SuccessResponse} 200 - [1] No hi ha comandes en estat pagada o pendent
 * @returns {ErrorResponse} 400 - [-30] Error en els paràmetres
 * @returns {ErrorResponse} 401 - [-1] Accés no autoritzat
 * @returns {ErrorResponse} 500 - [-10] Error intern del servidor
 * @returns {ErrorResponse} 500 - [-11] L'usuari té més d'una comanda en estat pendent
 * @returns {ErrorResponse} 500 - [-12] L'usuari té alguna comanda en estat pagat
 * @returns {ErrorResponse} 500 - [-13] No existeix el producte amb tal idProduct
 * @returns {ErrorResponse} 500 - [-14] L'usuari no té edat per consumir el producte NO IMPLEMENTAT
 * @returns {ErrorResponse} 500 - [-20] Error de la base de dades
 * @returns {ErrorResponse} 500 - [-21] No s'ha pogut crear correctament la nova Comanda
 */
customerRouter.post('/add-new-line',
  [
    body('idProduct').notEmpty().isInt().toInt().withMessage('L\'identificador del producte és obligatori i ha de ser un número enter'),
    body('amount').notEmpty().isInt().toInt().withMessage('La quantitat és obligatoria i ha de ser un número enter')
  ], async (req, res) => {
  if (req.userData.role === routerRole) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const messages = errors.array().map(error => error.msg);
        return res.status(400).json({ result: -30, data: { message: messages } });
      }

      const { idProduct, amount } = req.body;
      const userId = req.userData.id;
      
      // SI EXISTEIX UNA COMANDA AMB ESTAT "PAGAT" RETORNO ERROR
      const pagadaResults = await getCommandsByUserStatus(userId, 'pagada');
      if (pagadaResults && pagadaResults.length > 0) {
        return res.status(400).json({ result: -12, data: { message: 'Internal server error' } });
      }
      
      // AGAFO TOTES LES COMANDES AMB ESTAT "PENDENT" (en principi només una)
      let idCommand = [];
      const pendentResults = await getCommandsByUserStatus(userId, 'pendent');
      if (pendentResults && pendentResults.length > 0 && pagadaResults.length === 0) {
        idCommand.push(...pendentResults.map(result => result.COM_Id));
      }

      if (idCommand.length > 1) { // Si hi ha més d'una comanda error
        return res.status(500).json({ result: -11, data: { message: 'Internal server error' } });
      } else if (idCommand.length === 0) { // Si no hi ha cap comanda la creo
        const comId = await addCommand(userId, 'pendent', uuidv4()); // GENERO UNA COMANDA AMB UN UUID ÚNIC
        idCommand.push(comId[0]?.COM_Id ?? -1);
      }

      if (idCommand[0] === -1) {
        return res.status(500).json({ result: -21, data: { message: 'Database error' } });
      }

      //const userDetails = await getUserById(userId);
      const productDetails = await getProductById(idProduct);
      //if (productDetails[0].P_) {
        if (productDetails.length !== 0) {
          // EL PRODUCTE QUE S'HA D'INSERIR HA DE SER DE L'EDAT PERMESA
          const result = await addCommandLine(idCommand[0], productDetails[0]?.P_Id, productDetails[0]?.P_Price, amount, productDetails[0]?.P_IVA);
          if (result) {
            const { results1, results2 } = await getCommandById(idCommand[0]);
            return res.status(200).json({ result: 0, data: { order: results1[0], lines: results2 } });
          }
        } else {
          return res.status(500).json({ result: -13, data: { message: 'Internal server error' } });
        }
      /*} else {
        return res.status(500).json({ result: -14, data: { message: 'Internal server error' } });
      }*/
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({ result: -20, data: { message: 'Database error' } });
    }
  } else {
    return res.status(401).json({ result: -1, data: { message: 'Unauthorized route' } });
  }
});

/**
 * Modifica la quantitat de producte d'una línia de comanda. Si amount = 0 l'elimina.
 * 
 * @route POST /update-line
 * @group CommandLines
 * @param {int} orderId Id de la comanda
 * @param {int} lineId Id de la línia de comanda
 * @param {int} amount Nova quantitat del producte (no pot ser major que 100)
 * @returns {SuccessResponse} 200 - [0] JSON amb la comanda completa de l'usuari
 * @returns {ErrorResponse} 400 - [-30] Error en els paràmetres
 * @returns {ErrorResponse} 401 - [-1] Accés no autoritzat
 * @returns {ErrorResponse} 400 - [-10] Error intern del servidor
 * @returns {ErrorResponse} 400 - [-11] No hi ha cap comanda pendent per modificar
 * @returns {ErrorResponse} 400 - [-12] Hi ha més d'una comanda en estat pendent
 * @returns {ErrorResponse} 400 - [-13] No concorda el orderId amb el id de la comanda pendent de l'usuari
 * @returns {ErrorResponse} 400 - [-14] No existeix cap línia de comanda amb tal lineId
 * @returns {ErrorResponse} 400 - [-15] La línia de comanda no pertany a la comanda en estat pendent de l'usuari
 * @returns {ErrorResponse} 500 - [-20] Error de la base de dades
 * POSSIBLEMENT MÉS
 */
customerRouter.post('/update-line',
[
  body('orderId').notEmpty().isInt().toInt().withMessage('L\'identificador del la comanda és obligatori i ha de ser un número enter'),
  body('lineId').notEmpty().isInt().toInt().withMessage('L\'identificador del la línia de comanda és obligatori i ha de ser un número enter'),
  body('amount').notEmpty().isInt().toInt().withMessage('La quantitat és obligatoria i ha de ser un número enter')
                .custom((value) => {
                  if (value > 100) {
                    throw new Error('La quantitat no pot ser major que 100');
                  }
                  return true;
                })
], (req, res) => {
  if (req.userData.role === routerRole) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const messages = errors.array().map(error => error.msg);
        return res.status(400).json({ result: -30, data: { message: messages } });
      }

      const { orderId, lineId, amount } = req.body;
      const userId = req.userData.id;

      /**
       * ·agafo la comanda pendent de l'usuari i verifico que és la que em passen per paràmetre
       *  ·agafo la linia de comanda i verifico que pertany a la comanda
       *    ·modifico la quantitat // si ammount és 0 l'elimina
       *      ·retorno estat final
       */
      // Obtenim les comandes en estat pendent
      dbConnection.execute('CALL getCommandsByUserStatus(?, ?)', [req.userData.id, 'pendent'], (err, [result, fields]) => {
        let idCommand = [];
        if (err) { // Control d'errors: fallada de connexió amb la BD
          console.error('Database error:', err);
          return res.status(500).json({ result: -20, data: { message: 'Database error' } });
        } else {
          if (result && result.length > 0) {
            idCommand.push(...result.map(result => result.COM_Id));
          } else { // No hi ha cap comanda en estat pendent per modificar
            return res.status(400).json({ result: -11, data: { message: 'Internal server error' } });
          }
    
          if (idCommand.length > 1) { // Si hi ha més d'una comanda error
            return res.status(400).json({ result: -12, data: { message: 'Internal server error' } });
          }

          if (idCommand[0] === orderId) { // Verifico que la comanda en estat pendent de l'usuari és la passada com a paràmetre
            dbConnection.execute('CALL getCommandLineByIdCommandLine(?)', [lineId], (err, [result, fields]) => {
              if (err) { // Control d'errors: fallada de connexió amb la BD
                console.error('Database error:', err);
                return res.status(500).json({ result: -20, data: { message: 'Database error' } });
              } else if (!result[0]){ // No existeix cap línia de comanda amb tal lineId
                return res.status(400).json({ result: -14, data: { message: 'Internal server error' } });
              }
              else {
                if (result[0]?.CL_IdCommand === orderId) {
                  dbConnection.execute('CALL updateCommandLineAmount(?, ?)', [lineId, amount], (err, result) => {
                    if (err) { // Control d'errors: fallada de connexió amb la BD
                      console.error('Database error:', err);
                      return res.status(500).json({ result: -20, data: { message: 'Database error' } });
                    }
                    
                    else {
                      dbConnection.execute('CALL getCommandById(?)', [orderId], (err, [results1, results2, fields]) => {
                        if (err) { // Control d'errors: fallada de connexió amb la BD
                          console.error('Database error:', err);
                          return res.status(500).json({ result: -20, data: { message: 'Database error' } });
                        } else {
                          return res.status(200).json({ result: 0, data: { order: results1[0],
                                                                           lines: results2 } });
                        }
                      });
                    }
                  });
                } else { // La línia de comanda no pertany a la comanda en estat pendent de l'usuari
                  return res.status(400).json({ result: -15, data: { message: 'Internal server error' } });
                }
              }
            });
          } else {// No concorda el id de comanda passat com a paràmetre amb el id de la comanda pendent de l'usuari
            return res.status(400).json({ result: -13, data: { message: 'Internal server error' } });
          }
        }
      });

    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({ result: -20, data: { message: 'Database error' } });
    }
  } else {
    return res.status(401).json({ result: -1, data: { message: 'Unauthorized route' } });
  }

});

module.exports = customerRouter;
