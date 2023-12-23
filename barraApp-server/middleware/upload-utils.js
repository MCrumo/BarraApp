// Middleware para validar que la request conté un arxiu image

const { body, validationResult } = require('express-validator');

const validateFileUpload = [
    body('image').custom((value, { req }) => {
      // Verifiquem que s'ha pujat un arxiu
      if (!req.files || Object.keys(req.files).length === 0) {
        throw new Error('L\'arxiu és obligatori.');
      }
  
      // Verifiquem el tipus d'arxiu
      const uploadedFile = req.files.image;
      const allowedExtensions = /\.(jpg|jpeg|png|gif)$/;
  
      if (!allowedExtensions.test(uploadedFile.name)) {
        throw new Error('Format d\'arxiu no vàlid. Només s\'accepta: jpg, jpeg, png o gif.');
      }
  
      return true;
    }),
  ];

  module.exports = {
    validateFileUpload
  };