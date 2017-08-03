/**
 * Created by Thomas Lesperance on 8/2/2017.
 */
import mongoose = require('mongoose');
import { Model, Document } from "mongoose";
import { userAccountProfile as IUser } from "../interfaces/user";
import { userSchema } from "../schemas/userSchema";

export interface userModel extends IUser, Document {}

export interface userModelStatic extends Model<userModel>{}

export const User = mongoose.model<userModel, userModelStatic>('User', userSchema);