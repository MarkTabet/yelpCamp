
console.log( "Connected!" );


require('dotenv').config();

var express  = require( "express" );
var flash    = require( "connect-flash" );
var passport = require( "passport" );
var LocalStrategy  = require( "passport-local" );
var methodOverride = require( "method-override" );
var User     = require( "./models/user" );

var campgroundRoutes = require( "./routes/campgrounds" );
var commentRoutes    = require( "./routes/comments" );
var indexRoutes      = require( "./routes/index" );

var app = express();
var port = 3000;
app.use( express.static( __dirname + "/public" ) );

var bodyParser = require( "body-parser" );
app.use( bodyParser.urlencoded( {
    extended: true
} ) );

var mongoose = require( "mongoose" );

// connection for local mongoDB database
// mongoose.connect( "mongodb://localhost:27017/yelp_camp", {
    // useNewUrlParser: true,
    // useUnifiedTopology: true
// });

mongoose.connect( "mongodb+srv://mongodbAdmin:" + process.env.MONGO_DB_KEY + "@cluster0-eoozf.mongodb.net/test?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}).then( () => {
    console.log( "Connected to DB" );
}).catch( err => {
    console.log( "Error: ", err.message );
});

const PostSchema = new mongoose.Schema({
    title: String,
    description: String,
 });
 
 const Post = mongoose.model( "Post", PostSchema );

//  app.get('/', async (req, res) => {
// 	let post = await Post.create({ title: 'Test', description: 'This is a test also' });
// 	res.send(post);
// });
 

var db = mongoose.connection;
db.on( 'error', console.error.bind( console, 'connection error:' ) );
db.once( 'open', function () {
    console.log( "Database is connected!" );
} );

app.set( "view engine", "ejs" );
app.use( methodOverride( "_method" ) );


// my modules
Campground = require( "./models/campground" );
Comment = require( "./models/comment" );
seedDB = require( "./seeds" );
// seedDB();


// passport configuration
app.use( require( "express-session" )( {
    secret: "Liverpool FC are the greatest team the world has ever seen",
    resave: false,
    saveUninitialized: false
} ) );

app.use( flash() );

app.locals.moment = require( 'moment' );

app.use( passport.initialize() );
app.use( passport.session() );
passport.use( new LocalStrategy( User.authenticate() ) );
passport.serializeUser( User.serializeUser() );
passport.deserializeUser( User.deserializeUser() );

app.use( function ( req, res, next ) {
    res.locals.currentUser = req.user;
    res.locals.error =  req.flash( "error" );
    res.locals.success =  req.flash( "success" );
    next();
} );


app.use( indexRoutes );
app.use( "/campgrounds", campgroundRoutes );
app.use( "/campgrounds/:id/comments", commentRoutes );


// app.listen( port, () => console.log( `App listening on port ${port}!` ) );
// app.listen( process.env.PORT, process.env.IP ); 

// try this: 
app.listen( process.env.PORT || 3000, function(){
    console.log( "server is listening" );
});

// app.listen( process.env.PORT || port, process.env.IP ); 

