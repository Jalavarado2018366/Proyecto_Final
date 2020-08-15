'use strict'

var Usuarios = require('../models/usuario')
var jwt = require("../services/jwt");
const { use } = require('../routes/userRoutes');

function commands(req, res,voto=""){
var user = new Usuarios();
var params = req.body;
var commandss= params.commands;
var arreglo = commandss.split(" ");

switch (arreglo[0]) {
    case 'REGISTER':       
        if(arreglo[1] && arreglo[2]){
            user.nombre = arreglo[1];   
            user.password = arreglo[2];
            Usuarios.find({ $or: [           
                 {nombre: user.nombre}
                ]}).exec((err, usuarios) =>{
                    if(err) return res.status(500).send({message: 'Error en la peticion de usuario'})
                    if(usuarios && usuarios.length >= 1){
                        return res.status(500).send({message: 'el usuario ya existe intente con otro nombre'})
                    }else{


                            user.save((err, usuarioGuardado) =>{
                                if(err) return res.status(500).send({message: 'Error al guardar el usuario'})
                                if(usuarioGuardado){
                                    res.status(200).send({Usuario: usuarioGuardado})
                                }else{
                                    res.status(404).send({message: 'no se a podido registrar el usuario'})
                                }
                            })

                    }
                })
        }else{
            res.status(200).send({
                message: 'Le faltaron datos por rellenar'
            })
        }
        break;

        case 'LOGIN':
        Usuarios.findOne({ nombre: arreglo[1] }, (err, usuario)=>{
        if(err) return res.status(500).send({message : 'Error en la peticion'})
        if (usuario){
                if(usuario){
                    if(arreglo[3]){
                        return res.status(200).send({
                            token: jwt.createToken_A(usuario)
                        })
                    }else{
                        usuario.password= undefined;
                        return res.status(200).send({ user: usuario})
                    }
                }else{
                    return res.status(404).send({message : 'el Usuario no se puede identificar'})
                }
        }else{
            return res.status(404).send({ message: 'el usuario no se a podido logear'})
        }
    })
            break;
            case 'EDIT_USER':
            Usuarios.findByIdAndUpdate(req.user.sub,{nombre: arreglo[1],password: arreglo[2]}, {new: true }, (err, usuarioActualizado)=>{
                if(err) return res.status(500).send({message: 'error de la peticion'})
                if(!usuarioActualizado) return res.status(404).send({message: 'No se a podido editar el usuario'})
                return res.status(200).send({user: usuarioActualizado})
            })     
            break;
            case 'DELETE_USER':
            Usuarios.findByIdAndDelete( req.user.sub,(err, usuarioEliminado)=>{
                if(err) return res.status(500).send({message: 'no eliminado'})
                if(!usuarioEliminado) return res.status(404).send({message: 'no se pudo eliminar'})
                return res.status(200).send({user: usuarioEliminado})
            }) 
            break;
            case'ADD_TWEET':
            var arreglo1 = commandss.split(" ");
            Usuarios.findByIdAndUpdate( req.user.sub,{$push:{Tweets:{informacion: arreglo1[1]}}},{new: true},(err, tweetAgregado)=>{
                if(err) return res.status(500).send({message: "Error en la peticion del Tweet"})
                if(!tweetAgregado) return res.status(404).send ({message: 'Error al agregar Tweet'})
                return res.status(200).send({Tweet: tweetAgregado})
            })
            break;
            case 'EDIT_TWEET':  
            var arreglo2 = commandss.split(" ");   
                Usuarios.findOneAndUpdate({_id: req.user.sub, "Tweets._id": arreglo2[1]}, { "Tweets.$.informacion": arreglo2[2]}, {new: true, useUnifiedTopology: true}, (err, tweetActualizado)=>{
                    if(err) return res.status(500).send({message: "Error en la peticion del tweet"})
                    if(!tweetActualizado) return res.status(404).send({message: "Error al editar el tweet"})
                    return res.status(200).send({Tweet: tweetActualizado})
                })           
            break;
            case'DELETE_TWEET':       
            var arreglo3 = commandss.split(" ");
            Usuarios.findByIdAndUpdate(req.user.sub, {$pull:{Tweets:{_id: arreglo3[1]}}}, {new: true}, (err, tweetBorrado)=>{
                if(err) return res.status(500).send({message: "Error en la peticion del tweet"})
                if(!tweetBorrado) return res.status(404).send ({message: 'Error al borrar el tweet'})
                return res.status(200).send({tweet: tweetBorrado})
            })
            break;
            case 'VIEW_TWEETS':
            var arreglo4 = commandss.split(" ");
            Usuarios.findOne({nombre:arreglo4[1]},(err, getTweets)=>{
                if (err) return res.status(500).send({message: 'Error en la peticion del tweet'})
                if(!getTweets) return res.status(404).send({message: 'Error al listar los tweets'})
                return res.status(200).send({Tweet: getTweets.Tweets})
            })
            break;
            case'FOLLOW':
            var arreglo5 = commandss.split(" ");
            Usuarios.findOne({nombre:arreglo5[1]},(err, seguir)=>{
                var union = seguir.id;
                Usuarios.findByIdAndUpdate(req.user.sub, { $push : {Follow: {Siguiendo : union }}}, {new: true}, (err, encuestaActualizada)=>{
                    if(err) return res.status(500).send({message: "Error en la peticion del comentario"})
                    if(!encuestaActualizada) return res.status(404).send ({message: 'Error al enviar el comentario'})
                    return res.status(200).send({comentario: encuestaActualizada})
                })
             })
            break;
            case 'UNFOLLOW':
            var arreglo6 = commandss.split(" ");
            Usuarios.findOne({nombre:arreglo6[1]},(err, seguir)=>{
               Usuarios.findById(req.user.sub,(err, busqueda)=>{ 
                var nombreUsuario = busqueda.nombre;
                if(seguir != null){ 
                   if(arreglo6[1] != nombreUsuario){                   
                var nombreA = seguir.nombre;
                Usuarios.findByIdAndUpdate( req.user.sub,{$pull:{Follow:{nombreS: nombreA}}},{new: true},(err, siguiendo)=>{
                    if(err) return res.status(500).send({message: "Error en la peticion de borrar follower"})
                    if(!siguiendo) return res.status(404).send ({message: 'Error al borrar follower'})
                    return res.status(200).send({seguir: siguiendo})
                })
               }else{
                res.status(200).send({message: 'El usuario no se puede borrar a si mismo'})
              }
             }else{
                res.status(200).send({message: 'el usuario ingresado no existe en Follow'})
              }
              })
            })
            break;
            case'PROFILE':
            var arreglo7 = commandss.split(" ");
            Usuarios.findOne({nombre:arreglo7[1]},(err, getTweets)=>{
                if (err) return res.status(500).send({message: 'Error en la peticion del tweet'})
                if(!getTweets) return res.status(404).send({message: 'Error al listar los tweets'})
                return res.status(200).send({Tweet: getTweets})
            })
            break;
            case'LIKE_TWEET':
            var arreglo8 = commandss.split(" ");   
            var name = req.body.nombre;
            Usuarios.findById(req.user.sub).populate('Follow.siguiendo').exec((err, busqueda)=>{
                if (err) return res.status(500).send({message: 'Error en la peticion de Comentarios'})
                if(!busqueda) return res.status(404).send({message: 'Error al listar los Comentarios'})
                return res.status(200).send({Follow: busqueda.Follow})
            })



            break;
            case'DISLIKE_TWEET':
            break;
            case'REPLY_TWEET':
            var arreglo10 = commandss.split(" ");
            Encuesta.findByIdAndUpdate(Tweets, { $push : {Tweets:{reply:{respuesta : arreglo10[1], Usuario_que_Respondio: req.user.sub }}}}, {new: true}, (err, encuestaActualizada)=>{
                if(err) return res.status(500).send({message: "Error en la peticion del comentario"})
                if(!encuestaActualizada) return res.status(404).send ({message: 'Error al enviar el comentario'})
                return res.status(200).send({comentario: encuestaActualizada})
            })
            break;
            case'RETWEET':
            break;
            case'Prueba': 
            var arreglo11= commandss.split(" ");
                Usuarios.findById(req.user.sub,{Follow:{Siguiendo:{$in:[arreglo11[1]]}}},(err, tweetActualizado)=>{
                    return res.status(200).send({comentario: tweetActualizado})  
                }) 

            break;

    default:
        break;
}
}

module.exports = {
    commands
}