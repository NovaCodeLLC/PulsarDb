/**
 * Created by Thomas Lesperance on 8/26/2017.
 */
import * as jwks from 'jwks-rsa';
import * as jwt from 'express-jwt';

export const jwtCheck = jwt({
    secret: (<any>jwks).expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: "https://novacode-pulsar.auth0.com/.well-known/jwks.json"
    }),
    audience: 'http://localhost:3000',
    issuer: "https://novacode-pulsar.auth0.com/",
    algorithms: ['RS256']
});

//type definitions don't exist at this time for jwks.