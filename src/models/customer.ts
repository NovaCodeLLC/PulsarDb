/**
 * Created by Thomas Lesperance on 8/2/2017.
 */
import mongoose = require('mongoose');
import { Model, Document } from "mongoose";
import { customerSchema } from "../schemas/customerSchema";
import { customer as ICustomer } from "../interfaces/customer";

export interface customerModel extends ICustomer, Document {}

export interface customerModelStatic extends Model<customerModel>{}

export const Customer = mongoose.model<customerModel, customerModelStatic>('Customer', customerSchema);