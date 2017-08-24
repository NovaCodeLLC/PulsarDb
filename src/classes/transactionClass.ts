/**
 * Created by Thomas Lesperance on 8/23/2017.
 */
import {Transaction} from "../interfaces/transaction";
import {PaymentClass} from "./paymentClass";

export class TransactionClass implements Transaction{
    constructor(public price : String,
                public payments : PaymentClass[],
                public balance : String,
                public appointmentDate : Date[],
                public appointmentTime : String[],
                public photos : String[],
                public description : String,
                public _id : String){}
}