/**
 * Created by Thomas Lesperance on 8/4/2017.
 */
import { Request, Response, NextFunction, Router } from 'express';
import { Transaction } from "../models/transaction";
import * as mongoose from "mongoose";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/fromPromise";
import * as jwt from "express-jwt";
import {isArray, isNullOrUndefined} from "util";


/**
 * /route
 *
 * @class Transaction
 */
export class TransactionAPI {

    /**
     * sends a Transaction Json object or parts of the transaction object dependent upon route
     *
     * @param {e.Router} router express router instance
     * @param jwtAuth Auth0 token for security
     */
    public static create(router : Router, jwtAuth : any) {
        console.log("[TransactionRoute :: create] Creating Transaction route ...");

        router.post('/api/Transaction/:emailID/', ( req : Request, res : Response, next : NextFunction ) => {
           new TransactionAPI().createNew( req, res, next );
        });

        /* note that all patch routes use the same method. Some may ask why.  The answer is: This was done because initially
         * each one had a separate route, but the core code was nearly identical in all these cases.  It didn't make sense to have
         * 8 separate functions that all had repeating code with some minor tweaks. The code was refactored into a single function
         * that preserved the core and only modified the small parts necessary to run the desired function.
         *
         * The code was made in such a way that if future changes require the base to be modified, new functions can be added to
         * change the behavior without touching the previous code.  Do not destroy this moment of brilliance without consulting me
         * or I'm likely to can your ass faster than you can blink.  Alteration of this code can destroy all the update / delete/ and save
         * features for the appointments and payments.
         */
        router.patch('/api/Transaction/NewPayAppoint/', ( req: Request, res: Response, next: NextFunction ) => {
            new TransactionAPI().updatePaymentOrAppointmentData(req, res, next, ARRAY_UPDATE_OPTIONS.Push);
        });

        router.patch('/api/Transaction/RemovePayAppoint/', ( req: Request, res: Response, next: NextFunction ) => {
           new TransactionAPI().updatePaymentOrAppointmentData(req, res, next, ARRAY_UPDATE_OPTIONS.Pull);
        });

        router.patch('/api/Transaction/EditPayAppoint/', ( req: Request, res: Response, next: NextFunction ) => {
            new TransactionAPI().updatePaymentOrAppointmentData(req, res, next, ARRAY_UPDATE_OPTIONS.Update);
        });

        router.put('/api/Transaction/EditWholeTransaction', ( req: Request, res: Response, next: NextFunction ) => {
           new TransactionAPI().updateTransactionObject( req, res, next );
        });
    }

    /**
     * Creates a new Transaction object in its entirety
     *
     * @param {Request} req
     * @param {Response} res
     * @param {e.NextFunction} next
     */
    private createNew (req : Request, res : Response, next : NextFunction) {
        const transaction = new Transaction(req.body);

        transaction.save().then(transaction => {
            res.status(201).json({
                Title: "Transaction Created",
                Transaction: transaction
            });

            next();
            return;
        })
    }

    /**
     * This is a highly flexible and powerful method.
     *
     * This method can be run to save / delete / and update the appointment arrays (time / date) or the payment Object array.
     *
     * The method decides what data to act upon based on the data available in the request body.
     * The type of update to be performed is based on the update parameter that is supplied to the method
     *
     * @param {Request} req : router request object
     * @param {Response} res : router response object
     * @param {NextFunction} next : router next object
     * @param {ARRAY_UPDATE_OPTIONS} updateType : Selects the type of update to perform.
     */
    private updatePaymentOrAppointmentData(req: Request, res: Response, next: NextFunction, updateType: ARRAY_UPDATE_OPTIONS) {
        //check what data is on the body to determine what fields we will be updating
        const transactionID : any = req.body.transactionID;
        const appointmentCheck = +!isNullOrUndefined(req.body.appointmentTime) && +!isNullOrUndefined(req.body.appointmentDate);
        const paymentCheck = (+!isNullOrUndefined(req.body.payments));

        //create a few objects that will contain our mongo update
        let updateObj : Object;
        let update : Object;

        //if the body is data, this block fills out the update object to handle changes to the appointment Date / Time arrays
        if(appointmentCheck) {

            switch (+updateType){
                case ARRAY_UPDATE_OPTIONS.Update:
                    let appointmentDateInd = req.body.appointmentDateInd;
                    let appointmentTimeInd = req.body.appointmentTimeInd;

                    updateObj = {};

                    if(!isArray(appointmentTimeInd) && !isArray(appointmentDateInd)) {
                        updateObj[`appointmentDate.${appointmentDateInd}`] = req.body.appointmentDate;
                        updateObj[`appointmentTime.${appointmentTimeInd}`] = req.body.appointmentTime;
                    } else if ( isArray(appointmentTimeInd) && isArray(appointmentDateInd) ) {
                        for( let i = 0; i < req.body.appointmentDate.length; i++) {
                            updateObj[i] = {
                                appointmentDate: req.body.appointmentDate[i],
                                appointmentTime: req.body.appointmentTime[i]
                            };
                        }
                    } else {
                        res.sendStatus(400);
                        next();
                        return;
                    }
                    break;

                default:
                    if(!isArray(req.body.appointmentDate) && !isArray(req.body.appointmentTime)) {
                        updateObj = {
                            appointmentDate: req.body.appointmentDate,
                            appointmentTime: req.body.appointmentTime
                        };
                    } else if (isArray(req.body.appointmentDate) && isArray(req.body.appointmentTime)) {
                        for( let i = 0; i < req.body.appointmentDate.length; i++) {
                            updateObj[i] = {
                                appointmentDate: req.body.appointmentDate[i],
                                appointmentTime: req.body.appointmentTime[i]
                            };
                        }
                    } else {
                        res.sendStatus(400);
                        next();
                        return;
                    }
                    break;
            }
        }

        //check if it's payment data in the body.  If there is payment data, this block will populate the updateObj to fit
        //the expected format.
        if(paymentCheck) {
            switch (+updateType) {

                //Push vs Pull: Form the object based on the type of update.  If pull, delete by object ID.
                case ARRAY_UPDATE_OPTIONS.Push:
                    //single item vs batch
                    if(!isArray(req.body.payments)) {
                        updateObj = {
                            payments: {
                                transactionDate: new Date(req.body.payments.transactionDate).toISOString(),
                                amount: req.body.payments.amount,
                            }
                        };
                    } else {
                        for( let i = 0; i < req.body.payments.length; i++) {
                            updateObj = {
                                payments: {
                                    transactionDate: new Date(req.body.payments[i].transactionDate).toISOString(),
                                    amount: req.body.payments[i].amount,
                                }
                            };
                        }
                    }
                    break;

                case ARRAY_UPDATE_OPTIONS.Pull:

                    //logic for single items vs batch pull
                    if(!isArray(req.body.payments)) {
                        updateObj = {payments: {_id: new mongoose.Types.ObjectId(req.body.payments._id)}};
                    } else {
                        for( let i = 0; i < req.body.payments.length; i++){
                            updateObj = {payments: {_id: new mongoose.Types.ObjectId(req.body.payments[i]._id)}};
                        }
                    }
                    break;

                case ARRAY_UPDATE_OPTIONS.Update:
                    let ind = req.body.paymentIndex;
                    updateObj = {};

                    //logic for single vs batch update
                    if(!isArray(ind)) {
                        updateObj[`payments.${ind}`] = {
                            amount: req.body.payments.amount,
                            transactionDate: new Date(req.body.payments.transactionDate).toISOString()
                        };
                    } else {
                        for( let i = 0; i < ind.length; i++){
                            updateObj[`payments.${ind[i]}`] = {
                                amount: req.body.payments[i].amount,
                                transactionDate: new Date(req.body.payments[i].transactionDate).toISOString()
                            }
                        }
                    }
                    break;
            }

        }

        //if neither appointment or payment data exists, or both items exist on the same request, then return malformed request.
        if(!(paymentCheck ^ appointmentCheck)){
            res.sendStatus(400);
            next();
            return;
        }

        //checks the type of update and creates the query object to send
        switch (+updateType){
            case ARRAY_UPDATE_OPTIONS.Pull:
                update = { $pull: updateObj };
                break;

            case ARRAY_UPDATE_OPTIONS.Push:
                update = { $push: updateObj };
                break;

            case ARRAY_UPDATE_OPTIONS.Update:
                update = { $set: updateObj };
        }

        //create the observable
        const promise = Transaction.findOneAndUpdate({_id: new mongoose.Types.ObjectId(transactionID)}, update, {new: true}).exec();
        const obsUpdate = Observable.fromPromise(promise);

        //send updates and subscribe to the server response
        obsUpdate.subscribe(
            (transaction: any) => {

                let updateInfo;

                //based on the type of data sent, we alter what data will be returned to the client
                if(appointmentCheck) {
                    updateInfo = {
                        appointmentDate: transaction.appointmentDate[transaction.appointmentDate.length - 1],
                        appointmentTime: transaction.appointmentTime[transaction.appointmentTime.length - 1]
                    };
                } else {
                    updateInfo = transaction.payments[transaction.payments.length - 1];
                }

                //if all good, send 200 code and the updated item
                if (transaction) res.status(200).json({Title: 'New payment added', Obj: updateInfo});

                //if nothing found, return 500 and whatever object is returned
                if (!transaction) res.status(500).json({Title: 'Item not Found', Obj: updateInfo});

                next();
                return;
            },
            (err) => {
                //errors produce a 400 code and send back the error object
                return res.status(400).json({Title: 'An error ocurred', Error: err})
            },
            () => {
                //placemarker code to determine if server is working nicely.  will place these on environment test later.
                console.log('[Appointment Update] Pipeline complete ...')
            }
        );
    }

    updateTransactionObject( req: Request, res: Response, next: NextFunction ) {
        //needed queries for finding the transaction object and the update
        let updateQuery = {
            price: req.body.price,
            payments: req.body.payments,
            balance: req.body.balance,
            appointmentDate: req.body.appointmentDate,
            appointmentTime: req.body.appointmentTime,
            photos: req.body.photos,
            description: req.body.description,
        };
        let searchCriteria = { _id: new mongoose.Types.ObjectId( req.body._id ) };

        //create and observbable from the mongoose promise.  Request the updated object be returned from the DB.
        let update = Observable.fromPromise(
            Transaction.findByIdAndUpdate( searchCriteria, updateQuery, {new: true} ).exec()
        );

        update.subscribe(
            ( updatedTransaction : any ) => {
                //if all good, send 200 code and the updated item
                if (updatedTransaction) res.status(200).json({Title: 'New payment added', Obj: updatedTransaction});

                //if nothing found, return 500 and whatever object is returned
                if (!updatedTransaction) res.status(500).json({Title: 'Item not Found', Obj: updatedTransaction});

                next();
                return;
            },
            (err) => {
                //errors produce a 400 code and send back the error object
                return res.status(400).json({Title: 'An error ocurred', Error: err})
            },
            () => {
                //placemarker code to determine if server is working nicely.  will place these on environment test later.
                console.log('[Appointment Update] Pipeline complete ...')
            }
        );

    }
}

/**
 * Enumeration class to determine the type of update to run on an array
 *
 * Options:
 *
 * Pull : Remove item from array
 * Push : Add item to array
 * Update : Update existing value
 */
export enum ARRAY_UPDATE_OPTIONS {
    Pull,
    Push,
    Update
}