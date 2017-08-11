/**
 * Created by Thomas Lesperance on 8/1/2017.
 */
import mongoose = require('mongoose');
import { NextFunction, Request, Response, Router } from "express";
import { User } from "../models/user";
import { Customer } from "../models/customer";
import { Observable } from 'rxjs/Observable';
import { CustomerClass } from "../classes/customerClass";
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
           new CustomerRoute().createCustomers(req, res, next);
        });
    }

    /**
     * Static method used to create customer documents when an application route requires a dependency of creating
     * a customer object first.  This decouples the code, make for better tests, and maintainability of routes.
     *
     * @param req {Request}
     * @param res {Response}
     * @param next {NextFunction}
     *
     * @returns an array of user objects that represents the newly created documents.
     */
    private createCustomers(req : Request, res: Response, next : NextFunction) {
        if (Array.isArray(req.body.customers)){ this.createCustomersFromArray(req, res, next)}
        else { this.post(req, res, next) }
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

        const obsCreateUser = Observable.fromPromise(user.save());

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

        const obsCustomerList = Observable(User.findOne(query).populate('Customers').exec());

        obsCustomerList.subscribe(
            (customers) => { res.status(200).json({ Title: "Success. Fetched list", Obj: customers }) },
            (error) =>     { res.status(404).json({ Title: "Error: No customers Found", Error: error})},
            () =>          { console.log(`[Customer Fetch] Pipeline completed ... `) }
        );
    }

    private createCustomersFromArray(req : Request, res : Response, next : NextFunction) : Array<CustomerClass>{
        let custArr : Array<Object> = req.body.documents;
        let firstOrderObsCustomer = Observable.fromPromise(Customer.collection.insertMany(custArr))
                                              .map((mongoObject) => {

                                                    let arrayOfCustomers = [];

                                                    mongoObject.ops.forEach((custJson) => {
                                                        arrayOfCustomers.push(
                                                            new CustomerClass(
                                                                custJson.fistName,
                                                                custJson.lastName,
                                                                custJson.email,
                                                                custJson.phone,
                                                                custJson.transactions,
                                                                custJson._id
                                                            ));
                                                    });

                                                    return arrayOfCustomers;
                                              });

        firstOrderObsCustomer.subscribe(
            (mongoObject) => { return mongoObject.ops }, //ops array is the second argument in the Json with the document data.
            (error) => { return error },

        );
        return;
    }
}