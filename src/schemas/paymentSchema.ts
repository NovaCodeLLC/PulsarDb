/**
 * Created by Thomas Lesperance on 8/2/2017.
 */
import { Schema } from "mongoose";

/**
Payment schema that will be used to define its respective model
 */
export var paymentSchema : Schema = new Schema({
    amount: {type: String, required: false},
    transactionDate: {type: String, required: false}
});