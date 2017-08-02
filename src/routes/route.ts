/**
 * Created by Thomas Lesperance on 8/1/2017.
 */
import { NextFunction, Request, Response } from "express";

/**
 * Constructor
 *
 * @class BaseRoute
 */

export class BaseRoute {
    protected  title: string;
    private  scripts: string[];

    /**
     * Constructor
     *
     * @class BaseRoute
     * @constructor
     */
    constructor(){
        //initialize variables
        this.title = "Pulsar";
        this.scripts = [];
    }

    /**
     * Add a JS external file to the request.
     *
     *@class BaseRoute
     *@method addScript
     *@param src {string} The src to the external JS file.
     *@return {BaseRoute} Self for chaining
     */
    public addScript(src : string): BaseRoute{
        this.scripts.push(src);
        return this;
    }

    /**
     * Render a page.
     *
     * @param {Request} req The request object
     * @param {Response} res The response object
     * @param {string} view The view to render
     * @param {Object} options Additional options to append to the view's local scope
     *
     * @return void
     */
    public render(req: Request, res: Response, view: string, options?: Object){
        //add constants
        res.locals.BASE_URL = "/";

        //add scripts
        res.locals.scripts = this.scripts;

        //add title
        res.locals.title = this.title;

        //render view
        res.render(view, options);
    }
}