/**
 * Created by Thomas Lesperance on 8/13/2017.
 */
import {userAccountProfile} from "../interfaces/user";
import {CustomerClass} from "./customerClass";

export class UserClass implements userAccountProfile {
    constructor( public email    : String,
                 public password : String,
                 public customers : CustomerClass[]){}
}