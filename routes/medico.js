var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var mdAutenticacion = require('../middleware/autenticacion');

var app = express();
var Medico = require('../models/medico');

/*  //////////////////////////
 *   Obtiene todos los medicos
 */ //////////////////////////

app.get('/', mdAutenticacion.verificaToken, (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    
    Medico.find({})
    .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: err
                    });
                }



                if (!medicos) {
                    return res.status(401).json({
                        ok: false,
                        mensaje: 'No existe un medico',
                        errors: { message: "No existen medicos" }
                    });
                }

                Medico.count({}, (err, conteo) => {

                    if (!medicos) {
                        return res.status(401).json({
                            ok: false,
                            mensaje: 'No existe un medico',
                            errors: { message: "No existen medicos" }
                        });
                    }
                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    });
            });
            });
});




/*  //////////////////////////
 *   Actualizar un medico 
 */ //////////////////////////
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar al medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + 'no existe.',
                errors: { message: 'No existe un medico con ese ID' }
            });

        }

        medico.nombre = body.nombre;
        medico.img = body.img;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado,
                usuarioToken: req.usuario
            });
        });
    });
});


/*  //////////////////////////
 *   Crear un medico 
 */ //////////////////////////

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoSave) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoSave,
            usuarioToken: req.usuario
        });
    });
});


/*  //////////////////////////
 *   Borrar un medico por id
 */ //////////////////////////

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe medico con ID: ' + id,
                errors: { message: 'No existe medico con ID: ' + id }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado,
            usuarioToken: req.usuario
        });
    });
});


module.exports = app;