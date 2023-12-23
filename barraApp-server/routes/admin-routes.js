const adminRouter = express.Router();
const { body, validationResult } = require('express-validator');
const { validateFileUpload } = require('../middleware/upload-utils');
const { filePathP, filePathPF, filePathGeneric } = require('../config/config');

const path = require('path');
const fs = require('fs');

const routerRole = 'admin';

adminRouter.get('/recurso-protegido', (req, res) => {
  if (req.userData.role === routerRole) {
    // aqui fem el que toqui
    return res.send({ mensaje: `Acceso permitido para el usuario ${req.userData.email} (${req.userData.id})` });
  } else {
    return res.status(401).json({ result: -1, data: { message: 'Unauthorized route' } });
  }
});

/**************************************
 **                                  **
 **         PRODUCT FAMILIES         **
 **                                  **
 **************************************/

/***** GET *****/

/**
 * Retorna un JSON amb un llistat de totes les families de productes
 * 
 * @route GET /list-product-families/:includeDisabled
 * @group ProductFamilies
 * @param {int} includeDisabled Indica si s'han d'incloure els productes inhabilitats. Passa 1 per cert, 0 per false
 * @returns {SuccessResponse} 200 - Llistat JSON amb una combinació
 * @returns {ErrorResponse} 401 - [-1] Accés no autoritzat
 * @returns {ErrorResponse} 500 - [-10] Error intern del servidor
 * @returns {ErrorResponse} 500 - [-20] Error de la base de dades
 */
adminRouter.get('/list-product-families/:includeDisabled', (req, res) => {
  if (req.userData.role === routerRole) {
    try {
      // 1 si includeDisabled = 1, 0 altrament
      const includeDisabled = parseInt(req.params.includeDisabled) === 1 ? 1 : 0;

      // Crida a la base de dades
      dbConnection.execute('CALL getProductsFamilyByDisabled(?)', [includeDisabled], (err, [results, fields]) => {
        if (err) { // Control d'errors: fallada de connexió amb la BD
          console.error('Database error:', err);
          return res.status(500).json({ result: -20, data: { message: 'Database error' } });
        }

        if (!results || typeof results !== 'object') { //Control d'errors: DB no retorna un JSON
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

/***** POST *****/

/**
 * Afegeix la família de productes amb les dades específicades
 * 
 * @route POST /add-product-family
 * @group ProductFamilies
 * @param {string} name Nom de la família de productes (63 caràcter màxim)
 * @param {string} description Descripció sobre la família de productes (255 caràcters màxim)
 * @param {int} ageLimit Límit d'edat associat a la família de productes
 * @param {File} image Imatge del producte format: [ png, jpg, jpeg, gif ]
 * @returns {SuccessResponse} 201 - Creada correctament, JSON amb id: idFamiliaCreada 
 * @returns {ErrorResponse} 400 - [-30] Error en els paràmetres. Array de "message"
 * @returns {ErrorResponse} 401 - [-1] Accés no autoritzat
 * @returns {ErrorResponse} 500 - [-10] Error intern del servidor
 * @returns {ErrorResponse} 500 - [-11] Error no s'ha pogut afegir la familia a la DB
 * @returns {ErrorResponse} 500 - [-12] Error no s'ha pogut pujar la imatge
 * @returns {ErrorResponse} 500 - [-20] Error de la base de dades
 */
adminRouter.post('/add-product-family',
  [
    body('name').notEmpty().isLength({ max: 63 }).trim().withMessage('El nom és obligatori i de màxim 63 caràcters'),
    body('description').notEmpty().isLength({ max: 255 }).trim().withMessage('La descripció és obligatòria i de màxim 255 caràcters'),
    body('ageLimit').notEmpty().isNumeric().trim().withMessage('El límit d\'edat és obligatori i numèric'),
    validateFileUpload // Middleware de validació de l'arxiu pujat
  ], (req, res) => {
    if (req.userData.role === routerRole) {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          const messages = errors.array().map(error => error.msg);
          return res.status(400).json({ result: -30, data: { message: messages } });
        }

        const { name, description, ageLimit } = req.body;

        dbConnection.execute('CALL addProductFamily(?, ?, ?)', [name, description, ageLimit], async (err, [result, fields]) => {
          if (err) { // Control d'errors: fallada de connexió amb la BD
            console.error('Database error:', err);
            return res.status(500).json({ result: -20, data: { message: 'Database error' } });
          } else {
            const pfId = result[0]?.PF_Id;
            if (pfId) {
              // Guardat de la imatge
              try {
                let imatge = req.files.image;

                fs.mkdirSync(filePathPF, { recursive: true }); // Construeixo el directori si no existeix
                // El nom de l'arxiu és el ID de la família + extensió
                let rutaImatge = path.join(filePathPF, pfId.toString() + '.png');
                imatge.mv(rutaImatge);

              } catch (error) {
                console.error('Internal server error, image file:', error);
                return res.status(500).json({ result: -12, data: { message: 'Error saving image file.' } });
              }

              // Retorn OK
              return res.status(201).json({ result: 0, data: { message: 'Familia de productes afegida correctament', id: pfId } });
            } else {
              console.error('Internal server error (retorn DB = ' + result + '): ', error);
              return res.status(500).json({ result: -11, data: { message: 'Internal server error' } });
            }
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

/**
 * Deshabilita la família de productes amb tal id
 * 
 * @route POST /disable-product-family/:id
 * @group ProductFamilies
 * @param {int} id ID de la família de productes a deshabilitar
 * @returns {SuccessResponse} 200 - Deshabilitada correctament
 * @returns {ErrorResponse} 400 - [-30] Error en els paràmetres
 * @returns {ErrorResponse} 401 - [-1] Accés no autoritzat
 * @returns {ErrorResponse} 500 - [-10] Error intern del servidor
 * @returns {ErrorResponse} 500 - [-20] Error de la base de dades
 */
adminRouter.post('/disable-product-family/:id', (req, res) => {
  if (req.userData.role === routerRole) {
    try {
      const paramID = req.params.id;
      if (!(/^\d+$/.test(paramID))) { //testejo que id és un enter
        return res.status(400).json({ result: -30, data: { message: 'ID no és un enter' } });
      }

      // Crida a la base de dades
      dbConnection.execute('CALL disableProductFamily(?)', [parseInt(paramID)], (err, result) => { //Si el id no existeix no retorna error
        if (err) { // Control d'errors: fallada de connexió amb la BD
          console.error('Database error:', err);
          return res.status(500).json({ result: -20, data: { message: 'Database error' } });
        }
      });
    } catch (error) {
      console.error('Internal server error:', error);
      return res.status(500).json({ result: -10, data: { message: 'Internal server error' } });
    }

    return res.status(200).json({ result: 0, message: 'Familia de productes deshabilitada correctament' });
  } else {
    return res.status(401).json({ result: -1, data: { message: 'Unauthorized route' } });
  }
});

/**
 * Habilita la família de productes amb tal id
 * 
 * @route POST /enable-product-family/:id
 * @group ProductFamilies
 * @param {int} id ID de la família de productes a habilitar
 * @returns {SuccessResponse} 200 - Habilitada correctament
 * @returns {ErrorResponse} 400 - [-30] Error en el paràmetre
 * @returns {ErrorResponse} 401 - [-1] Accés no autoritzat
 * @returns {ErrorResponse} 500 - [-10] Error intern del servidor
 * @returns {ErrorResponse} 500 - [-20] Error de la base de dades
 */
adminRouter.post('/enable-product-family/:id', (req, res) => {
  if (req.userData.role === routerRole) {
    try {
      const paramID = req.params.id;
      if (!(/^\d+$/.test(paramID))) { //testejo que id és un enter
        return res.status(400).json({ result: -30, data: { message: 'ID no és un enter' } });
      }

      // Crida a la base de dades
      dbConnection.execute('CALL enableProductFamily(?)', [parseInt(paramID)], (err, result) => { //Si el id no existeix no retorna error
        if (err) { // Control d'errors: fallada de connexió amb la BD
          console.error('Database error:', err);
          return res.status(500).json({ result: -20, data: { message: 'Database error' } });
        }
      });
    } catch (error) {
      console.error('Internal server error:', error);
      return res.status(500).json({ result: -10, data: { message: 'Internal server error' } });
    }

    return res.status(200).json({ result: 0, data: { message: 'Familia de productes habilitada correctament' } });
  } else {
    return res.status(401).json({ result: -1, data: { message: 'Unauthorized route' } });
  }
});

/**
 * Actualitza els detalls d'una familia de productes amb els passats com a paràmetre.
 * Si no han canviat, es passa el valor sense canvi.
 * Tots els paràmetres són obligatoris excepte la imatge.
 * 
 * @route POST /update-product-family/
 * @group ProductFamilies
 * @param {int} id Id de la família de productes a modificar
 * @param {string} name Nom de la família de productes (màxim 63 caràcters)
 * @param {int} ageLimit Límit d'edat
 * @param {int} disabled 1 = deshabilitat, 0 = habilitat
 * @param {string} description Descripció (màxim 255 caràcters)
 * @param {File} image [Opcional] Nova imatge
 * @returns {SuccessResponse} 200 - Modificat correctament
 * @returns {ErrorResponse} 400 - [-30] Error en els paràmetres. Array de "message"
 * @returns {ErrorResponse} 401 - [-1] Accés no autoritzat
 * @returns {ErrorResponse} 500 - [-10] Error intern del servidor
 * @returns {ErrorResponse} 500 - [-20] Error de la base de dades
 */
adminRouter.post('/update-product-family/',
  [body('id').notEmpty().isNumeric().trim().withMessage('S\'ha de proporcionar un id'),
  body('name').notEmpty().isLength({ max: 63 }).trim().withMessage('El nom és obligatori i de màxim 30 caràcters'),
  body('ageLimit').notEmpty().isNumeric().trim().withMessage('El límit d\'edat és obligatori i numèric'),
  body('disabled').notEmpty().isNumeric().trim().withMessage('S\'ha de proporcionar si el producte és habilitat o deshabilitat'),
  body('description').notEmpty().isLength({ max: 255 }).trim().withMessage('La descripció és obligatòria i de màxim 500 caràcters')
  ], (req, res) => {
    if (req.userData.role === routerRole) {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          const messages = errors.array().map(error => error.msg);
          return res.status(400).json({ result: -30, data: { message: messages } });
        }

        const { id, name, ageLimit, disabled, description } = req.body;

        const jsonModificacions = {
          PF_Name: name,
          PF_AgeLimit: ageLimit,
          PF_Disabled: disabled,
          PF_IdFamily: id,
          PF_Description: description,
        };
        // Crida a la base de dades
        dbConnection.execute('CALL updateProductFamily(?)', [jsonModificacions], (err, result) => {
          if (err) { // Control d'errors: fallada de connexió amb la BD
            console.error('Database error:', err);
            return res.status(500).json({ result: -20, data: { message: 'Database error' } });
          }

          if (result.affectedRows > 0) {
            // Verifiquem si s'ha pujat una imatge a req.files.image

            if (req.files && req.files.image) {
              let imatge = req.files.image;
              const allowedExtensions = /\.(jpg|jpeg|png|gif)$/;

              if (!allowedExtensions.test(imatge.name)) {
                return res.status(400).json({ result: -30, data: { message: ['Format d\'arxiu no vàlid. Només s\'accepta: jpg, jpeg, png o gif.'] } });
              } else {
                // El nom de l'arxiu és el ID de la familia + extensió
                let filename = id.toString() + '.png';
                let rutaImatge = path.join(filePathPF, filename);

                // SOBREESCRIC L'EXISTENT
                fs.mkdirSync(filePathPF, { recursive: true }); // Construeixo el directori si no existeix
                // Obtinc tots els arxius del directori
                fs.readdir(filePathPF, (err, files) => {
                  if (err) {
                    return res.status(500).json({ result: -20, data: { message: 'Cannot find the directory.' } });
                  }

                  // Verifiquem si hi ha algun arixiu amb el mateix nom (però diferent extensió)
                  const existentFile = files.find(file => file.startsWith(id.toString()) && file !== filename);

                  // Si hi ha un arxiu amb igual nom pero diferent extensió l'eliminem
                  if (existentFile) {
                    fs.unlinkSync(path.join(filePathPF, existentFile));
                  }

                  // Movem la imatge a la ruta pertinent
                  imatge.mv(rutaImatge, (err) => {
                    if (err) {
                      return res.status(500).json({ result: -20, data: { message: 'Error en sobreescriure la imatge.' } });
                    }
                  });
                });
              }
            }
          }

          // OK
          return res.status(200).json({ result: 0, data: { message: 'Familia de productes actualitzada correctament' } });
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
 **             PRODUCTS             **
 **                                  **
 **************************************/

/***** GET *****/

/**
* Retorna un JSON amb un llistat de tots els productes que compleixen els requeriments
* enviats com a paràmetre. Si no s'envia res en un paràmetre opcional, no es tindrà en
* compte a l'hora del filtratge
* 
* @route GET /list-products/:includeDisabled
* @group Products
* @param {int} includeDisabled Indica si s'han d'incloure els productes inhabilitats. Passa 1 per cert, 0 per false
* NO IMPLEMENTAT @param {string} name [Opcional] Nom del producte
* NO IMPLEMENTAT @param {int} idProductFamily [Opcional] Id de la familia de productes del producte
* NO IMPLEMENTAT @param {string} description [Opcional] Descripció del producte (cerques de text)
* @returns {SuccessResponse} 200 - Llistat JSON amb una combinació
* @returns {ErrorResponse} 400 - [-30] Error en els paràmetres. Array de "message"
* @returns {ErrorResponse} 401 - [-1] Accés no autoritzat
* @returns {ErrorResponse} 500 - [-10] Error intern del servidor
* @returns {ErrorResponse} 500 - [-20] Error de la base de dades
*/
adminRouter.get('/list-products/:includeDisabled', (req, res) => {
  if (req.userData.role === routerRole) {
    try {
      // 1 si includeDisabled = 1, 0 altrament
      //console.log(req.params.includeDisabled);
      const includeDisabled = parseInt(req.params.includeDisabled) === 1 ? 1 : 0;

      // Crida a la base de dades
      dbConnection.execute('CALL getProductsByDisabled(?)', [includeDisabled], (err, [results, fields]) => {
        if (err) { // Control d'errors: fallada de connexió amb la BD
          console.error('Database error:', err);
          return res.status(500).json({ result: -20, data: { message: 'Database error' } });
        }

        if (!results || typeof results !== 'object') { //Control d'errors: DB no retorna un JSON
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

adminRouter.get('/list-products/:includeDisabled/:familyId', (req, res) => {
  const includeDisabled = parseInt(req.params.includeDisabled) === 1 ? 1 : 0;
  const familyId = parseInt(req.params.familyId);

  let params = [];
  switch (req.userData.role) {
    case 'admin':
      params = [includeDisabled, familyId]
      break;
    case 'customer':
      params = [0, familyId]
      break;
    default: params = [];
  }
  if (params.length) {
    try {
      // 1 si includeDisabled = 1, 0 altrament
      //console.log(req.params.includeDisabled);
      // Crida a la base de dades
      dbConnection.execute('CALL getProductsByDisabledFamily(?,?)', params, (err, [results, fields]) => {
        if (err) { // Control d'errors: fallada de connexió amb la BD
          console.error('Database error:', err);
          return res.status(500).json({ result: -20, data: { message: 'Database error' } });
        }

        if (!results || typeof results !== 'object') { //Control d'errors: DB no retorna un JSON
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

/***** POST *****/

/**
* Afegeix un producte amb les dades específicades
* 
* @route POST /add-product
* @group Products
* @param {int} idProductFamily Id de la familia de productes a la que pertany el producte
* @param {string} name Nom del producte (63 caràcter màxim)
* @param {float} price Preu del producte (es fixa a dos decimals)
* @param {string} description Descripció sobre el producte (255 caràcters màxim)
* @param {float} iva IVA en tant per cent [%] (es fixa a dos decimals)
* @param {File} image Imatge del producte format: [ png, jpg, jpeg, gif ]
* @returns {SuccessResponse} 201 - Creat correctament, JSON amb id: idProducteCreat
* @returns {ErrorResponse} 400 - [-30] Error en els paràmetres. Array de "message"
* @returns {ErrorResponse} 401 - [-1] Accés no autoritzat
* @returns {ErrorResponse} 500 - [-10] Error intern del servidor
* @returns {ErrorResponse} 500 - [-12] Error no s'ha pogut pujar la imatge
* @returns {ErrorResponse} 500 - [-20] Error de la base de dades
* @returns {ErrorResponse} 500 - [-21] No existeix la família de productes
*/
adminRouter.post('/add-product',
  [
    body('idProductFamily').notEmpty().isInt().toInt().withMessage('idProductFamily és obligatori i ha de ser un número enter'),
    body('name').notEmpty().trim().isLength({ max: 63 }).withMessage('El nom és obligatori i de màxim 63 caràcters'),
    body('price').notEmpty().isNumeric().toFloat().withMessage('El preu és obligatori i ha de ser un nombre'),
    body('description').notEmpty().trim().isLength({ max: 255 }).withMessage('La descripció és obligatòria i de màxim 255 caràcters'),
    body('iva').notEmpty().isNumeric().toFloat().withMessage('L\'iva és obligatori i numèric'),
    validateFileUpload // Middleware de validació de l'arxiu pujat
  ], (req, res) => {
    if (req.userData.role === routerRole) {
      try {
        const errors = validationResult(req);
        console.log(errors);
        if (!errors.isEmpty()) {
          const messages = errors.array().map(error => error.msg);
          return res.status(400).json({ result: -30, data: { message: messages } });
        }

        const { idProductFamily, name, price, description, iva } = req.body;

        // Limito el preu i el IVA a 2 decimals
        const fixedPrice = parseFloat(price).toFixed(2);
        const fixedIVA = parseFloat(iva).toFixed(2);

        // Verifico que existeixi la família de productes que se li assigna
        dbConnection.execute('CALL getProductsFamilyById(?)', [idProductFamily], (err, [result, fields]) => {
          if (err) { // Control d'errors: fallada de connexió amb la BD
            console.error('Database error:', err);
            return res.status(500).json({ result: -20, data: { message: 'Database error' } });
          } else {
            if (result && Array.isArray(result) && result.length > 0 && result[0]?.PF_IdFamily > 0) {

              // Afegeixo el producte a la Base de dades 
              dbConnection.execute('CALL addProduct(?, ?, ?, ?, ?)', [idProductFamily, name, fixedPrice, description, fixedIVA], async (err, [result, fields]) => {
                if (err) { // Control d'errors: fallada de connexió amb la BD
                  console.error('Database error:', err);
                  return res.status(500).json({ result: -20, data: { message: 'Database error' } });
                } else {
                  const pId = result[0]?.P_Id;
                  if (pId) {
                    // Guardat de la imatge
                    try {
                      let imatge = req.files.image;

                      fs.mkdirSync(frontendP, { recursive: true }); // Construeixo el directori si no existeix
                      // El nom de l'arxiu és el ID del producte
                      let rutaImatge = path.join(frontendP, pId.toString() + path.extname(imatge.name));
                      imatge.mv(rutaImatge);

                    } catch (error) {
                      console.error('Internal server error, image file:', error);
                      return res.status(500).json({ result: -12, data: { message: 'Error saving image file.' } });
                    }

                    // Retorn OK
                    return res.status(201).json({ result: 0, data: { message: 'Producte afegit correctament', id: pId } });
                  } else {
                    console.error('Internal server error (retorn DB = ' + result + '): ', error);
                    return res.status(500).json({ result: -11, data: { message: 'Internal server error' } });
                  }
                }
              });
            } else {
              return res.status(500).json({ result: -21, data: { message: 'Database error' } });
            }
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


/**
 * Deshabilita el producte amb tal id
 * 
 * @route POST /disable-product/:id
 * @group Products
 * @param {int} id ID del producte a deshabilitar
 * @returns {SuccessResponse} 200 - Deshabilitat correctament
 * @returns {ErrorResponse} 400 - [-30] Error en els paràmetres
 * @returns {ErrorResponse} 401 - [-1] Accés no autoritzat
 * @returns {ErrorResponse} 500 - [-10] Error intern del servidor
 * @returns {ErrorResponse} 500 - [-20] Error de la base de dades
 */
adminRouter.post('/disable-product/:id', (req, res) => {
  if (req.userData.role === routerRole) {
    try {
      const paramID = req.params.id;
      if (!(/^\d+$/.test(paramID))) { //testejo que id és un enter
        return res.status(400).json({ result: -30, data: { message: 'ID no és un enter' } });
      }

      // Crida a la base de dades
      dbConnection.execute('CALL disableProduct(?)', [parseInt(paramID)], (err, result) => { //Si el id no existeix no retorna error
        if (err) { // Control d'errors: fallada de connexió amb la BD
          console.error('Database error:', err);
          return res.status(500).json({ result: -20, data: { message: 'Database error' } });
        }
      });
    } catch (error) {
      console.error('Internal server error:', error);
      return res.status(500).json({ result: -10, data: { message: 'Internal server error' } });
    }

    return res.status(200).json({ result: 0, message: 'Producte deshabilitat correctament' });
  } else {
    return res.status(401).json({ result: -1, data: { message: 'Unauthorized route' } });
  }
});

/**
* Habilita el producte amb tal id
* 
* @route POST /enable-product/:id
* @group Products
* @param {int} id ID del producte a habilitar
* @returns {SuccessResponse} 200 - Habilitat correctament
* @returns {ErrorResponse} 400 - [-30] Error en el paràmetre
* @returns {ErrorResponse} 401 - [-1] Accés no autoritzat
* @returns {ErrorResponse} 500 - [-10] Error intern del servidor
* @returns {ErrorResponse} 500 - [-20] Error de la base de dades
*/
adminRouter.post('/enable-product/:id', (req, res) => {
  if (req.userData.role === routerRole) {
    try {
      const paramID = req.params.id;
      if (!(/^\d+$/.test(paramID))) { //testejo que id és un enter
        return res.status(400).json({ result: -30, data: { message: 'ID no és un enter' } });
      }

      // Crida a la base de dades
      dbConnection.execute('CALL enableProduct(?)', [parseInt(paramID)], (err, result) => { //Si el id no existeix no retorna error
        if (err) { // Control d'errors: fallada de connexió amb la BD
          console.error('Database error:', err);
          return res.status(500).json({ result: -20, data: { message: 'Database error' } });
        }
      });
    } catch (error) {
      console.error('Internal server error:', error);
      return res.status(500).json({ result: -10, data: { message: 'Internal server error' } });
    }

    return res.status(200).json({ result: 0, data: { message: 'Producte habilitat correctament' } });
  } else {
    return res.status(401).json({ result: -1, data: { message: 'Unauthorized route' } });
  }
});

/**
 * Actualitza els detalls d'un producte amb els passats com a paràmetre.
 * Si no han canviat, es passa igualment el valor sense canvi.
 * Tots els paràmetres són obligatoris excepte la imatge.
 * 
 * @route POST /update-product/
 * @group Products
 * @param {id} id ID del producte a modificar
 * @param {int} idProductFamily	id de la família de productes a la que pertany el producte
 * @param {string} name	Nom del producte
 * @param {int} disabled 1 = deshabilitat, 0 = habilitat
 * @param {float} price	Preu del producte
 * @param {string} description  (màxim 255 caràcters)
 * @param {float} iva IVA del producte
 * @param {File} image [Opcional] Nova imatge
 * @returns {SuccessResponse} 200 - Modificat correctament
 * @returns {ErrorResponse} 400 - [-30] Error en els paràmetres. Array de "message"
 * @returns {ErrorResponse} 401 - [-1] Accés no autoritzat
 * @returns {ErrorResponse} 404 - [-11] No existeix la família de productes
 * @returns {ErrorResponse} 500 - [-10] Error intern del servidor
 * @returns {ErrorResponse} 500 - [-20] Error de la base de dades
 * @returns {ErrorResponse} 500 - [-21] Error en llegir el directori on es guarden les imatges
 * @returns {ErrorResponse} 500 - [-22] Error en guardar la imatge
 */
adminRouter.post('/update-product/',
  [body('id').notEmpty().isNumeric().trim().withMessage('S\'ha de proporcionar el id del producte a modificar'),
  body('idProductFamily').notEmpty().isNumeric().trim().withMessage('S\'ha de proporcionar un idProductFamily'),
  body('name').notEmpty().isLength({ max: 63 }).trim().withMessage('El nom és obligatori i de màxim 63 caràcters'),
  body('disabled').notEmpty().isNumeric().trim().withMessage('S\'ha de proporcionar si el producte és habilitat o deshabilitat'),
  body('price').notEmpty().isNumeric().toFloat().withMessage('El preu és obligatori i numèric'),
  body('description').notEmpty().isLength({ max: 255 }).trim().withMessage('La descripció és obligatòria i de màxim 500 caràcters'),
  body('iva').notEmpty().isNumeric().toFloat().withMessage('L\'IVA és obligatori i numèric')
  ], (req, res) => {
    if (req.userData.role === routerRole) {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          const messages = errors.array().map(error => error.msg);
          return res.status(400).json({ result: -30, data: { message: messages } });
        }

        const { id, idProductFamily, name, disabled, price, description, iva } = req.body;
        const fixedPrice = parseFloat(price).toFixed(2);
        const fixedIVA = parseFloat(iva).toFixed(2);

        // Crida a la base de dades
        dbConnection.execute('CALL updateProduct(?,?,?,?,?,?,?)', [id, idProductFamily, name, disabled, fixedPrice, description, fixedIVA], (err, result) => {
          if (err) { // Control d'errors: fallada de connexió amb la BD
            console.error('Database error:', err);
            if (err.code = 'ER_NO_REFERENCED_ROW_2') return res.status(500).json({ result: -11, data: { message: 'No existeix la familia de productes' } });
            return res.status(500).json({ result: -20, data: { message: 'Database error' } });
          }

          if (result.affectedRows > 0) { // En cas que hi hagi hagut modificacions a la DB, verifiquem si s'ha pujat una imatge a req.files.image

            if (req.files && req.files.image) {
              let imatge = req.files.image;
              const allowedExtensions = /\.(jpg|jpeg|png|gif)$/;

              if (!allowedExtensions.test(imatge.name)) {
                return res.status(400).json({ result: -30, data: { message: ['Format d\'arxiu no vàlid. Només s\'accepta: jpg, jpeg, png o gif.'] } });
              } else {
                // El nom de l'arxiu és el ID del producte + extensió
                let filename = id.toString() + '.png';
                let rutaImatge = path.join(filePathP, filename);

                // SOBREESCRIC L'EXISTENT
                fs.mkdirSync(filePathP, { recursive: true }); // Construeixo el directori si no existeix
                // Obtinc tots els arxius del directori
                fs.readdir(filePathP, (err, files) => {
                  if (err) {
                    return res.status(500).json({ result: -21, data: { message: 'Cannot find the directory.' } });
                  }

                  // Verifiquem si hi ha algun arixiu amb el mateix nom (però diferent extensió)
                  const existentFile = files.find(file => file.startsWith(id.toString()) && file !== filename);

                  // Si hi ha un arxiu amb igual nom pero diferent extensió l'eliminem
                  if (existentFile) {
                    fs.unlinkSync(path.join(filePathPF, existentFile));
                  }

                  // Movem la imatge a la ruta pertinent
                  imatge.mv(rutaImatge, (err) => {
                    if (err) {
                      return res.status(500).json({ result: -22, data: { message: 'Error en guardar la imatge.' } });
                    }
                  });
                });
              }
            }
          }

          // OK
          return res.status(200).json({ result: 0, data: { message: 'Producte actualitzat correctament' } });
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
 **              USERS               **
 **                                  **
 **************************************/

/***** GET *****/
/**
 * Retorna un JSON amb un llistat de tots els usuaris
 * 
 * @route GET /list-users
 * @group Users
 * @returns {SuccessResponse} 200 - Llistat JSON
 * @returns {ErrorResponse} 401 - [-1] Accés no autoritzat
 * @returns {ErrorResponse} 500 - [-10] Error intern del servidor
 * @returns {ErrorResponse} 500 - [-20] Error de la base de dades
 */
adminRouter.get('/list-users', (req, res) => {
  if (req.userData.role === routerRole) {
    try {
      // Crida a la base de dades
      dbConnection.query('SELECT USR_Id, USR_Email, USR_Role, USR_Name, USR_Surname1, USR_Surname2, USR_BirthDate, USR_Balance, USR_Verified FROM tblUsers', (err, results) => {
        if (err) { // Control d'errors: fallada de connexió amb la BD
          console.error('Database error:', err);
          return res.status(500).json({ result: -20, data: { message: 'Database error' } });
        }

        if (!results || typeof results !== 'object') { //Control d'errors: DB no retorna un JSON
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

/***** POST *****/

adminRouter.post('/update-user', (req, res) => {
  if (req.userData.role === routerRole) {
    try {
      // const errors = validationResult(req);
      // if (!errors.isEmpty()) {
      //   const messages = errors.array().map(error => error.msg);
      //   return res.status(400).json({ result: -30, data: { message: messages } });
      // }

      const paramID = req.body.id;
      const paramNewBalance = req.body.newBalance;

      // Formatem newBalance a máxim dos decimals o afegim .00 si no en té
      const formattedNewBalance = parseFloat(paramNewBalance).toFixed(2);

      const params = [
        req.body.USR_Email,
        req.body.USR_Role,
        req.body.USR_Name,
        req.body.USR_Surname1,
        req.body.USR_Surname2,
        new Date(req.body.USR_BirthDate),
        req.body.USR_Id
      ]

      dbConnection.query(`Update tblUsers SET USR_Email=?, 
                                                USR_Role=?, 
                                                USR_Name=?, 
                                                USR_Surname1=?, 
                                                USR_Surname2=?, 
                                                USR_BirthDate=? 
                              WHERE USR_Id=?`, params, (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ result: -20, data: { message: 'Database error' } });
        }
        return res.status(200).json({ result: 0, data: { message: 'Usuari actualitzat correctament' } });
      });
    } catch (error) {
      console.error('Internal server error:', error);
      return res.status(500).json({ result: -10, data: { message: 'Internal server error' } });
    }
  } else {
    return res.status(401).json({ result: -1, data: { message: 'Unauthorized route' } });
  }
});


/**
 * Els saldo total de l'usuari (USR_balance) passara a valdre newBalance,
 * independentment del valor que hi hagués anteriorment.
 * 
 * @route POST /update-user-balance
 * @group Users
 * @param {int} id ID de l'usuari
 * @param {float} newBalance Nou saldo de l'usuari
 * @returns {SuccessResponse} 200 - Saldo actualitzat correctament
 * @returns {ErrorResponse} 400 - [-30] Error en els paràmetres. Array de "message"
 * @returns {ErrorResponse} 401 - [-1] Accés no autoritzat
 * @returns {ErrorResponse} 500 - [-10] Error intern del servidor
 * @returns {ErrorResponse} 500 - [-20] Error de la base de dades
 */
adminRouter.post('/update-user-balance',
  [
    body('id').notEmpty().isInt().toInt().withMessage('ID ha de ser un número enter'),
    body('newBalance').notEmpty().isNumeric().toFloat().withMessage('newBalance ha de ser un número')
  ], (req, res) => {
    if (req.userData.role === routerRole) {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          const messages = errors.array().map(error => error.msg);
          return res.status(400).json({ result: -30, data: { message: messages } });
        }

        const paramID = req.body.id;
        const paramNewBalance = req.body.newBalance;

        // Formatem newBalance a máxim dos decimals o afegim .00 si no en té
        const formattedNewBalance = parseFloat(paramNewBalance).toFixed(2);

        dbConnection.execute('CALL updateUserBalance(?,?)', [paramID, formattedNewBalance], (err, result) => { //Si el id no existeix no retorna error
          if (err) { // Control d'errors: fallada de connexió amb la BD
            console.error('Database error:', err);
            return res.status(500).json({ result: -20, data: { message: 'Database error' } });
          }
        });

        return res.status(200).json({ result: 0, data: { message: 'Saldo actualitzat correctament' } });
      } catch (error) {
        console.error('Internal server error:', error);
        return res.status(500).json({ result: -10, data: { message: 'Internal server error' } });
      }
    } else {
      return res.status(401).json({ result: -1, data: { message: 'Unauthorized route' } });
    }
  });

/**
 * Actualitza el rol de l'usuari amb tal id a l'especificat per newRole.
 * 
 * @route POST /update-user-role
 * @group Users
 * @param {int} id ID de l'usuari
 * @param {string} newRole Nou rol de l'usuari [admin, customer, bartender].
 * @returns {SuccessResponse} 200 - Rol actualitzat correctament
 * @returns {ErrorResponse} 400 - [-30] Error en els paràmetres. Array de "message"
 * @returns {ErrorResponse} 401 - [-1] Accés no autoritzat
 * @returns {ErrorResponse} 500 - [-10] Error intern del servidor
 * @returns {ErrorResponse} 500 - [-20] Error de la base de dades
 */
adminRouter.post('/update-user-role',
  [
    body('id').notEmpty().isInt().toInt().withMessage('ID ha de ser un número enter'),
    body('newRole')
      .notEmpty().withMessage('newRole no pot estar buit')
      .isString().withMessage('newRole ha de ser un string')
      .trim().toLowerCase()
  ], (req, res) => {
    if (req.userData.role === routerRole) {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          const messages = errors.array().map(error => error.msg);
          return res.status(400).json({ result: -30, data: { message: messages } });
        }

        const { id, newRole } = req.body;

        if (newRole === 'admin' || newRole === 'customer' || newRole === 'bartender') {
          dbConnection.execute('CALL updateUserRole(?,?)', [id, newRole], (err, result) => { //Si el id no existeix no retorna error
            if (err) { // Control d'errors: fallada de connexió amb la BD
              console.error('Database error:', err);
              return res.status(500).json({ result: -20, data: { message: 'Database error' } });
            }
          });
          return res.status(200).json({ result: 0, data: { message: 'Rol actualitzat correctament' } });
        } else {
          return res.status(400).json({ result: -30, data: { message: ['El valor de newRole no és vàlid'] } });
        }
      } catch (error) {
        console.error('Internal server error:', error);
        return res.status(500).json({ result: -10, data: { message: 'Internal server error' } });
      }
    } else {
      return res.status(401).json({ result: -1, data: { message: 'Unauthorized route' } });
    }
  });

adminRouter.get('/config', (req, res) => {
  let query = null;
  switch (req.userData.role) {
    case 'admin':
      query = `SELECT
        EC_Id,
        EC_Name,
        EC_Description,
        EC_Ubication,
        EC_InitDate,
        EC_EndDate,
        EC_RedsysEnabled,
        EC_PaypalEnabled,
        EC_RedsysUrl,
        EC_RedsysMerchantCode,
        EC_RedsysTerminal,
        EC_RedsysSecretKey,
        EC_RedsysNotificationUrl,
        EC_RedsysReturnUrl,
        EC_RedsysCancelUrl,
        EC_PaypalUrl,
        EC_PaypalClientId,
        EC_PaypalClientSecret,
        EC_PaypalReturnUrl,
        EC_PaypalCancelUrl
      FROM tblEventConfig`
      break;
    case 'customer':
    case 'bartender':
      query = `SELECT
        EC_Id,
        EC_Name,
        EC_Description,
        EC_Ubication,
        EC_InitDate,
        EC_EndDate,
        EC_RedsysEnabled,
        EC_PaypalEnabled
      FROM tblEventConfig`
      break;
    default: query = null;
  }
  if (query) {
    try {
      // Crida a la base de dades
      dbConnection.query(query, (err, results) => {
        if (err) { // Control d'errors: fallada de connexió amb la BD
          console.error('Database error:', err);
          return res.status(500).json({ result: -20, data: { message: 'Database error' } });
        }

        if (!results || typeof results !== 'object') { //Control d'errors: DB no retorna un JSON
          console.error('Unexpected database response:', results);
          return res.status(500).json({ result: -20, data: { message: 'Unexpected database response, expecting JSON' } });
        }

        // Enviar els resultats verificats correctes
        return res.status(200).json({ result: 0, data: results[0] });
      });
    } catch (error) {
      console.error('Internal server error:', error);
      return res.status(500).json({ result: -10, data: { message: 'Internal server error' } });
    }
  } else {
    return res.status(401).json({ result: -1, data: { message: 'Unauthorized route' } });
  }
});

adminRouter.post('/config', (req, res) => {
  if (req.userData.role === routerRole) {
    try {
      const query = `UPDATE tblEventConfig
            SET EC_Name=?,
            EC_Description=?,
            EC_Ubication=?,
            EC_InitDate=?,
            EC_EndDate=?,
            EC_RedsysEnabled=?,
            EC_PaypalEnabled=?,
            EC_RedsysUrl=?,
            EC_RedsysMerchantCode=?,
            EC_RedsysTerminal=?,
            EC_RedsysSecretKey=?,
            EC_RedsysNotificationUrl=?,
            EC_RedsysReturnUrl=?,
            EC_RedsysCancelUrl=?,
            EC_PaypalUrl=?,
            EC_PaypalClientId=?,
            EC_PaypalClientSecret=?,
            EC_PaypalReturnUrl=?,
            EC_PaypalCancelUrl=?
          WHERE EC_Id=?`
      const params = [
        req.body.EC_Name,
        req.body.EC_Description,
        req.body.EC_Ubication,
        new Date(req.body.EC_InitDate),
        new Date(req.body.EC_EndDate),
        req.body.EC_RedsysEnabled,
        req.body.EC_PaypalEnabled,
        req.body.EC_RedsysUrl,
        req.body.EC_RedsysMerchantCode,
        req.body.EC_RedsysTerminal,
        req.body.EC_RedsysSecretKey,
        req.body.EC_RedsysNotificationUrl,
        req.body.EC_RedsysReturnUrl,
        req.body.EC_RedsysCancelUrl,
        req.body.EC_PaypalUrl,
        req.body.EC_PaypalClientId,
        req.body.EC_PaypalClientSecret,
        req.body.EC_PaypalReturnUrl,
        req.body.EC_PaypalCancelUrl,
        req.body.EC_Id
      ]
      // Crida a la base de dades
      dbConnection.query(query, params, (err, results) => {
        if (err) { // Control d'errors: fallada de connexió amb la BD
          console.error('Database error:', err);
          return res.status(500).json({ result: -20, data: { message: 'Database error' } });
        }

        if (!results || typeof results !== 'object') { //Control d'errors: DB no retorna un JSON
          console.error('Unexpected database response:', results);
          return res.status(500).json({ result: -20, data: { message: 'Unexpected database response, expecting JSON' } });
        }

        // Enviar els resultats verificats correctes
        return res.status(200).json({ result: 0 });
      });
    } catch (error) {
      console.error('Internal server error:', error);
      return res.status(500).json({ result: -10, data: { message: 'Internal server error' } });
    }
  } else {
    return res.status(401).json({ result: -1, data: { message: 'Unauthorized route' } });
  }
});

module.exports = adminRouter;
