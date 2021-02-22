'use-strict'
var express=require('express');
var CommentsController=require("../controllers/comments");
var router=express.Router();
var md_auth=require("../middlewares/auth");


router.post("/comment/topic/:topicId",md_auth.auth,CommentsController.add);
router.put("/comment/:commentId",md_auth.auth,CommentsController.update);
router.delete("/comment/:topicId/:commentId",md_auth.auth,CommentsController.delete);

module.exports=router;