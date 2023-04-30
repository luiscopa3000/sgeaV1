const mysql = require('mysql');
const conexion = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    port: 3306,
    database: 'sgea'
});

conexion.connect((err)=>{
    if(err){
        console.log('Existe un error de conexion: '+err)
    } else{
        console.log('L base de adtos se conecto');
    }
});

module.exports = conexion;