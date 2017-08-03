/**
 * Created by Thomas Lesperance on 8/1/2017.
 */

import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./route";
import { User } from "../models/user";
import {isUndefined} from "util";

/**
 *
 * /route
 *
 * @class Customer
 */

export class CustomerRoute extends BaseRoute {

    /**
     * @class TestRoute
     * @constructor
     */
    constructor(){
        super();
    }

    /**
     * sends a customerSchema Json object
     *
     * @param {e.Router} router express router instance
     */
    public static getCustomer(router : Router) {
        console.log("[customerRoute :: get] Getting cust list");

        router.get('/customerSchema/:id', (req: Request, res: Response, next: NextFunction) => {
            new CustomerRoute().list(req, res, next);
        });
    }

    /**
     * Sends customerSchema Json with a 200 response code
     *
     * @param {e.Request} req request body
     * @param {e.Response} res response object
     * @param {e.NextFunction} next next function
     */
    private list(req: Request, res : Response, next : NextFunction) {
        const PARAM_ID : string = "id";

        //validate ID parameter exists
        if(req.params[PARAM_ID] === undefined){
            res.sendStatus(404);
            next();
            return;
        }

        //grab id
        const id: string = req.params[PARAM_ID];
        console.log(`[found param: ID] ${id}`);

        User.findById(id).populate('Customers').then((userProfile : any) => {
            //ensure a document is returned
            console.log(`[userProfile object] ${userProfile}`);
            if(userProfile === null){
                res.sendStatus(404);
                next();
                return;
            }

           res.json(userProfile.customers);

}).catch(next);
}
}