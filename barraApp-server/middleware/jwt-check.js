const jwt = require('jsonwebtoken');


// Clave secreta para firmar y verificar los tokens
const secretKey = config.jwtKey;

// Middleware para verificar el token
const verificarToken = (req, res, next) => {

  const authorizationHeader = req.headers['authorization'];
  if (!authorizationHeader) {
    res.status(401).json({ error: 'Token no proporcionado' });
  } else {
    if (!authorizationHeader) {
      res.status(401).json({ error: 'Token no proporcionado' });
    } else {
      // Verifica si el encabezado comienza con "Bearer "
      if (authorizationHeader.startsWith('Bearer ')) {
        // Extrae el token quitando "Bearer " del encabezado
        const token = authorizationHeader.slice(7); // Quitamos los primeros 7 caracteres ("Bearer ")

        jwt.verify(token, secretKey, (err, decoded) => {
          if (err) {
            return res.status(401).json({ error: 'Token inválido' });
          }
          // El token es válido, almacenamos la información decodificada en la solicitud
          req.userData = decoded;

          // recoge el rol de usuario
          dbConnection.query('SELECT USR_Role FROM tblUsers WHERE USR_ID=?', [decoded.id], (err, [results, fields]) => {
            if (err) {
              console.error('Database error:', err);
              res.status(500).send({ result: -1, data: { message: 'Database error' } });
              return;
            }
            if (results.length === 0) {
              res.status(401).send({ result: -2, data: { message: 'User unknown' } });
            } else {
              req.userData.role = results.USR_Role;
            }
            // Continuamos con la siguiente función en la cadena de middleware
            next();
          });
        });
      } else {
        res.status(401).json({ error: 'Formato de token incorrecto' });
      }
    }
  }

};

module.exports = {
  verificarToken,
};
