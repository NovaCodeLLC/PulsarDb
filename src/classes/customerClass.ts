/**
 * Created by tlesperance on 8/10/17.
 */

import {customer} from "../interfaces/customer";

export class CustomerClass implements customer{
    constructor(public firstName : String,
                public lastName : String,
                public email : String,
                public phone : String,
                public transactions : Object[],
                public _id : String){}
}