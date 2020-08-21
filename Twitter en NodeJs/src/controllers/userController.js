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
            Usuarios.findById( req.user.sub,(err, nombreBuscado)=>{
                Usuarios.findByIdAndUpdate( req.user.sub,{$push:{Tweets:{informacion: arreglo1[1],Like:0,dislike:0,Creador_del_Tweet:nombreBuscado.nombre,cantidad_de_Respuestas:0,cantidad_de_Retweets:0}}},{new: true},(err, tweetAgregado)=>{
                    if(err) return res.status(500).send({message: "Error en la peticion del Tweet"})
                    if(!tweetAgregado) return res.status(404).send ({message: 'Error al agregar Tweet'})
                    return res.status(200).send({Tweet: tweetAgregado})
                })
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
            Usuarios.findById(req.user.sub,(err, getTweets)=>{
                if (err) return res.status(500).send({message: 'Error en la peticion del tweet'})
                if(!getTweets) return res.status(404).send({message: 'Error al listar los tweets'})
                return res.status(200).send({Tweet: getTweets.Tweets})
            })
            break;
            case'FOLLOW':
            var arreglo5 = commandss.split(" ");
            Usuarios.findOne({nombre:arreglo5[1]},(err, seguir)=>{
               Usuarios.findById(req.user.sub,(err, busqueda)=>{ 
                var nombreUsuario = busqueda.nombre;
                if(seguir != null){ 
                   if(arreglo5[1] != nombreUsuario){                   
                var nombreA = seguir.nombre;
                Usuarios.findByIdAndUpdate( req.user.sub,{$push:{Follow:{nombreS: nombreA}}},{new: true},(err, siguiendo)=>{
                    if(err) return res.status(500).send({message: "Error en la peticion de seguir"})
                    if(!siguiendo) return res.status(404).send ({message: 'Error al seguir a un usuario'})
                    return res.status(200).send({seguir: siguiendo})
                })
               }else{
                res.status(200).send({message: 'El usuario no se puede seguir a si mismo'})
              }
             }else{
                res.status(200).send({message: 'No existe el usuario ingresado'})
              }
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
                if (err) return res.status(500).send({message: 'Error en la peticion del Perfil'})
                if(!getTweets) return res.status(404).send({message: 'Error al mostrar los tweets'})
                return res.status(200).send({Tweet: getTweets})
            })
            break;
            case'LIKE_TWEET':
            var arreglo8 = commandss.split(" ");
            Usuarios.findOne({"Tweets._id": arreglo8[1]},(err, buscar_id_Tweet)=>{
                if (err) return res.status(500).send({message: 'La id del Tweet no existe, revise porfavor que este bien escrito'})
                if(!buscar_id_Tweet) return res.status(404).send({message: 'La id del Tweet no existe, revise porfavor que este bien escrito'}) 
                var nombreBuscar= buscar_id_Tweet.nombre;
                Usuarios.findOne({_id: req.user.sub, "Follow.nombreS": nombreBuscar},(err, BuscarFollowers)=>{
                    if (err) return res.status(500).send({message: 'Error en la peticion'})
                    if(!BuscarFollowers) return res.status(404).send({message: 'No le puedes dar Like porque no esta en tus Follow'}) 
                    var o =buscar_id_Tweet.Tweets.findIndex(elemento=>{return elemento.id === arreglo8[1]});
                    var i = buscar_id_Tweet.Tweets[o].Like;
                    var a = buscar_id_Tweet.Tweets[o].usuariosQueLeDieronLike.findIndex(elemento=>{return elemento.usuario == BuscarFollowers.id});
                    var suma= i+1;
                    if(a == -1){ 
                        Usuarios.findOneAndUpdate( {"Tweets._id": arreglo8[1]},{ "Tweets.$.Like":suma},{new: true, useUnifiedTopology: true}, (err, likeAgregado)=>{
                            if(err) return res.status(500).send({message: "Error en la peticion de dar Like Tweet"})
                            if(!likeAgregado) return res.status(404).send ({message: 'Error al agregar Like al Tweet'})
                            Usuarios.findOneAndUpdate( {"Tweets._id": arreglo8[1]},{$push:{"Tweets.$.usuariosQueLeDieronLike":{usuario:req.user.sub}}},{new: true},(err, likeAgregados)=>{
                                if(err) return res.status(500).send({message: "Error"})
                                if(!likeAgregados) return res.status(404).send ({message: 'Error al'})
                                return res.status(200).send({Tweet: likeAgregados})
                            })
                        })
                }else{
                    res.status(200).send({message: 'Ya le diste like'})               
                }
                })
            })
            break;
            case'DISLIKE_TWEET':
            var arreglo8 = commandss.split(" ");
            Usuarios.findOne({"Tweets._id": arreglo8[1]},(err, buscar_id_Tweet)=>{
                if (err) return res.status(500).send({message: 'La id del Tweet no existe, revise porfavor que este bien escrito'})
                if(!buscar_id_Tweet) return res.status(404).send({message: 'La id del Tweet no existe, revise porfavor que este bien escrito'}) 
                var nombreBuscar= buscar_id_Tweet.nombre;
                Usuarios.findOne({_id: req.user.sub, "Follow.nombreS": nombreBuscar},(err, BuscarFollowers)=>{
                    if (err) return res.status(500).send({message: 'Error en la peticion'})
                    if(!BuscarFollowers) return res.status(404).send({message: 'No le puedes dar Like porque no esta en tus Follow'}) 
                    var o =buscar_id_Tweet.Tweets.findIndex(elemento=>{return elemento.id === arreglo8[1]});
                    var i = buscar_id_Tweet.Tweets[o].Like;
                    var a = buscar_id_Tweet.Tweets[o].usuariosQueLeDieronLike.findIndex(elemento=>{return elemento.usuario == BuscarFollowers.id});;
                    var suma= i-1;
                    if(a != -1){ 
                        Usuarios.findOneAndUpdate( {"Tweets._id": arreglo8[1]},{ "Tweets.$.Like":suma},{new: true, useUnifiedTopology: true}, (err, likeAgregado)=>{
                            if(err) return res.status(500).send({message: "Error en la peticion de dar Like Tweet"})
                            if(!likeAgregado) return res.status(404).send ({message: 'Error al agregar Like al Tweet'})
                            Usuarios.findOneAndUpdate( {"Tweets._id": arreglo8[1]},{$pull:{"Tweets.$.usuariosQueLeDieronLike":{usuario:req.user.sub}}},{new: true},(err, likeAgregados)=>{
                                if(err) return res.status(500).send({message: "Error"})
                                if(!likeAgregados) return res.status(404).send ({message: 'Error al'})
                                return res.status(200).send({Tweet: likeAgregados})
                            })
                        })
                }else{
                    res.status(200).send({message: 'No le has dado Like '})               
                }
                })
            })
            break;
            case'REPLY_TWEET':
            var arreglo10 = commandss.split(" ");
            Usuarios.findOneAndUpdate({"Tweets._id": arreglo10[1]},{ $push:{"Tweets.$.reply":{respuesta : arreglo10[2] }}}, {new: true}, (err, respuestaGuardada)=>{
                if(err) return res.status(500).send({message: "Error en la peticion de la respuesta"})
                if(!respuestaGuardada) return res.status(404).send ({message: 'Error al guardar la respuesta'})
                var o =respuestaGuardada.Tweets.findIndex(elemento=>{return elemento.id === arreglo10[1]});
                var i = respuestaGuardada.Tweets[o].cantidad_de_Respuestas;
                var cont = i+1;
                Usuarios.findOneAndUpdate({"Tweets._id": arreglo10[1]},{"Tweets.$.cantidad_de_Respuestas":cont},{new: true, useUnifiedTopology: true}, (err, cantidad)=>{
                    if(err) return res.status(500).send({message: "Error "})
                    if(!cantidad) return res.status(404).send ({message: 'Error al guardar la cantidad de respuestas'})
                    return res.status(200).send({comentario: respuestaGuardada})
                })
            })
            break;
            case'RETWEET':
            var arreglo14 = commandss.split(" ");
            Usuarios.findById( req.user.sub,(err, buscarInformacion)=>{
                Usuarios.findOne({"Tweets._id": arreglo14[1]},(err, buscar_id_Tweet)=>{
                    if (err) return res.status(500).send({message: 'La id del Tweet no existe, revise porfavor que este bien escrito'})
                    if(!buscar_id_Tweet) return res.status(404).send({message: 'La id del Tweet no existe, revise porfavor que este bien escrito'}) 
                    var o =buscar_id_Tweet.Tweets.findIndex(elemento=>{return elemento.id === arreglo14[1]});
                    var i = buscar_id_Tweet.Tweets[o].informacion;
                    var n = buscar_id_Tweet.Tweets[o].Creador_del_Tweet;
                    var oo =buscarInformacion.Tweets.findIndex(elemento=>{return elemento.informacion === i});
                    var p =buscar_id_Tweet.Tweets.findIndex(elemento=>{return elemento.id === arreglo14[1]});
                    var k = buscar_id_Tweet.Tweets[p].cantidad_de_Retweets;
                    if(oo == -1){ 
                        Usuarios.findByIdAndUpdate( req.user.sub,{$push:{Tweets:{informacion: i,Like:0,dislike:0,Creador_del_Tweet:n}}},{new: true},(err, tweetAgregado)=>{
                            if(err) return res.status(500).send({message: "Error en la peticion del Tweet"})
                            if(!tweetAgregado) return res.status(404).send ({message: 'Error al agregar Tweet'})
                            var cont = k+1;
                            Usuarios.findOneAndUpdate({"Tweets._id": arreglo14[1]},{"Tweets.$.cantidad_de_Retweets":cont},{new: true, useUnifiedTopology: true}, (err, cantidad)=>{
                                if(err) return res.status(500).send({message: "Error "})
                                if(!cantidad) return res.status(404).send ({message: 'Error al guardar la cantidad de retweets'})
                                return res.status(200).send({comentario: tweetAgregado})
                            })
                        })
                    }else{
                        Usuarios.findById( req.user.sub,(err, buscarIdTweet)=>{
                        var a =buscarIdTweet.Tweets.findIndex(elemento=>{return elemento.informacion === i});
                        var aa = buscarIdTweet.Tweets[a].id;
                            Usuarios.findByIdAndUpdate(req.user.sub, {$pull:{Tweets:{_id:aa}}}, {new: true}, (err, tweetBorrado)=>{
                                if(err) return res.status(500).send({message: "Error en la peticion del tweet"})
                                if(!tweetBorrado) return res.status(404).send ({message: 'Error al borrar el tweet'})
                                var cont = k-1;
                                Usuarios.findOneAndUpdate({"Tweets._id": arreglo14[1]},{"Tweets.$.cantidad_de_Retweets":cont},{new: true, useUnifiedTopology: true}, (err, cantidad)=>{
                                    if(err) return res.status(500).send({message: "Error "})
                                    if(!cantidad) return res.status(404).send ({message: 'Error al guardar la cantidad de retweets'})
                                    return res.status(200).send({comentario: tweetAgregado})
                                })
                            }) 
                        }) 
                    }
                })
            })
            break;
    default:
        break;
}
}

module.exports = {
    commands
}
