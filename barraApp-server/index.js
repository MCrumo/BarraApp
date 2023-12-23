express = require('express');
config = require('./config/config');
cors = require('cors')

const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
//const path = require('path');


const app = express();
const port = config.port;

// BODY PARSER
app.use(bodyParser.json({limit:'10mb'}));
app.use(bodyParser.urlencoded({ extended: true }));


// CORS
app.use(cors({ origin: true, credentials: true }));

dbConnection = mysql.createConnection(config.mysqlConfig);

dbConnection.connect((err) => {
  if (err) {
    console.error('Database connecion error:', err);
    return;
  }
  console.log(`Connected to database ${config.mysqlConfig.database}`);
  setInterval(() => {
    // console.log('Ping database - ', new Date())
    dbConnection.query('SELECT 1', [], (err, [results, fields]) => {
      if (err) {
        console.error('Database error:', err);
        return;
      }
    });
  }, 60000);
});

const publicRouter = require('./routes/public-routes');
const adminRouter = require('./routes/admin-routes');
const customerRouter = require('./routes/customer-routes');
const bartenderRouter = require('./routes/bartender-routes');
const { verificarToken } = require('./middleware/jwt-check');
//const validateFileUpload = require('./middleware/upload-utils');

app.use(express.json());
app.use(fileUpload());

app.use('/', publicRouter); 
app.use(verificarToken); // Aplica el middleware a todas las rutas debajo de esta linea
app.use('/admin', adminRouter); 
app.use('/customer', customerRouter);
app.use('/bartender', bartenderRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
