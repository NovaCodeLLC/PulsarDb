/**
 * Created by Thomas Lesperance on 8/2/2017.
 */
import {Schema} from "mongoose";

/**
Customer schema that will be used to define its respective model
 */
export var customerSchema : Schema = new Schema({
    createdAt: {type: Date, default: Date.now},
    firstName: {type: String, required: true},
    lastName : {type: String, required: true},
    email    : {type: String, required: false},
    phone    : {type: String, required: false},
    transactions : [{type: Schema.Types.ObjectId , ref: 'Transaction'}],
});