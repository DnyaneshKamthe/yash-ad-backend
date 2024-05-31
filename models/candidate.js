const mongoose = require('mongoose');
const Employee = require("./employee")


const candidateSchema = new mongoose.Schema({
    cName:{type:String},
    experience:{type:String},
    email:{type:String},
    number:{type:String},
    education:{type:String},
    skills:{type:String},
    currCtc:{type:String},
    expCtc:{type:String},
    notice:{type:String},
    relocate:{type:String},
    createdBy : {
        type : mongoose.Schema.ObjectId,
        ref : Employee
    }
},{
    timestamps:true
})

module.exports = mongoose.model("candidates", candidateSchema);