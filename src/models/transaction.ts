/**
 * Created by Thomas Lesperance on 8/2/2017.
 */
import mongoose = require('mongoose');
import { Model, Document } from "mongoose";
import { transactionSchema } from "../schemas/transactionSchema";
import { Transaction as ITransaction } from "../interfaces/transaction";

export interface transactionModel extends ITransaction, Document {}

export interface transactionModelStatic extends Model<transactionModel>{}

export const Transaction = mongoose.model<transactionModel, transactionModelStatic>('Transaction', transactionSchema);