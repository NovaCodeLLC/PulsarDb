/**
 * Created by Thomas Lesperance on 8/2/2017.
 */

import {Schema} from "mongoose";
import {customerSchema} from "./customerSchema";

/**
 User schema that will be used to define its respective model
 */
export var userSchema : Schema = new Schema({
    email: {type: String, required: true},
    password : {type: String, required: true},
    customers: [{type: Schema.Types.ObjectId, ref: 'Customer'}],
});