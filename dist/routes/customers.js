"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const route_1 = require("./route");
class TestRoute extends route_1.BaseRoute {
    constructor() {
        super();
        this.json = [{ title: 'heyo' }, { title: 'you suck' }];
    }
    static getCustomer(router) {
        console.log("[customerRoute :: get] Getting cust list");
        router.get('/customer', (req, res, next) => {
            new TestRoute().sendJson(req, res, next);
        });
    }
    sendJson(req, res, next) {
        res.status(200).send(this.json);
    }
}
exports.TestRoute = TestRoute;
