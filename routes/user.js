'use-strict'

var express=require('express');
var UserController=require("../controllers/user");
var router=express.Router();
var md_auth=require("../middlewares/auth");
var multipart=require('connect-multiparty')
var md_upload=multipart({uploadDir:'./uploads/users'});

router.get("/probando",UserController.prueba);
router.post("/testeando",UserController.test);

router.post("/register",UserController.saveUser);
router.post("/login",UserController.login);
router.put("/update",md_auth.auth,UserController.update);
router.post("/uploadAvatar/:id",[md_upload,md_auth.auth],UserController.uploadAvatar)
router.get("/avatar/:fileName",UserController.avatar);
router.get("/users",UserController.getUsers);
router.get("/user/:userId",UserController.getUser);

module.exports=router;