/**
 * Created by Thomas Lesperance on 8/4/2017.
 */
import { Request, Response, NextFunction, Router } from 'express';
import {isNull, isUndefined} from "util";
import {Transaction} from "../models/transaction";

export class TransactionAPI {

    public static create(router : Router) {
        router.post('/api/Transaction/:emailID', (req : Request, res : Response, next : NextFunction) => {
           new TransactionAPI().createNew(req, res, next);
        });
    }

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
}