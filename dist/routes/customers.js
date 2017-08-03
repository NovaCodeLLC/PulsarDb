"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const route_1 = require("./route");
const user_1 = require("../models/user");
const mongoose = require("mongoose");
class CustomerRoute extends route_1.BaseRoute {
    constructor() {
        super();
    }
    static getCustomer(router) {
        console.log("[customerRoute :: get] Getting cust list");
        router.get('/customerSchema/:id', (req, res, next) => {
            new CustomerRoute().list(req, res, next);
        });
    }
    list(req, res, next) {
        const PARAM_ID = "id";
        if (req.params[PARAM_ID] === undefined) {
            res.sendStatus(404);
            next();
            return;
        }
        const id = req.params[PARAM_ID];
        let stuff = mongoose.Types.ObjectId(id);
        console.log(`[found param: ID] ${id}`);
        user_1.User.findById(stuff).populate('Customers').then((userProfile) => {
            console.log(`[userProfile object] ${userProfile}`);
            if (userProfile === null) {
                res.sendStatus(404);
                next();
                return;
            }
            res.json(userProfile.customers);
        }).catch(next);
    }
}
exports.CustomerRoute = CustomerRoute;
