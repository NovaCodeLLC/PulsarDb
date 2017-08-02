/**
 * Created by Thomas Lesperance on 8/1/2017.
 */

import{ NextFunction, Request, Response, Router } from "express";
import{ BaseRoute } from "./route";


export class TestRoute extends BaseRoute {

    private json : Object[] = [{ title: 'heyo'}, {title: 'you suck'}];

    /**
     * @class TestRoute
     * @constructor
     */
    constructor(){
        super();
    }

    /**
     * sends a customer Json object
     *
     * @param {e.Router} router express router instance
     */
    public static getCustomer(router : Router) {
        console.log("[customerRoute :: get] Getting cust list");

        router.get('/customer', (req: Request, res: Response, next: NextFunction) => {
            new TestRoute().sendJson(req, res, next);
        });
    }

    /**
     * Sends customer Json with a 200 response code
     *
     * @param {e.Request} req request body
     * @param {e.Response} res response object
     * @param {e.NextFunction} next next function
     */
    private sendJson(req: Request, res : Response, next : NextFunction){
        res.status(200).send(this.json);
    }
}