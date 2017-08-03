/**
 * Created by Thomas Lesperance on 8/2/2017.
 */
import mongoose = require('mongoose');
import { Model, Document } from "mongoose";
import { paymentSchema } from "../schemas/paymentSchema";
import { Payment as IPayment} from "../interfaces/payment";

export interface paymentModel extends IPayment, Document {}

export interface paymentModelStatic extends Model<paymentModel>{}

export const Payment = mongoose.model<paymentModel, paymentModelStatic>('Payment', paymentSchema);