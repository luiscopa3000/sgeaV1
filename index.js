require('./config/conexion');
const express = require('express');
const cors = require('cors');

const upload = require('../ApNodeJs/storage/storage')

const port = (process.env.port || 3000);
//Llamamos al express
const app = express();

//Admitir los tipos de datos en formato json
app.use(express.json())
//Configuramos puerto
app.set('port', port);
// Permitir todas las solicitudes CORS en todas las rutas
app.use(cors());
//rutas
app.use('/api', require('./rutas'));

//Iniciar express
app.listen(app.get('port'), (error) => {
    if (error) {
        console.log('Errror al iniciar el servidor: ' + error)
    } else {
        console.log(`Servidor a la escucha de peticiones en 3000`)
    }
});
