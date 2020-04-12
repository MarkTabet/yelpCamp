
var express = require( "express" );
var router = express.Router();
var passport = require( "passport");
var User = require( "../models/user")
var middleware = require( "../middleware" );


router.get('/', function(req, res) {
	res.render( "landing" );
});


// Show register form

router.get( "/register", function(req, res) {
	res.render( "register" );
});


// Handle registration

router.post( "/register", function(req, res) {
    // res.send( "Signing you up...");
    var newUser = new User({ username: req.body.username});
    User.register( newUser, req.body.password, function( err, user ){
        if( err ){
            req.flash( "error", err.message );
            return res.redirect( "register" ); // if there's an error, then bail out of the whole process
        } else {
            passport.authenticate( "local" )( req, res, function(){
                req.flash( "success", "Welcome to YelpCamp "+ user.username );
                res.redirect( "/campgrounds" );
            });
        }
    });
	// res.render( "register" );
});


// LOG IN route - show login form

router.get( "/login", function(req, res) {
	res.render( "login" );
});


// Handle login

router.post( "/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds", 
        failureRedirect: "/login"
    }), function(req, res) {
});


// LOG OUT route

router.get( "/logout", function(req, res) {
    req.logout();
    req.flash( "success", "Logged you out." );
    res.redirect( "/campgrounds" );
});


module.exports = router;