/**
 * Created by Thomas Lesperance on 8/2/2017.
 */
import {Schema} from "mongoose";
import {Transaction} from "../interfaces/transaction";

/*
Template for system user attributes.
 */
export var userSchema : Schema = new Schema({
    createdAt: Date,
    firstName: String,
    lastName : String,
    email    : String,
    phone    : String,
    transaction : [Transaction]
});
userSchema.pre("save", function (next) {
 if(!this.createdAt){
     this.createdAt = new Date();
 }
 next();
});