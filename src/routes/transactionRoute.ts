/**
 * Created by Thomas Lesperance on 8/4/2017.
 */
import { Request, Response, NextFunction, Router } from 'express';
import {Transaction} from "../models/transaction";
import * as mongoose from "mongoose";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/fromPromise";
import * as jwt from "express-jwt";
import {isNullOrUndefined} from "util";

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
        router.patch('/api/Transaction/NewPayment/', ( req: Request, res: Response, next: NextFunction ) => {
            new TransactionAPI().updatePaymentOrAppointmentData(req, res, next, ARRAY_UPDATE_OPTIONS.Push_update);
        });

        router.patch('/api/Transaction/NewAppointment/', ( req: Request, res: Response, next: NextFunction ) => {
            new TransactionAPI().updatePaymentOrAppointmentData(req, res, next, ARRAY_UPDATE_OPTIONS.Push_update);
        });

        router.patch('/api/Transaction/RemovePayment/', ( req: Request, res: Response, next: NextFunction ) => {
           new TransactionAPI().updatePaymentOrAppointmentData(req, res, next, ARRAY_UPDATE_OPTIONS.Pull_update);
        });

        router.patch('/api/Transaction/RemoveAppointment/', ( req: Request, res: Response, next: NextFunction ) => {
            new TransactionAPI().updatePaymentOrAppointmentData(req, res, next, ARRAY_UPDATE_OPTIONS.Pull_update);
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
        const transactionID : any = req.body.transactionID;
        const appointmentCheck = +!isNullOrUndefined(req.body.appointmentTime) && +!isNullOrUndefined(req.body.appointmentDate);
        const paymentCheck = (+!isNullOrUndefined(req.body.payments));

        let updateObj : Object;
        let update : Object;

        //check what is in the request to decide what data to cobble together for the update Object that will be sent
        if(appointmentCheck) {
            updateObj = {
                appointmentDate: req.body.appointmentDate,
                appointmentTime: req.body.appointmentTime
            };
        }

        if(paymentCheck) {
            switch (+updateType) {

                //Push vs Pull: Form the object based on the type of update.  If pull, delete by object ID.
                case ARRAY_UPDATE_OPTIONS.Push_update:
                    updateObj = {
                        payments: {
                            transactionDate: req.body.payments.transactionDate,
                            amount: req.body.payments.amount,
                        }
                    };
                    break;

                case ARRAY_UPDATE_OPTIONS.Pull_update:
                    updateObj = { payments: { _id: new mongoose.Types.ObjectId(req.body.payments._id) } };
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
            case ARRAY_UPDATE_OPTIONS.Pull_update:
                update = { $pull: updateObj };
                break;

            case ARRAY_UPDATE_OPTIONS.Push_update:
                update = { $push: updateObj };
                break;
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

                if (transaction) res.status(200).json({Title: 'New payment added', Obj: updateInfo});

                if (!transaction) res.status(500).json({Title: 'Item not Found', Obj: updateInfo});

                next();
                return;
            },
            (err) => {
                return res.status(400).json({Title: 'An error ocurred', Error: err})
            },
            () => {
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
 * Pull_update,
 * Push_update
 */
export enum ARRAY_UPDATE_OPTIONS {
    Pull_update,
    Push_update,
}