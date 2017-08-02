/**
 * Created by Thomas Lesperance on 8/2/2017.
 */
import { Transaction } from './Transaction.ts';
export interface userAccountProfile {
    firstName : String;
    lastName : String;
    email? : String;
    phone : String;
    customers: Transaction[];
}