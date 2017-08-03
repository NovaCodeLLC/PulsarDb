/**
 * Created by tlesperance on 8/3/17.
 */
import mongoose = require('mongoose');
import { User } from '../models/user';
import { Request, Response, NextFunction, Router } from 'express';
import {isUndefined} from "util";

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

        router.get('/api/User/:email', (req : Request, res : Response, next : NextFunction) =>{
           new UserAPI().get(req, res, next);
        });

        router.put('/api/User/:email', (req : Request, res : Response, next : NextFunction) =>{
            new UserAPI().put(req,res,next);
        })
    }

    private createNew(req : Request, res : Response, next : NextFunction){
        //generate necessary constants for error checking and instance creation
        const user = new User(req.body);
        let error = null;

        //check for missing data. Send 400 - malformed request - if field is missing.
        if(!req.body[this.EMAIL_ID] || !req.body[this.PASS]){

            if(!req.body[this.EMAIL_ID] && !req.body[this.PASS]) error = 'No email or password provided';
            else if(!req.body[this.EMAIL_ID] && req.body[this.PASS]) error = 'No email address provided';
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
     * get a specified user's profile.
     *
     * @param req {Request} request
     * @param res {Response} response
     * @param next {NextFunction} next
     */
    private get(req : Request, res : Response, next : NextFunction){


        //validate that we have a valid request
        if(isUndefined(req.params[this.EMAIL_ID])){
            res.sendStatus(404);
            next();
            return;
        }

        const email : string = req.params[this.EMAIL_ID];

        User.findOne({email : email}).then(user=> {
            if (user === null) {
                res.sendStatus(404).json({Title: 'Not Found', Message: "The requested user could not be found"})
            }

            //add password / token check here.  Nobody should ever have access without authorized credentials.

            res.send(user.toObject());
            next();
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
        let error = null;

        if(!req.body[this.EMAIL_ID] || !req.body[this.PASS]){

            if(!req.body[this.EMAIL_ID] && !req.body[this.PASS]) error = 'No email or password provided';
            else if(!req.body[this.EMAIL_ID] && req.body[this.PASS]) error = 'No email address provided';
            else error = 'No password provided';

            res.sendStatus(400).json({
                Title: 'Malformed Request',
                Error: error
            });
        }

        //Get update fields, create a query object, setup the object that will tell the database what it needs to update.
        let email : string = req.body[this.EMAIL_ID];
        let password : string = req.body[this.PASS];
        const query : Object = {email : req.body[this.EMAIL_ID]};
        const update : Object = {$set : {email : email, password: password}};

        //save changes
        User.findOneAndUpdate(query, update).then(user => {

            //check for nonexistent user.
            if(isUndefined(user)){
                res.sendStatus(404);
            }

            //send back confirmation of update.
            res.status(201).json({ Title: "User information has been update" });
        }).catch(next);
    }
}