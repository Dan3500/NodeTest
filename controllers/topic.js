'use-strict'
var validator=require("validator");
var Topic=require("../models/topic");

var controller={
    test: function(req,res){
        res.status(200).send({
            message:"Metodo Test TOPIC"
        });
    },
    save: function(req,res){
        //Recoger parametros por post y validar
        var params=req.body;
        //Crear objeto a guardar
        try{
            var validate_tittle=!validator.isEmpty(params.tittle);
            var validate_content=!validator.isEmpty(params.content);
            var validate_lang=!validator.isEmpty(params.lang);
            if (validate_content&&validate_lang&&validate_tittle){
                //Asignar valores
                var topic=new Topic();
                topic.tittle=params.tittle;
                topic.content=params.content;
                topic.code=params.code;
                topic.lang=params.lang;
                topic.user=req.user.sub;
                //Guardar el topic
                topic.save((err,topicSaved)=>{
                    if (err ||!topic){
                        res.status(400).send({
                            message:"Error al guardar el nuevo topic"
                        });
                    }else{
                        //Devolver datos
                        res.status(200).send({
                            status:"success",
                            topic:topicSaved
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
                message:"Faltan datos por enviar"
            });
        }
    },
    getTopics: function(req,res){
        //Cargar la libreria de paginacion
        //Recoger la pagina actual
        if (!req.params.page||req.params.page==null || req.params.page==undefined||req.params.page==0||req.params.page=='0'){
            var page=1
        }else{
            var page=parseInt(req.params.page);
        }
            
        //Indicar las opciones de paginacion
        var options={
            sort:{date:-1},
            populate:'user',
            limit:5,
            page:page
        }
        
        //Find paginado
        Topic.paginate({},options,(err, topics)=>{
            //Devolver resultado (topics, total de topic y total de paginas)
            if (err ||!topics){
                res.status(500).send({
                    status:'error',
                    message:"Fallo en la paginacion"
                });
            }else{
                res.status(200).send({
                    status:'success',
                    topics:topics.docs,
                    totalDocs:topics.totalDocs,
                    totalPages:topics.totalPages,
                    options,
                    message:"FMetodo get topics"
                });
            }
        });
    },
    getTopicsByUser: function(req,res){
        //Conseguir el Id de user
        var userId=req.params.user;
        //Find con una condicion de user
        Topic.find({
            user:userId
        }).sort([['date','descending']])
          .exec((err,topics)=>{
              if(err||!topics){
                res.status(500).send({
                    status:'error',
                    message:"Fallo en la peticion"
                });
              }else{
                //Devolver el resultado
                res.status(200).send({
                    status:'success',
                    topics,
                });
              }
          })
        
    },
    getTopic:function(req,res){
        //Sacar el id de la url
        var topicId=req.params.id;
        //FInd con el id del topic
        Topic.findById(topicId).populate('user').exec((err,topic)=>{
            //Devolver resultados
            if(err||!topic){
                res.status(500).send({
                    status:'error',
                    message:"Fallo en la peticion"
                });
            }else{
                //Devolver el resultado
                res.status(200).send({
                    status:'success',
                    topic,
                });
            }
        })
    },
    update:function(req,res){
        //Recoger id del topic
        var topicId=req.params.id;
        //recoger datos del post
        var params=req.body;
        //validar datos
        try{
            var validate_tittle=!validator.isEmpty(params.tittle);
            var validate_content=!validator.isEmpty(params.content);
            var validate_lang=!validator.isEmpty(params.lang);
            if (validate_content&&validate_lang&&validate_tittle){
                 //Montar json con datos modificables
                var update={
                    tittle:params.tittle,
                    content:params.content,
                    code:params.code,
                    lang:params.lang
                }
                //Find and update del id si eres dueño
                Topic.findOneAndUpdate({_id:topicId,user:req.user.sub},update,{new:true},(err,topicUpdated)=>{
                    //Devolver los datos
                    if(err||!topicUpdated){
                        res.status(500).send({
                            status:'error',
                            message:"Fallo en la peticion"
                        });
                    }else{
                        //Devolver el resultado
                        res.status(200).send({
                            status:'success',
                            topic:topicUpdated
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
                message:"Faltan datos por enviar"
            });
        } 
    },
    delete:function(req,res){
       //Sacar id del topic
       var topicId=req.params.id;
       //Find and delete por topic id y user id
       Topic.findOneAndDelete({_id:topicId,user:req.user.sub},(err,topicRemoved)=>{
            //Devolver los datos
            if(err||!topicRemoved){
                res.status(500).send({
                    status:'error',
                    message:"Fallo en la peticion"
                });
            }else{
                //Devolver el resultado
                res.status(200).send({
                    status:'success',
                    topic:topicRemoved
                });
            }
        })
    },
    search:function(req,res){
        //Sacar la busqueda
        var search=req.params.search;
        //Find con operador or
        Topic.find({
            "$or":[
                {"tittle":{"$regex":search,"$options":"i"}},
                {"content":{"$regex":search,"$options":"i"}},
                {"code":{"$regex":search,"$options":"i"}},
                {"lang":{"$regex":search,"$options":"i"}}
            ]
        }).sort([['date','descending']])
          .exec((err,topics)=>{
            if(err||!topics){
                res.status(500).send({
                    status:'error',
                    message:"No se ha encontrado nada"
                });
            }else{
                //Devolver resultado
                res.status(200).send({
                    status:'success',
                    topics
                });
            }
        })
    }
}

module.exports=controller;