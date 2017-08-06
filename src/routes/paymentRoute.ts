/**
 * Created by Thomas Lesperance on 8/4/2017.
 */
import { Payment } from '../models/payment'
import { Request, Response, NextFunction, Router } from 'express';
import {isNull, isUndefined} from "util";

export class PaymentAPI {

    private UID : string = 'email';

    public static create( router : Router ) {

        router.post('/api/Payment', (req : Request, res : Response, next : NextFunction) => {
            new PaymentAPI().createNew(req, res, next);
        });

        // router.put('/api/Payment/:email', (req : Request, res : Response, next : NextFunction) => {
        //    new PaymentAPI().put(req,res,next);
        // });
    }

    private createNew(req : Request, res  : Response, next : NextFunction) {

        if(!req.body || isNull(req.body)){
            res.sendStatus(204 );
            next();
            return;
        }

        const payment = new Payment(req.body);

        payment.save().then(payment => {
           res.status(201).json({
               Title: "Payment Created.",
               Payment: payment
           });
           next();
           return;
        }).catch(next);
    }

    // private put(req : Request, res : Response, next : NextFunction) {
    //
    //     const email : string = req.params[this.UID];
    //
    //
    //
    // }
}