'use-strict'

var mongoose=require('mongoose');
var mongoosePaginate=require('mongoose-paginate-v2')

var Schema=mongoose.Schema;
//Model comentarios
var comentSchema=Schema({
    content: String,
    date: {type: Date, default: Date.now},
    user: {type: Schema.ObjectId, ref: "User"}
})

//Model topics
var topicSchema=Schema({
    tittle: String,
    content: String,
    code: String,
    lang: String,
    date: {type: Date, default: Date.now},
    user: {type: Schema.ObjectId, ref: "User"},
    coments: [comentSchema]
})

//Cargar paginacion
topicSchema.plugin(mongoosePaginate);

module.exports=mongoose.model('Topics',topicSchema)