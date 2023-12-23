const path = require('path');

module.exports = {
    port: 8082,
    mysqlConfig: {
        host: 'barraapp.eu',
        user: 'barraapp',
        password: 'ji71FoLC04!',
        database: 'BarraApp',
        port: 3306,
        decimalNumbers: true
    },
    jwtKey: 'e9a641a2cf858012112f46f2b9143fb8b42e59e7abb72e60c94c3e300f755ae8',
    payments: {
        redsys: {
            url: 'http://localhost:8013'
        },
        paypal: {
            url: 'http://localhost:8012'
        }
    },
    mailTransporter: {
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'barra.app.pti@gmail.com',
            pass: ''
        }
    },

    verifyBaseURL: 'https://barraapp.eu/email-verification/',

    Bycript_Hashing_Cost: 5, //Cost de hashing de contrasenyes amb Bcrypt

    filePathGeneric: path.join(__dirname, '..', 'assets', 'images', 'generic'),
    imagesFolder: path.join(__dirname, '..', 'assets', 'images'),
    filePathPF: path.join(__dirname, '..', 'assets', 'images', 'family'),
    filePathP: path.join(__dirname, '..', 'assets', 'images', 'product')
};