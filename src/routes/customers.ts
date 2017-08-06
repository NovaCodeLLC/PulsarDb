/**
 * Created by Thomas Lesperance on 8/1/2017.
 */
import mongoose = require('mongoose');
import { NextFunction, Request, Response, Router } from "express";
import { User } from "../models/user";
import { Customer } from "../models/customer";

/**
 *
 * /route
 *
 * @class Customer
 */

export class CustomerRoute {

    /**
     * sends a customerSchema Json object
     *
     * @param {e.Router} router express router instance
     */
    public static create(router : Router) {
        console.log("[customerRoute :: get] Getting cust list");

        router.get('/api/customerSchema/:email', (req: Request, res: Response, next: NextFunction) => {
            new CustomerRoute().list(req, res, next);
        });

        router.post('/api/customerSchema/', (req : Request, res : Response, next : NextFunction) =>{
           new CustomerRoute().createNew(req, res, next);
        });
    }

    /**
     * Creates a new user account
     *
     * @param req {Request} request body
     * @param res {Response} response object
     * @param next {NextFunction} next function
     */

    private createNew(req : Request, res : Response, next : NextFunction){
        const EMAIL: string = 'email';
        const PASS: string = 'password';

        let error = null;
        const user = new User(req.body);


        //check for missing data
        if(!req.body[EMAIL] || !req.body[PASS]){

            if(!req.body[EMAIL] && !req.body[PASS]) error = 'No email or password provided';
            else if(!req.body[EMAIL] && req.body[PASS]) error = 'No email address provided';
            else error = 'No password provided';

            res.sendStatus(400).json({
                Title: "Malformed Request",
                Error: error
            });
        }

        //create a new user
        user.save().then(user => {
           res.json(user.toObject());
           next();
           return;
        }).catch(next);
    }

    /**
     * Sends customerSchema Json with a 200 response code
     *
     * @param {Request} req request body
     * @param {Response} res response object
     * @param {NextFunction} next next function
     */
    private list(req: Request, res : Response, next : NextFunction) {
        const EMAIL_ID : string = "email";

        //validate ID parameter exists
        if(req.params[EMAIL_ID] === undefined){
            res.sendStatus(404);
            next();
            return;
        }

        //grab id

        const id: string = req.params[EMAIL_ID];
        const query: Object = {email: id};
        console.log(`[found param: ID] ${query}`);

        User.findOne(query).populate('Customers').then((userProfile : any) => {
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