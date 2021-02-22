'use-strict'
var clave="clave-secreta-para-generar-token-976245";
var jwt=require("jwt-simple");
var moment=require("moment")

exports.auth=function(req,res,next){
    //Comprobar si llega autorizacion
    if (!req.headers.auth){
        return res.status(403).send({
            message: "No hay ningun token en la cabecera"
        })
    }else{
        //Limpiar token y quitar comillas
        var token=req.headers.auth.replace(/['"]+/g,'')
        //Decodificar token
        try{
            //Comprobar si el token ha expirado
            var payload=jwt.decode(token,clave);//Obtener los datos del token
            if (payload.exp<=moment().unix()){
                return res.status(402).send({
                    message: "El token ha expirado"
                })   
            }
        }catch(ex){
            return res.status(402).send({
                message: "El token no es valido"
            })
        }
    }
    //Adjuntar usuario del token
    req.user=payload;
    //Ir al metodo siguiente del controlador
    next();
}