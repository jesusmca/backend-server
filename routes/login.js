var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {


        if (err) {
            return res.status(500).json({
                ok: true,
                mensaje: "Error al buscar usuarios",
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: true,
                mensaje: "Credenciales incorrectas - email",
                errors: { message: "Credenciales incorrectas, vuelva a intentar" }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(200).json({
                ok: true,
                mensaje: "Credenciales incorrectas - password",
                errors: { message: "Credenciales incorrectas, vuelva a intentar" }
            });
        }

        //Crear un token para el usuario
        usuarioDB.password = ":)";

        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB.id
        });
    });
});



module.exports = app;