'use-strict'

var validator=require('validator');
const { exists } = require('../models/user');
var User=require("../models/user");
var fs=require('fs');
var path=require('path');
var bcrypt=require('bcrypt-nodejs');
var jwt=require("../services/jwt")

var controller={
    prueba: function(req,res){
        res.status(200).send({
            message:"Metodo Prueba"
        });
    },
    test: function(req,res){
        res.status(200).send({
            message:"Metodo Test"
        });
    },
    saveUser: function(req,res){
        //RECOGER LOS DATOS
        var params=req.body
        //VALIDAR LOS DATOS
        try{
            var validate_name=!validator.isEmpty(params.name);
            var validate_surname=!validator.isEmpty(params.surname);
            var validate_email=!validator.isEmpty(params.email)&&validator.isEmail(params.email);
            var validate_password=!validator.isEmpty(params.password);
        }catch(error){
            return res.status(400).send({
                message: "Error al validar los datos del usuario",
            });
        }

        if (validate_name && validate_surname && validate_email && validate_password){
            //CREAR EL OBJETO USUARIO
            var user=new User()

            //ASIGNAR VALORES AL OBJETO USUARIO
            user.name=params.name;
            user.surname=params.surname;   
            user.email=params.email;
            user.password=params.password;
            user.role='ROLE_USER';
            user.image=null;
            
            User.findOne({email:user.email.toLowerCase()},(error,issetUser)=>{
                if (error){
                    return res.status(406).send({
                        message: "Error al insertar el usuario"
                    });
                }
                if (!issetUser){
                    bcrypt.hash(params.password,null,null,(err,hash)=>{
                        user.password=hash;

                        user.save((err,userStored)=>{
                            if (err){
                                return res.status(406).send({
                                    message: "Error al insertar el usuario"
                                });
                            }else if (!userStored){
                                return res.status(406).send({
                                    message: "Error al insertar el usuario"
                                });
                            }else{
                                return res.status(200).send({
                                    message: "Usuario registrado",
                                    user: user
                                });
                            }
                        })
                    })
                }else{
                    return res.status(405).send({
                        message: "El usuario esta duplicado"
                    });
                }
            });
        }else{
            return res.status(200).send({
                message:"Uno de los datos no es valido. Comprueba los datos que quieres insertar e intentalo de nuevo"
            });
        }
        
        
    },
    login: function(req,res){
        //Recoger parametros
        var params=req.body;
        //Validar parametros
        try{
            var validate_email=!validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_pass=!validator.isEmpty(params.password);
        }catch(error){
            return res.status(400).send({
                message: "Error al validar los datos del usuario",
            });
        }
        if (validate_email&&validate_pass){
            //Buscar usuario registrado
            User.findOne({email:params.email.toLowerCase()},(err,user)=>{
                if (err){
                    return res.status(500).send({
                        message: "No se ha encontrado al usuario",
                    });
                }else if(!user){
                    return res.status(404).send({
                        message: "El usuario no existe",
                    });
                }else{
                    //Si lo encuentra, comprobar contraseña con email
                    bcrypt.compare(params.password,user.password,(err,check)=>{
                        if (check){
                            //Generar Token JWT
                            if (params.gettoken){
                                return res.status(200).send({
                                    token:jwt.createToken(user)
                                });
                            }else{
                                //Limpiar el objeto
                                user.password=undefined;
                                //Devolver datos
                                return res.status(200).send({
                                    message: "Logueado con exito",
                                    user
                                });
                            }
                        }else{
                            return res.status(500).send({
                                message: "Las credenciales son incorrectas"
                            });
                        }
                    });  
                    
                }
            })
        }else{
            return res.status(500).send({
                message: "Uno de los campos es incorrecto"
            });
        }
    },
    update: function(req,res){
        //Recoger los datos del usuario del body
        var params=req.body;
        //Validar datos
        try{
            var validate_name=!validator.isEmpty(params.name);
            var validate_surname=!validator.isEmpty(params.surname);
            var validate_email=!validator.isEmpty(params.email)&&validator.isEmail(params.email);
        }catch(error){
            return res.status(400).send({
                message: "Error al validar los datos del usuario",
            });
        }
        
        //Eliminar propiedades innecesarias
        delete params.password;
        var userId=req.user.sub;
        //Comprobar si el email es unico
        if (req.user.email!=params.email){
            User.findOne({email:params.email.toLowerCase()},(err,user)=>{
                if (err){
                    return res.status(500).send({
                        message: "No se ha encontrado al usuario",
                    });
                }
                if (user && user.email==params.email){
                    return res.status(404).send({
                        message: "El usuario ya existe",
                    });
                }else{
                    //Buscar y actualizar en la base de datos
                    User.findOneAndUpdate({_id:userId},params,{new:true},(err,userUpdated)=>{
                        if (err){
                            return res.status(500).send({
                                message: "Error al actualizar el usuario",
                                status:"error"
                            });
                        }else if(!userUpdated){
                            return res.status(404).send({
                                message: "No existe el usuario actualizado",
                                status:"error"
                            });
                        }else{
                            //Devolver datos 
                            return res.status(200).send({
                                status: "success",
                                user:userUpdated
                            });
                    }
            })  
                }
            });
        }else{
            //Buscar y actualizar en la base de datos
            User.findOneAndUpdate({_id:userId},params,{new:true},(err,userUpdated)=>{
                if (err){
                    return res.status(500).send({
                        message: "Error al actualizar el usuario",
                        status:"error"
                    });
                }else if(!userUpdated){
                    return res.status(404).send({
                        message: "No existe el usuario actualizado",
                        status:"error"
                    });
                }else{
                    //Devolver datos 
                    return res.status(200).send({
                        status: "success",
                        user:userUpdated
                    });
                }
            })   
        }
    },
    uploadAvatar:function(req,res){
        //Recoger fichero de la peticion
        var file=req.files;
        if (file){
            //obtener el nombre y extension
            var file_path=file.file0.path;
            var file_split=file_path.split('\\');
            var file_name=file_split[2];
            var ext_split=file_name.split('.');
            var file_ext=ext_split[1];
             //Comprobar extension (solo img)
             if (file_ext.toLowerCase()!='png'&&file_ext.toLowerCase()!='jpg'&&file_ext.toLowerCase()!='jpeg'&&file_ext.toLowerCase()!='gif'){
                //Si no es valido, eliminar
                fs.unlink(file_path,(err)=>{
                    return res.status(400).send({
                        status: "error",
                        message:"La extension no es valida",
                        ext: file_ext
                    });
                })
             }else{
                //Solo modificar usuario identificado
                var userId=req.user.sub;
                //Buscar y actualizar decomuentos de la bd
                User.findByIdAndUpdate({_id:userId},{image:file_name},{new:true},(err,userUpdated)=>{
                    //Devolver datos 
                    if (err||!userUpdated){
                        return res.status(400).send({
                            status: "error",
                            message:"El usuario no existe"
                        });
                    }else{
                        return res.status(400).send({
                            status: "success",
                            user:userUpdated
                        });
                    }
                })
             }
        }else{
            return res.status(400).send({
                status: "error",
                message:"Error al subir avatar"
            });
        }
    },
    avatar: function(req,res){
        var avatar=req.params.fileName;
        var path_file="./uploads/users/"+avatar;

        fs.exists(path_file,(exists)=>{
            if (exists){
                return res.sendFile(path.resolve(path_file));
            }else{
                return res.status(400).send({
                    status: "error",
                    message:"La imagen no existe"
                }); 
            }
        })
    },
    getUsers:function(req,res){
        User.find().exec((err,users)=>{
            if (err || !users){
                return res.status(400).send({
                    status: "error",
                    message:"Error al mostrar todos los usuarios"
                }); 
            }else{
                return res.status(200).send({
                    status: "success",
                    users:users
                }); 
            }
        })
    },
    getUser:function(req,res){
        var userId=req.params.userId;

        User.findById(userId).exec((err,user)=>{
            if (err || !user){
                return res.status(400).send({
                    status: "error",
                    message:"Error al mostrar los datos de este usuario"
                }); 
            }else{
                return res.status(200).send({
                    status: "success",
                    user:user
                }); 
            }
        })
    },

}

module.exports=controller;