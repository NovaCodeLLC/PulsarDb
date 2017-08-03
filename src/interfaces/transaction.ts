/**
 * Created by Thomas Lesperance on 8/2/2017.
 */


/**
 * Defines the attributes for the Transaction object
 */
export interface Transaction {
    price    : String,
    balance  : String,
    appointmentDate? : Date[],
    appointmentTime? : String[],
    photos?   : String[],
    description? : String
}