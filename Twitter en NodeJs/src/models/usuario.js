'use strict'

var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var UserSchema = Schema({
    nombre: String,
    password: String,
    Tweets: [{
        informacion: String,
        reply: [{
            respuesta:String
        }],
        Like: Number,
        usuariosQueLeDieronLike:[{ 
            usuario: { type: Schema.ObjectId, ref: 'user'}
         }],
         Creador_del_Tweet:String,
         cantidad_de_Respuestas: Number,
         cantidad_de_Retweets: Number
    }],
    Follow: [{
        nombreS: String
    }],

})

module.exports= mongoose.model('user',UserSchema);
