const { response } = require('express');
const bcrypt = require('bcryptjs');

const Usuario = require('../models/usuario.model');
const { generarJWT } = require('../routes/helpers/jwt');

const login = async(req, res = response) => {

  const { email, password } = req.body;

  try {

    // Verificar email
    const usuarioDB = await Usuario.findOne( { email } );
    if (!usuarioDB) {
      return res.status(404).json({
        ok: false,
        msg: 'Email no valido'
      });
    }

    // Verificar password
    const validPassword = bcrypt.compareSync( password, usuarioDB.password );
    if (!validPassword) {
      return res.status(400).json({
        ok: false,
        msg: 'Password no valido'
      })
    }

    // Generar el Token - JWT
    const token = await generarJWT( usuarioDB.id );

    res.json({
      ok: true,
      token
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'Error en login'
    })
  }
}

module.exports = {
  login
}
