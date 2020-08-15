'use strict'

var jwt = require('jwt-simple')
var moment = require('moment')
var secret = 'clave_secreta';

exports.createToken_A = function(user){
    var payload ={
        sub: user._id,
        nombre: user.nombre,
        iat: moment().unix(),
        exp:moment().day(30, 'day').unix() 
    }
    return jwt.encode(payload, secret)
}