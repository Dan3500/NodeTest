'use-strict'

//REQUIRES
var express=require("express");
var body_parser=require("body-parser");

//EJECUTAR EXPRESS
var app=express();//Activa framework para poder usarlo

//CARGAR ARCHIVOS RUTAS
var user_routes=require("./routes/user");
var topic_routes=require("./routes/topic");
var comments_routes=require("./routes/comments");

//MIDDLEWARES
app.use(body_parser.urlencoded({extended:false})); //Activar el midleware para convertir lo que te llega a json -> OBTIENE PETICION
app.use(body_parser.json()); //CONVIERTE LA PETICION A JSON

//CORS
// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'auth, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

//RESCRIBIR RUTAS
app.use('/api/',user_routes);
app.use('/api/',topic_routes);
app.use('/api/',comments_routes);

//EXPORTAR MODULO
module.exports=app