/**
 * Created by Thomas Lesperance on 8/1/2017.
 */
import{ NextFunction, Request, Response, Router } from "express";
import{ BaseRoute } from "./route";
import * as jwt from "express-jwt";

/**
 *
 * /route
 *
 * @class Customer
 */

export class IndexRoute extends BaseRoute {

    /**
     * @class IndexRoute
     * @constructor
     */
    constructor(){
        super();
    }

    /**
     * Create the routes
     *
     * @class IndexRoute
     * @method create
     * @static
     * @param {e.Router} router
     */
    public static create(router : Router, jwtAuth : any){
        //log
        console.log("[IndexRoute::create] Creating index route.");

        //add home page route
        router.get("/", (req : Request, res : Response, next: NextFunction) => {
           new IndexRoute().index(req, res, next);
        });
    }

    public index(req : Request, res : Response, next : NextFunction){
        //set custom title
        this.title = "Home | Pulsar";

        const options: Object ={
            "message": "Welcome to Pulsar"
        };

        this.render(req, res, "index", options);
    }
}