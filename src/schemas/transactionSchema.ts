/**
 * Created by Thomas Lesperance on 8/2/2017.
 */
import { Schema} from "mongoose";

/**
Transaction schema that will be used to define its respective model
 */
export var transactionSchema : Schema = new Schema({
    price: {type: String, required: true},
    payments: [{type: Schema.Types.ObjectId, ref: 'payments'}],
    balance: {type: String, required: true},
    appointmentDate: [{type: Date, required: false}],
    appointmentTime: [{type: Date, required: false}],
    photos: [{type: String, required: false}],
    description: {type: String, required: true}
});