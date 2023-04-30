const router = require('express').Router();
const conexion = require('./config/conexion')
const multer = require('multer');
const upload = require('./storage/storage');
const jwt = require('jsonwebtoken');
const generateToken = require('./auth');
const bcrypt = require('bcrypt');
const path = require('path');

const bodyParser = require('body-parser');
const fs = require('fs');
//Asignamos todas las rutas
//---------Agregamos las rutas---------
// get usuarios
router.get('/', (req, res) => {
    let sql = 'select * from usuario'
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)
        }
    })
})

//Registrar Usuario
router.post('/registro', (req, res) => {
    const { ci, nombre, apellido, tituloProf, telefono, correo, pass, nacionalidad, foto } = req.body;

    // Consultar si ya existe un usuario con el número de cédula proporcionado
    let sql = `SELECT * FROM usuario WHERE ci = '${ci}'`;
    conexion.query(sql, (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Error del servidor' });
            return;
        }

        if (rows.length > 0) {
            // Si ya existe un usuario con el número de cédula proporcionado, enviar una respuesta con error
            res.status(400).json({ error: 'Ya existe un usuario con este número de cédula' });
            return;
        }

        // Si no existe un usuario con el número de cédula proporcionado, insertar el nuevo usuario
        sql = `INSERT INTO usuario(ci, nombre, apellido, tituloProf, telefono, correo, pass, nacionalidad, foto) VALUES('${ci}', '${nombre}', '${apellido}', '${tituloProf}', '${telefono}', '${correo}', '${pass}', '${nacionalidad}', '${foto}')`;
        conexion.query(sql, (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Error del servidor' });
                return;
            }

            res.json({ status: 'Usuario agregado exitosamente' });
        });
    });
});

//Registrar administrador
router.post('/addAdmin', (req, res) => {
    const { userAdm, Usuario_ci } = req.body
    let sql = `insert into administrador(userAdm, Usuario_ci) values('${userAdm}', '${Usuario_ci}')`
    conexion.query(sql, (err, rows, field) => {
        if (err) throw err;
        else {
            res.json({ status: 'administrador agregado' })
        }
    })
})
//Registrar realcion de administrador "administra" con evento
router.post('/addRelAdmin', (req, res) => {
    const { observacionAdm, Administrador_userAdm, Evento_idEvento } = req.body
    let sql = `insert into administra( observacionAdm, Administrador_userAdm, Evento_idEvento ) values('${observacionAdm}', '${Administrador_userAdm}', '${Evento_idEvento}')`
    conexion.query(sql, (err, rows, field) => {
        if (err) throw err;
        else {
            res.json({ status: 'relacion administra agregado' })
        }
    })
})

//Registra evento
router.post('/addEvent', (req, res) => {
    const { idEvento, nomEv, descEv, tipoEv, fechaIni, fechaFin, horaIni, horaFin, portada, direccionEv } = req.body
    let sql = `insert into evento( idEvento, nomEv, descEv, tipoEv, fechaIni, fechaFin, horaIni, horaFin, portada, direccionEv ) values( '${idEvento}', '${nomEv}', '${descEv}', '${tipoEv}', '${fechaIni}', '${fechaFin}', '${horaIni}', '${horaFin}', '${portada}', '${direccionEv}')`
    conexion.query(sql, (err, rows, field) => {
        if (err) throw err;
        else {
            res.json({ status: 'Evento agregado' })
        }
    })
})
//Registrar actividad
router.post('/addActividad', (req, res) => {
    const { idActividad, nomAct, horaAct, fechaAct, desAct, Evento_idEvento } = req.body
    let sql = `insert into actividad( idActividad, nomAct, horaAct, fechaAct, desAct, Evento_idEvento ) values( '${idActividad}', '${nomAct}', '${horaAct}', '${fechaAct}', '${desAct}', '${Evento_idEvento}' )`
    conexion.query(sql, (err, rows, field) => {
        if (err) throw err;
        else {
            res.json({ status: 'actividad agregado' })
        }
    })
})
//Registrar expositor
router.post('/addExpositor', (req, res) => {
    const { userExpo, DescExpo, Usuario_ci } = req.body
    let sql = `insert into expositor( userExpo, DescExpo, Usuario_ci ) values( '${userExpo}', '${DescExpo}', '${Usuario_ci}' )`
    conexion.query(sql, (err, rows, field) => {
        if (err) throw err;
        else {
            res.json({ status: 'expositor agregado' })
        }
    })
})
//Registrar relacion activadad expositor
router.post('/addRelacionExpoAct', (req, res) => {
    const { horaExp, Expositor_userExpo, Actividad_idActividad } = req.body
    let sql = `insert into expone( horaExp, Expositor_userExpo, Actividad_idActividad ) values( '${horaExp}', '${Expositor_userExpo}', '${Actividad_idActividad}' )`
    conexion.query(sql, (err, rows, field) => {
        if (err) throw err;
        else {
            res.json({ status: 'relacion expositor actividad agregado' })
        }
    })
})
//Registra un comentario
router.post('/addComentario', (req, res) => {
    const { horaCom, fechaCom, comentario, Participante_userPart, Evento_idEvento } = req.body
    let sql = `insert into comenta( horaCom, fechaCom, comentario, Participante_userPart, Evento_idEvento ) values( '${horaCom}', '${fechaCom}', '${comentario}', '${Participante_userPart}', '${Evento_idEvento}' )`
    conexion.query(sql, (err, rows, field) => {
        if (err) throw err;
        else {
            res.json({ status: 'relacion comenta actividad agregado' })
        }
    })
})
//Esto sirve para subir un archivo al servidor
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './repositorio/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const upload2 = multer({ storage: storage })
router.post('/nuevo-archivo', upload2.single('archivo'), (req, res) => {
    const fileName = req.file.filename;
    //devuelve el nombre del archivo al cliente
    res.send(`${fileName}`);
});


//***************************DESDE AQUI SON LAS RUTAS PARA PETICIONES GET */
//obtener adminitrador
router.get('/admin/:Usuario_ci', (req, res) => {
    const { Usuario_ci } = req.params
    let sql = 'select * from administrador where Usuario_ci = ?'
    conexion.query(sql, [Usuario_ci], (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)
        }
    })
})
//obtener participante
router.get('/participante/:Usuario_ci', (req, res) => {
    const { Usuario_ci } = req.params
    let sql = 'select * from participante where Usuario_ci = ?'
    conexion.query(sql, [Usuario_ci], (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)
        }
    })
})
//obtener relacion "Administra" de administrador y evento
router.get('/administra/:Administrador_userAdm', (req, res) => {
    const { Administrador_userAdm } = req.params
    let sql = 'select * from administra where Administrador_userAdm = ?'
    conexion.query(sql, [Administrador_userAdm], (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)
        }
    })
})

//Obtener evento
router.get('/evento/:idEvento', (req, res) => {
    const { idEvento } = req.params
    let sql = 'select * from evento where idEvento = ?'
    conexion.query(sql, [idEvento], (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)
        }
    })
})
//Obtiene las tablas de eventos que administra el administrador 
router.get('/eventosAdmin/:usuario_ci', (req, res) => {
    const { usuario_ci } = req.params;

    const query = `
      SELECT e.idEvento, e.nomEv, e.descEv, e.tipoEv, e.fechaIni, e.fechaFin, e.horaIni, e.horaFin, e.portada, e.direccionEv
      FROM evento e
      INNER JOIN administra a ON e.idEvento = a.Evento_idEvento
      INNER JOIN administrador adm ON a.Administrador_userAdm = adm.userAdm
      WHERE adm.Usuario_ci = ?
    `;

    conexion.query(query, [usuario_ci], (err, rows, fields) => {
        if (err) throw err;
        res.json(rows);
    });
});

//Obtiene la lista de actividades y sus expositores
router.get('/actividades/:idEvento', (req, res) => {
    const idEvento = req.params.idEvento;
    const sql = `SELECT a.idActividad, a.nomAct, a.horaAct, a.fechaAct, a.desAct, e.userExpo, e.DescExpo, u.nombre, u.apellido, u.tituloProf, u.telefono, u.correo, u.nacionalidad, u.foto 
                 FROM actividad a 
                 INNER JOIN expone ex ON a.idActividad = ex.Actividad_idActividad 
                 INNER JOIN expositor e ON ex.Expositor_userExpo = e.userExpo 
                 INNER JOIN usuario u ON e.Usuario_ci = u.ci
                 WHERE a.Evento_idEvento = ${idEvento}`;
    conexion.query(sql, (err, rows, fields) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.json(rows);
        }
    });
});
//Obtiene los eventos a los que esta inscrito un participante
router.get('/eventosInscrito/:usuario_ci', (req, res) => {
    const usuario_ci = req.params.usuario_ci;
    let sql = `SELECT e.idEvento, e.nomEv, e.descEv, e.tipoEv, e.fechaIni, e.fechaFin, e.horaIni, e.horaFin, e.portada, e.direccionEv 
               FROM evento e 
               INNER JOIN inscribe i ON e.idEvento = i.Evento_idEvento
               INNER JOIN participante p ON i.Participante_userPart = p.userPart
               WHERE p.Usuario_ci = ${usuario_ci}`;
    conexion.query(sql, (err, rows, field) => {
        if (err) throw err;
        else {
            res.json(rows);
        }
    });
});



//Esto me devuelve la actividad de id: idActividad mas su expositor
router.get('/ActUnionExpo/:idActividad', (req, res) => {
    const { idActividad } = req.params;
    const query = `SELECT actividad.*, expositor.*, usuario.*
                   FROM actividad
                   INNER JOIN expone ON actividad.idActividad = expone.Actividad_idActividad
                   INNER JOIN expositor ON expone.Expositor_userExpo = expositor.userExpo
                   INNER JOIN usuario ON expositor.Usuario_ci = usuario.ci
                   WHERE actividad.idActividad = ?`;
    conexion.query(query, [idActividad], (error, results) => {
        if (error) throw error;
        res.json(results[0]);
    });
});
//Esto me devuelve los usuarios que son expositores
router.get('/usuariosExpositores', (req, res) => {
    const query = `SELECT usuario.*, expositor.*
                   FROM usuario
                   INNER JOIN expositor ON usuario.ci = expositor.Usuario_ci`;
    conexion.query(query, (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});

//Esto me devuelve un expositor por su userExpo
router.get('/unExpositor/:userExpo', (req, res) => {
    const { userExpo } = req.params;
    const query = `SELECT usuario.*, expositor.*
                   FROM usuario
                   INNER JOIN expositor ON usuario.ci = expositor.Usuario_ci
                   WHERE expositor.userExpo = ?`;
    conexion.query(query, [userExpo], (error, results) => {
        if (error) throw error;
        res.json(results[0]);
    });
});
//Me devuelve todos los comentarios de un evento
router.get('/comentarios/:idEvento', (req, res) => {
    const { idEvento } = req.params;
    const query = `SELECT comenta.*, participante.*, usuario.*
                   FROM comenta
                   INNER JOIN participante ON comenta.Participante_userPart = participante.userPart
                   INNER JOIN usuario ON participante.Usuario_ci = usuario.ci
                   WHERE comenta.Evento_idEvento = ?
                   ORDER BY comenta.fechaCom DESC`; // ordenamos los resultados por fecha de comentario de más reciente a más antiguo
    conexion.query(query, [idEvento], (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});

//Obtiene todos los eventos en los que un usuario no participa 
router.get('/eventos-sin-inscripcion/:ci', (req, res) => {
    const { ci } = req.params;
    const query = `SELECT e.*
                   FROM evento e
                   WHERE e.idEvento NOT IN (
                     SELECT i.Evento_idEvento
                     FROM inscribe i
                     WHERE i.Participante_userPart IN (
                       SELECT p.userPart
                       FROM participante p
                       WHERE p.Usuario_ci = ?
                     )
                   )`;
    conexion.query(query, [ci], (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});
//Devuelve el archivo de nombre x
router.get('/repositorio/:filename', (req, res) => {
    const { filename } = req.params;
    res.sendFile(filename, { root: './repositorio' });
});
//Esto devuelve la lista material con el nombre de los archivo
router.get('/materiales/:Actividad_idActividad', (req, res) => {
    const { Actividad_idActividad } = req.params
    let sql = 'select * from material where Actividad_idActividad = ?'
    conexion.query(sql, [Actividad_idActividad], (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)
        }
    })
})
//Verifica si un usuario es administrador
router.get('/es-admin/:Usuario_ci', (req, res) => {
    const { Usuario_ci } = req.params

    const sql = 'SELECT * FROM administrador WHERE Usuario_ci = ?'

    conexion.query(sql, [Usuario_ci], (err, rows, fields) => {
        if (err) throw err;

        if (rows.length > 0) {
            res.json({ esAdmin: true })
        } else {
            res.json({ esAdmin: false })
        }
    })
})


// Obtiene el contenido de la pagina de inicio
router.get('/bannerInicio', (req, res) => {
    let sql = 'select * from iniciobaner'
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)
        }
    })
})
// Obtiene el un solo texto de la pagina de inicio
router.get('/unbannerInicio/:idInicioP', (req, res) => {
    const { idInicioP } = req.params
    let sql = 'select * from iniciobaner where idInicioP = ?'
    conexion.query(sql, [idInicioP], (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)
        }
    })
})
//Devuelve las imagenes de la pagina de iniciox
router.get('/panelCont/:filename', (req, res) => {
    const { filename } = req.params;
    res.sendFile(filename, { root: './uploads' });
});


//*******************************************DESDE AQUI SON PARA EDITAR TABLAS */
//Editar o modificar
router.put('/modificaEvento/:idEvento', (req, res) => {
    const { idEvento } = req.params
    const { nomEv, descEv, tipoEv, fechaIni, fechaFin, horaIni, horaFin, portada, direccionEv } = req.body
    let sql = `update evento set
                nomEv = '${nomEv}',
                descEv = '${descEv}',
                tipoEv = '${tipoEv}',
                fechaIni = '${fechaIni}',
                fechaFin = '${fechaFin}',
                horaIni = '${horaIni}',
                horaFin = '${horaFin}',
                portada = '${portada}',
                direccionEv = '${direccionEv}'
                where idEvento ='${idEvento}'`
    conexion.query(sql, (err, rows, field) => {
        if (err) throw err;
        else {
            res.json({ status: 'Evento editado' })
        }
    })
})
router.put('/modificarActiv/:idActividad', (req, res) => {
    const { idActividad } = req.params
    const { nomAct, horaAct, fechaAct, desAct } = req.body
    let sql = `update actividad set
                nomAct = '${nomAct}',
                horaAct = '${horaAct}',
                fechaAct = '${fechaAct}',
                desAct = '${desAct}'
                where idActividad ='${idActividad}'`
    conexion.query(sql, (err, rows, field) => {
        if (err) throw err;
        else {
            res.json({ status: 'Actividad editado' })
        }
    })
})
router.put('/modificarRelExpositor/:Actividad_idActividad', (req, res) => {
    const { Actividad_idActividad } = req.params
    const { Expositor_userExpo } = req.body
    let sql = `update expone set
                Expositor_userExpo = '${Expositor_userExpo}'
                where Actividad_idActividad ='${Actividad_idActividad}'`
    conexion.query(sql, (err, rows, field) => {
        if (err) throw err;
        else {
            res.json({ status: 'relacion expone editado' })
        }
    })
})
router.put('/modTextIni/:id', (req, res) => {
    const { id } = req.params
    const { textPanIni, imgPanIni } = req.body
    let sql = `update iniciobaner set
                textPanIni = '${textPanIni}',
                imgPanIni = '${imgPanIni}'
                where idActividad ='${id}'`
    conexion.query(sql, (err, rows, field) => {
        if (err) throw err;
        else {
            res.json({ status: 'Actividad editado' })
        }
    })
})
//********************************DESDE AQUI ES PARA ELIMINAR */
router.delete('/eliminarEvento/:idEvento', (req, res) => {
    const idEvento = req.params.idEvento;
    let sql = `DELETE FROM evento WHERE idEvento = ${idEvento}`;
    conexion.query(sql, (err, rows, field) => {
        if (err) throw err;
        else {
            res.json({ status: 'evento eliminado' });
        }
    });
});




//Esta ruta nos ayuda a enviar el correo
const nodemailer = require('nodemailer');
router.post('/send-email', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Configuración del servicio de correo
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'luiselcopa3@gmail.com',
                pass: 'werfoyenzgfvcisa'
            }
        });

        // Configuración del mensaje de correo
        const mailOptions = {
            from: 'Remitente <tu_correo@gmail.com>',
            to: email,
            subject: 'Pin de activacion: ' + message,
            html: `
          <h1>PIN DE ACTIVACION CDE CUENTA</h1>
          <p>Nombre: ${name}</p>
          <p>Correo electrónico: ${email}</p>
          <p>Mensaje: ${message}</p>
        `
        };

        // Envío del correo
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Correo enviado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al enviar el correo' });
    }
});

//Para el JWT
// Ruta para el inicio de sesión
router.post('/login', (req, res) => {
    const { ci, pass } = req.body;

    // Consultar la base de datos para encontrar el usuario
    conexion.query('SELECT * FROM usuario WHERE ci = ?', [ci], (err, results) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = results[0];
        console.log("*******>>>", user.pass, " ", pass);
        // Verificar la contraseña del usuario
        if (user.pass !== pass) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Generar el token JWT
        const token = jwt.sign({ userId: user.ci }, 'mysecretkey');

        res.json({ token });
    });
});
function protegerRutas(req, res, next) {
    // Obtener el token de las cabeceras de la solicitud
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No se proporcionó un token de autenticación.' });
    }

    // Verificar y decodificar el token
    jwt.verify(token, 'mysecretkey', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido.' });
        }

        // El token es válido, se permite el acceso a la ruta
        req.userId = decoded.userId;
        next();
    });
}

// Controlador para obtener un usuario
router.get('/usuariosJWT', protegerRutas, (req, res) => {
    const userId = req.userId;

    console.log("HOLAAAAAAAA")
    // Obtener el usuario a partir del userId
    conexion.query('SELECT * FROM usuario WHERE ci = ?', [userId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al obtener el usuario.' });
        }

        console.log(result); // Imprimir el resultado de la consulta

        res.json(result);
    });
});

router.post('/subir-archivo', upload.single('archivo'), (req, res) => {
    try {
        const rutaArchivo = req.file.path;
        console.log('Archivo subido:', rutaArchivo);
        res.status(200).json({ rutaArchivo });
    } catch (error) {
        console.error('Error al subir el archivo:', error);
        res.status(500).json({ error });
    }
});

module.exports = router;