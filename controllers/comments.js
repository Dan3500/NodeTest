'use-strict'
var Topic=require('../models/topic');
var validator=require('validator');
var controller={
    add:function(req,res){
        //Recoger id del topic de la url
        var topicId=req.params.topicId;
        //Find para obtener el topic
        Topic.findById(topicId).exec((err,topic)=>{
            if(err||!topic){
                res.status(404).send({
                    message:"Error al encontrar el topic"
                });
            }else{
                if (req.body.content){
                    try{
                        var validate_content=!validator.isEmpty(req.body.content);
                        if (validate_content){
                            //Comprobar user y validar datos
                            var comment={
                                user:req.user.sub,
                                content:req.body.content
                            }
                            //Push a la propiedad comments de la bd
                            topic.coments.push(comment);
                            //Guardar el topic completo 
                            topic.save((err)=>{
                                if (err){
                                    res.status(500).send({
                                        status:'error',
                                        message:"Error al guardar el comentario"
                                    });
                                }else{
                                    //Devolver datos
                                    res.status(200).send({
                                        status:'success',
                                        topic
                                    });
                                }
                                
                            })
                            
                        }else{
                            res.status(400).send({
                                message:"Los datos no son validos"
                            });
                        }
                    }catch(error){
                        res.status(400).send({
                            message:"No has comentado nada"
                        });
                    } 
                }
            }
        })
    },
    update:function(req,res){
        //Conseguir el id del comentario
        var comentId=req.params.commentId;
        //Recoger los datos del body y validar
        var params=req.body;
        try{
            var validate_content=!validator.isEmpty(params.content);
            if (validate_content){
                //Find and update de subdocumento de comentario
                Topic.findOneAndUpdate(
                    {"coments._id":comentId},
                    {"$set":{
                                "coments.$.content":params.content
                            }
                    },
                    {new:true},
                    (err,comentUpdated)=>{
                        if (err||!comentUpdated){
                            res.status(500).send({
                                status:'error',
                                message:"Error al actualizar el comentario"
                            });
                        }else{
                            //Devolver los datos
                            res.status(200).send({
                                status:"success",
                                coment:comentUpdated
                            });
                        }  
                    }
                )
            }else{
                res.status(400).send({
                    message:"Los datos no son validos"
                });
            }
        }catch(error){
            res.status(400).send({
                message:"No has comentado nada"
            });
        } 
    },
    delete:function(req,res){
        //Sacar el id del topic/comentario a borrar
        var comentId=req.params.commentId;
        var topicId=req.params.topicId;
        //Buscar el topic
        Topic.findById(topicId,(err,topic)=>{
            if (err || !topic){
                res.status(400).send({
                    message:"No existe ningun topic con este id"
                });
            }else{
                //Seleccionar el subdocumento(comentario)
                var coment=topic.coments.id(comentId);
                if (coment){
                    //Borrar el comentario
                    coment.remove();
                    //Guardar el topic
                    topic.save((err)=>{
                        if(err){
                            res.status(400).send({
                                status:"error",
                                message:"Error al borrar el comentario"
                            });
                        }else{
                            //Devolver datos
                            res.status(200).send({
                                message:"Se ha borrado el comentario",
                                topic
                            });
                        }
                    }) 
                }else{
                    res.status(400).send({
                        message:"No existe ningun comentario con este id"
                    });
                }
            }
            
        })
    }
}

module.exports=controller;