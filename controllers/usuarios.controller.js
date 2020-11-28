const { response } = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario.model');
const { generarJWT } = require('../routes/helpers/jwt');

const getUsuarios = async(req, res) => {

  const usuarios = await Usuario.find({}, 'nombre email role google');
  res.json({
    ok: true,
    usuarios,
    uid: req.uid
  });
};

const crearUsuario = async(req, res = response) => {

  const { password, email } = req.body;

  try {
    const existeEmail = await Usuario.findOne({ email });
    if (existeEmail) {
      return res.status(400).json({
        ok: false,
        msg: 'El email ya está registrado'
      });
    }
    const usuario = new Usuario(req.body);

    // Encriptar password
    const salt =  bcrypt.genSaltSync();
    usuario.password = bcrypt.hashSync( password, salt );

    // Guardar usuario
    await usuario.save();

    // Generar el Token - JWT
    const token = await generarJWT( usuario.id );

    res.json({
      ok: true,
      usuario,
      token
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'Error inesperado, revisar logs'
    })
  }
  
};

const actualizarUsuario = async(req, res = response) => {
  // TODO validar token y comprobar si es el usuario correcto

  const uid = req.params.id;
  try {
    const usuarioDB = await Usuario.findById( uid );
    console.log(usuarioDB);
    if (!usuarioDB) {
      return res.status(400).json({
        ok: false,
        msg: 'El usuario con id ' + uid + ' no existe'
      })
    }

    // Actualizar el usuario
    const { password, google, email, ...campos} = req.body;

    if (usuarioDB.email !== email) {
      const existeEmail = await Usuario.findOne({ email });
      if (existeEmail) {
        return res.status(400).json({
          ok: false,
          msg: 'Ya existe un usuario con el email ' + email
        })
      }
    }

    campos.email = email;
    const usuarioActualizado = await Usuario.findByIdAndUpdate(uid, campos, { new: true });

    res.json({
      ok: true,
      usuario: usuarioActualizado
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'Error al actualizar usuario'
    });
  }
};

const borrarUsuario = async(req, res = response) => {
  const uid = req.params.id;
  try {
    const usuarioDB = await Usuario.findById( uid );
    console.log(usuarioDB);
    if (!usuarioDB) {
      return res.status(400).json({
        ok: false,
        msg: 'El usuario con id ' + uid + ' no existe'
      })
    }

    await Usuario.findByIdAndDelete(uid);

    res.json({
      ok: true,
      msg: 'Usuario con id ' + uid + ' eliminado'
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'Error al eliminar usuario'
    });
  }
}

module.exports = {
  getUsuarios,
  crearUsuario,
  actualizarUsuario,
  borrarUsuario
}