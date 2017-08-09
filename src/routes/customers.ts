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
           new CustomerRoute().post(req, res, next);
        });
    }

    /**
     * Creates a new user account
     *
     * @param req {Request} request body
     * @param res {Response} response object
     * @param next {NextFunction} next function
     */

    private post(req : Request, res : Response, next : NextFunction){
        const email = req.body.email;
        const pass = req.body.password;
        let error = null;
        const user = new User(req.body);


        //check for missing data
        if(!email || !pass){

            if(!email && !pass) error = 'No email or password provided';
            else if(!email && pass) error = 'No email address provided';
            else error = 'No password provided';

            res.sendStatus(400).json({
                Title: "Malformed Request",
                Error: error
            });
        }

        const obsCreateUser = new Observable.fromPromise(user.save());

        //create a new user
       obsCreateUser.subscribe(
           (user) =>{
                if(user) res.send(201).json({ Title: 'User Created', Obj: user });
                else res.send(500).json({ Title: 'User not created', Obj: user });
           },
           (error) => { res.send(500).json({ Title: "An Error Occurred", Obj: error })
           },
           () => { console.log('User flow has finished.') }
       );
    }

    /**
     * Sends customerSchema Json with a 200 response code
     *
     * @param {Request} req request body
     * @param {Response} res response object
     * @param {NextFunction} next next function
     */
    private list(req: Request, res : Response, next : NextFunction) {
        const EMAIL_ID : string = req.params.email;

        //validate ID parameter exists
        if(EMAIL_ID === undefined){
            res.sendStatus(404);
            next();
            return;
        }

        //grab id
        const query: Object = {email: EMAIL_ID};
        console.log(`[found param: ID] ${query}`);

        const obsCustomerList = new Observable(User.findOne(query).populate('Customers').exec());

        obsCustomerList.subscribe(
            (customers) => { res.status(200).json({ Title: "Success. Fetched list", Obj: customers }) },
            (error) =>     { res.status(404).json({ Title: "Error: No customers Found", Error: error})},
            () =>          { console.log(`[Customer Fetch] Pipeline completed ... `) }
        );
    }
}