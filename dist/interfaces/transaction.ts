/**
 * Created by Thomas Lesperance on 8/2/2017.
 */
import {Payment} from "./Payment";

export interface Transaction {
    price    : String,
    payments : Payment[],
    balance  : String,
    appointmentDate : Date[],
    appointmentTime : String[],
    photos   : String[],
    description : String
}