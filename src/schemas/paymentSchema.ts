/**
 * Created by Thomas Lesperance on 8/21/2017.
 */
import { Schema } from "mongoose";

export var paymentSchema : Schema = new Schema({
    amount: {type: String, required: false},
    transactionDate: {type: Date, required: false}
});