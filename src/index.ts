const fs = require('fs');
// import Debug from 'debug'
import { log } from './log';
import { OrderService } from './services/OrderService';
import { IProductQuery, ProductService } from './services/ProductService';
var restify = require('restify');
var config = require('./config');
var passport = require('passport');
var OIDCBearerStrategy = require('passport-azure-ad').BearerStrategy;

var options = {
    // The URL of the metadata document for your app. We will put the keys for token validation from the URL found in the jwks_uri tag of the in the metadata.
    identityMetadata: config.creds.identityMetadata,
    clientID: config.creds.clientID,
    validateIssuer: config.creds.validateIssuer,
    issuer: config.creds.issuer,
    passReqToCallback: config.creds.passReqToCallback,
    isB2C: config.creds.isB2C,
    policyName: config.creds.policyName,
    allowMultiAudiencesInToken: config.creds.allowMultiAudiencesInToken,
    audience: config.creds.audience,
    loggingLevel: config.creds.loggingLevel,
};

const server = restify.createServer({
    name: 'NorthWindDB API',
    version: '1.0.0',
    key: fs.readFileSync('C:\\Tools\\OpenSSL\\localhost\\localhost.key'),
    cert: fs.readFileSync('C:\\Tools\\OpenSSL\\localhost\\localhost.crt')
    // formatters: {
    //     'application/json': function (req, res, body) {
    //         if (req.params.callback) {
    //             var callbackFunctionName = req.params.callback.replace(/[^A-Za-z0-9_\.]/g, '');
    //             return callbackFunctionName + "(" + JSON.stringify(body) + ");";
    //         } else {
    //             return JSON.stringify(body);
    //         }
    //     },
    //     'text/html': function (req, res, body, cb) {
    //         cb(null, body)
    //     }
    // }
});

//server.pre(restify.pre.pause());
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.dateParser());
server.use(restify.plugins.gzipResponse());
server.use(restify.plugins.bodyParser());

// Allows for JSON mapping to REST
server.use(restify.plugins.authorizationParser()); // Looks for authorization headers

// Let's start using Passport.js
server.use(passport.initialize()); // Starts passport
//server.use(passport.session()); // Provides session support
// ownerId is the object ID of the authenticated user
var ownerId = null;
var bearerStrategy = new OIDCBearerStrategy(options,
    function (token, done) {
        log(token, 'was the token retreived');
        if (!token.oid)
            done(new Error('oid is not found in token'));
        else {
            ownerId = token.oid;
            done(null, token);
        }
    }
);

passport.use(bearerStrategy);

const echoFunc = (req, res, next) => {
    // res.send(result);
    res.send(req.params);
    return next();

}

// enable the AAD to secure the REST API endpoint
server.get('/echo/:name', passport.authenticate('oauth-bearer', {
    session: false
}), echoFunc);

//server.get('/echo/:name', echoFunc);

const getAllOrders = (req, res, next) => {
    const dbConfig = config.dbConfig;
    OrderService.getAllOrders(config.dbConfig).then((result) => {
        res.send(result);
        return next();
    });
    // res.send(result);

}
// get all orders
server.get('/api/orders', passport.authenticate('oauth-bearer', {
    session: false
}), getAllOrders);

const getProducts = (req, res, next) => {
    const dbConfig = config.dbConfig;
    log('productQuery:', req.body.productQuery);
    ProductService.getProducts(config.dbConfig, req.body.productQuery as IProductQuery).then((result) => {
        res.send(result);
        return next();
    });
    // res.send(result);

}
// get products
server.post('/api/products', passport.authenticate('oauth-bearer', {
    session: false
}), getProducts);

server.listen(8080, function () {
    console.log('%s listening at %s', server.name, server.url);
});