/**
 * Created by Thomas Lesperance on 8/12/2017.
 */
import e = require("express");

export interface CustomerConfigJSON {
    req : e.Request,
    res : e.Response,
    customer : Array<Object>,
    bool? : boolean
}