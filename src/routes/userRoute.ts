/**
 * Created by tlesperance on 8/3/17.
 */
import { User } from '../models/user';
import { Request, Response, NextFunction, Router } from 'express';
import {isNull, isUndefined} from "util";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/fromPromise";
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/mergeAll'
import 'rxjs/add/operator/bufferCount';
import { Customer } from "../models/customer";

/**
 * @class UserAPI
 */
export class UserAPI{
    private EMAIL_ID : string = 'email';
    private PASS: string = 'password';

    /**
     * Create the api
     * @static
     */
    public static create(router : Router){
        router.post('/api/User/', (req : Request, res : Response, next : NextFunction) =>{
          new UserAPI().createNew(req, res, next);
        });

        router.get('/api/User/:email/:searchString', (req : Request, res : Response, next : NextFunction) =>{
           new UserAPI().get(req, res, next);
        });

        router.put('/api/User/', (req : Request, res : Response, next : NextFunction) =>{
            new UserAPI().put(req,res,next);
        })
    }

    /**
     * Generates a new User in its corresponding collection.
     *
     * @param {e.Request} req
     * @param {e.Response} res
     * @param {e.NextFunction} next
     */
    private createNew(req : Request, res : Response, next : NextFunction){

        //populate the model
        const user = new User({
            email : req.body.email,
            password : req.body.password,
            customers: []
        });

        //generate necessary constants for error checking and instance creation
        let error = null;

        //check for missing data. Send 400 - malformed request - if field is missing.
        if(!req.body.email || !req.body.password){

            if(!req.body.email && !req.body.password) error = 'No email or password provided';
            else if(!req.body.email && req.body.password) error = 'No email address provided';
            else error = 'No password provided';

            res.status(400).json({
                Title: "Malformed Request",
                Error: error
            });
        }

        //create a new user
        console.log('[Saving] ...');

        //create observables
        const userObserv = Observable.fromPromise(user.save());

        //generate response / handle errors.
        userObserv.subscribe(
            (user) => { res.status(200).send(user.toObject()); },
            (error) => {
                res.status(404).json({ Title : "Item Not Found", Error: error}); },
            () => {console.log('[Saved] Created new User')}
        );
    }

    /**
     * get a specified user's profile.
     *
     * @param req {Request} request
     * @param res {Response} response
     * @param next {NextFunction} next
     *
     * @return void
     */
    private get(req : Request, res : Response, next : NextFunction){


        //validate that we have a valid request
        if(isUndefined(req.params[this.EMAIL_ID])){
            res.sendStatus(404);
            next();
            return;
        }

        const email : string = req.params[this.EMAIL_ID];
        console.log(`[Email Found] ${email}`);

        User.findOne({"email" : `${email}`}).then(user=> {
            console.log(`[Document] ${user}`)
            if (isNull(user)) {
                res.sendStatus(404);
                return;
            }

            //add password / token check here.  Nobody should ever have access without authorized credentials.

            res.send(user.toObject());
            next();
            return;
        }).catch(next);
    }

    /**
     * Update the profile for a specified user's profile.
     *
     * @param req {Request} request
     * @param res {Response} response
     * @param next {NextFunction} next
     */
    private put(req : Request, res : Response, next : NextFunction){

        //initialize variables
        let email : string = req.body.email;
        let bodyCustomers : Array<Object> = req.body.customers;
        let custIDs : Array<Object> = [];
        let custArr2Obs : Observable<any>;

        // Check for customers in the request array
        // Then create customer documents and a promise for each one using the .save() method
        // Once the promises are created, make them into observables, and store them to the array
        if(bodyCustomers && bodyCustomers.length > 0){
            custArr2Obs = Observable.from(Customer.collection.insertMany(bodyCustomers));
        }

        //check data integrity
        if(!email){

            let error = 'No email provided';

            res.sendStatus(400).json({
                Title: 'Malformed Request',
                Error: error
            });
        }

        //Get update fields, create a query object, setup the object that will tell the database what it needs to update.
        const query : Object = {email : email};

        const custObs = custArr2Obs
            .map(custArr => {
                for(let index in custArr.ops){
                    console.log(custArr.ops[index], index);
                    custIDs.push(custArr.ops[index]._id);
                }
                return custIDs;
            })
            //creates FindOneAndUpdate promise that updates the user object with all of the customer IDs
            .flatMap((customerIDs) =>{
                const update : Object = {'$set' : {'email' : email}, '$addToSet' : {'customers' : {'$each': customerIDs}}};
                const userPromise = User.findOneAndUpdate(query, update,{new: true}).exec();
                return Observable.fromPromise(userPromise);
            });

        //subscribe to the master observable and profit hard.
        custObs.subscribe(
            (user)=> {
                            //check for nonexistent user.
                            if(isUndefined(user)){
                                res.sendStatus(404);
                            }
                            //send back confirmation of update.
                            res.status(201).json({ Title: "User information has been update", User: user });
                            },
            (error) =>{ res.status(500).json({ Title: "An Error has occurred", Error: error }) },
         () =>     { console.log(`[Created Customers]... \n[Updated User with Customer ID References] ...`) }
        );
    }
}