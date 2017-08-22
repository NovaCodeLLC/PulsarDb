/**
 * Created by Thomas Lesperance on 8/1/2017.
 */
import { NextFunction, Request, Response, Router } from "express";
import { User } from "../models/user";
import {Customer, customerModel} from "../models/customer";
import { Transaction } from "../models/transaction";
import { Observable } from 'rxjs/Observable';
import { CustomerClass } from "../classes/customerClass";
import "rxjs/add/observable/fromPromise";
import {UserAPI} from "./userRoute";
import {PaymentClass} from "../classes/paymentClass";
import {transactionModel} from "../models/transaction";

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

        router.get('/api/customerSchema/:email', ( req: Request, res: Response, next: NextFunction ) => {
            new CustomerRoute().list( req, res, next );
        });

        router.post('/api/customerSchema/', ( req : Request, res : Response, next : NextFunction ) =>{
           new CustomerRoute().createCustomers( req, res, next );
        });

        router.post('/api/customerSchema/fullCustCreate/', ( req: Request, res: Response, next: NextFunction) =>{
           new CustomerRoute().fullCustCreate( req, res, next )
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
     * Creates a new customer account
     *
     * @param req {Request} request body
     * @param res {Response} response object
     * @param next {NextFunction} next function
     */

    private post(req : Request, res : Response, next : NextFunction){

        //notes: the error occurs because you need to create the transaction document first
        //generate the transaction and use its ID to creat the customer object
        //once the customer is created, update the user account.

        const email = req.body.email;
        const pass = req.body.password;
        let error = null;
        const customer = new Customer(req.body);


        //check for missing data
        if(!email){

            if(!email) error = 'No email provided';

            return res.status(400).json({
                Title: "Malformed Request",
                Error: error
            });
        }

        const obsCreateUser = Observable.fromPromise(customer.save());

        //create a new user
       obsCreateUser.subscribe(
           (user) =>{
                if(user) return res.status(201).json({ Title: 'User Created', Obj: user });
                else return res.status(500).json({ Title: 'User not created', Obj: user });
           },
           (error) => { return res.status(500).json({ Title: "An Error Occurred", Obj: error })
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

        const obsCustomerList = Observable.fromPromise(User.findOne(query).populate('customers').exec());

        obsCustomerList.subscribe(
            (customers) => { res.status(200).json({ Title: "Success. Fetched list", Obj: customers.get('customers') }) },
            (error) =>     { res.status(404).json({ Title: "Error: No customers Found", Error: error})},
            () =>          { console.log(`[Customer Fetch] Pipeline completed ... `) }
        );
    }

    private createCustomersFromArray(req : Request, res : Response, next : NextFunction) : Array<CustomerClass>{

        let custArr : Array<Object> = req.body.customers;
        let firstOrderObsCustomer = Observable.fromPromise(Customer.collection.insertMany(custArr))
                                              .map((mongoObject) => {

                                                    let arrayOfCustomers = [];
                                                    mongoObject.ops.forEach((custJson) => {
                                                        arrayOfCustomers.push(
                                                            new CustomerClass(
                                                                custJson.firstName,
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
            (mongoObject) => {

                console.log(mongoObject);
                let args = {
                    req: req,
                    res: res,
                    customer: mongoObject,
                };
                UserAPI.updateCustomerArray(args) }, //ops array is the second argument in the Json with the document data.
            (error) => { return error },

        );
        return;
    }

    /**
     * Creates a new customer object.  This is to include a transaction, appointment date, appointment time, and a quote
     * @param {Request} req
     * @param {Response} res
     * @param {e.NextFunction} next
     */
    private fullCustCreate( req: Request, res: Response, next: NextFunction) {
        //some constants for creating the customer model later
        const firstName : String = req.body.customer.firstName;
        const lastName  : String = req.body.customer.lastName;
        const custEmail : String = req.body.customer.email;
        const phone     : String = req.body.customer.phone;

        //create the necessar payment object, then create a transaction model with it
        const payment: Object = new PaymentClass(req.body.customer.transaction.payments);
        const transaction: transactionModel = new Transaction({
            price           : req.body.customer.transaction.price,
            payments        : [JSON.stringify(payment)],
            balance         : req.body.customer.transaction.balance,
            appointmentDate : [req.body.customer.transaction.appointmentDate],
            appointmentTime : [req.body.customer.transaction.appointmentTime],
            photos          : [req.body.customer.transaction.photos],
            description     : req.body.customer.transaction.description
        });

        const transactionObs: Observable<any> = Observable.fromPromise( transaction.save() );
        const highOrderObs  : Observable<any> = transactionObs.flatMap( ( transactionDoc ) => { return transactionDoc })
                                                         .map( ( savedTransDoc : CustomerClass ) => { return savedTransDoc._id })
                                                         .flatMap( ( transID ) => {
                                                             const customer : customerModel = new Customer({
                                                                 firstName      : firstName,
                                                                 lastName       : lastName,
                                                                 email          : custEmail,
                                                                 phone          : phone,
                                                                 transaction    : [transID]
                                                             });

                                                             return Observable.fromPromise(customer.save());
                                                         })
                                                        .map( ( customerDoc ) => {
                                                            return customerDoc._id;
                                                        });

        highOrderObs.subscribe(
            (customerID) => {

                console.log(customerID);
                let args = {
                    req: req,
                    res: res,
                    customer: [customerID],
                };
                UserAPI.updateCustomerArray(args) }, //ops array is the second argument in the Json with the document data.
            (error) => { return error },

        );
        return;

    }
}