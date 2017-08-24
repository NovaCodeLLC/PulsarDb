/**
 * Created by Thomas Lesperance on 8/2/2017.
 */
import { Schema } from "mongoose";

/**
Transaction schema that will be used to define its respective model
 */

const paymentSchema : Schema = new Schema({
    amount: {type: String, required: false},
    transactionDate: {type: String, required: false}
});

export var transactionSchema : Schema = new Schema({
    price: {type: String, required: true},
    payments: [paymentSchema],
    balance: {type: String, required: true},
    appointmentDate: [{type: String, required: false}],
    appointmentTime: [{type: String, required: false}],
    photos: [{type: String, required: false}],
    description: {type: String, required: true}
});

