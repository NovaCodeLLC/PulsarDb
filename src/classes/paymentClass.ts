/**
 * Created by Thomas Lesperance on 8/2/2017.
 */


import {Payment} from "../interfaces/payment";
/**
Payment schema that will be used to define its respective model
 */
export class PaymentClass implements Payment{
    constructor(public amount : String,
                public transactionDate? : Date){}
}