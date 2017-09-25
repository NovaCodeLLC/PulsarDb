/**
 * Created by Thomas Lesperance on 8/1/2017.
 */
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as logger from "morgan";
import * as path from "path";
import * as cors from "cors";
import errorHandler = require("errorhandler");
import methodOverride = require("method-override");
import { IndexRoute } from "./routes/index"
import { CustomerRoute } from "./routes/customers";
import morgan = require("morgan");
import * as mongoose from "mongoose";
import {mongo} from "mongoose";
import {UserAPI} from "./routes/userRoute";
import {jwtCheck} from "./Auth0.config";
import * as jwt from 'express-jwt';
import {TransactionAPI} from "./routes/transactionRoute";



/**
 * The server.
 *
 * @class Server
 */
export class Server {

    public app: express.Application;

    /**
     * Bootstrap the application.
     *
     * @class Server
     * @method bootstrap
     * @static
     * @return {ng.auto.IInjectorService} Returns the newly created injector for this app.
     */
    public static bootstrap(): Server {
        return new Server();
    }

    /**
     * Constructor.
     *
     * @class Server
     * @constructor
     */
    constructor() {
        //create expressjs application
        this.app = express();

        //configure application
        this.config();

        //add routes
        this.routes();

        //add api
        this.api();
    }

    /**
     * Create REST API routes
     *
     * @class Server
     * @method api
     */
    public api() {
        //empty for now
    }

    /**
     * Configure application
     *
     * @class Server
     * @method config
     */
    public config() {
        //add static paths
        this.app.use(express.static(path.join(__dirname, "public")));

        //configure pug
        // this.app.set("views", path.join(__dirname, "views"));
        // this.app.set("view engine", "hbs");

        //use logger middlware
        this.app.use(morgan("dev"));

        //use json form parser middlware
        this.app.use(bodyParser.json());

        //use query string parser middlware
        this.app.use(bodyParser.urlencoded({
            extended: true
        }));

        //use cookie parser middleware
        this.app.use(cookieParser("SECRET_GOES_HERE"));

        //use override middlware
        this.app.use(methodOverride());

        //override mongoose promises
        // mongoose.Promise = global.Promise;

        //connect to mongoose
        mongoose.connect("localhost:27017/PulsarDb");
        mongoose.connection.on("error", error => { console.log(error) });

        //catch 404 and forward to error handler
        this.app.use(function(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
            err.status = 404;
            next(err);
        });

        //error handling
        this.app.use(errorHandler());
    }

    // /**
    //  * Create router
    //  *
    //  * @class Server
    //  * @method api
    //  */
    // public routes() {
    //     //empty for now
    // }

    /**
     * Create router.
     *
     * @class Server
     * @method config
     * @return void
     */
    private routes() {
        let router: express.Router;
        router = express.Router();

        const jwtAuth = jwtCheck;
        //use cors middleware
        // router.use(cors());

        //add your routes
        // IndexRoute.create(router, jwtAuth);
        CustomerRoute.create(router, jwtAuth);
        UserAPI.create(router, jwtAuth);
        TransactionAPI.create(router, jwtAuth);

        // //use router middleware
        this.app.use(router);
    }
}