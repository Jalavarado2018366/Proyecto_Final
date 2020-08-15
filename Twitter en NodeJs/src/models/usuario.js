'use strict'

var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var UserSchema = Schema({
    nombre: String,
    password: String,
    Tweets: [{
        informacion: String,
        reply: [{
            respuesta:String,
            Usuario_que_Respondio: { type: Schema.ObjectId, ref: 'user'}
        }],
        Like: Number,
        dislike: Number
    }],
    Follow: [{
        Siguiendo: { type: Schema.ObjectId, ref: 'user'}
    }],

})

module.exports= mongoose.model('user',UserSchema);