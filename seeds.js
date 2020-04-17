
var mongoose = require( "mongoose" );
mongoose.connect( "mongodb://localhost:27017/yelp_camp", { useNewUrlParser: true, useUnifiedTopology: true } );

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log( "Database is connected!" );
});

var Campground = require( "./models/campground" );
var Comment = require( "./models/comment" );

var seeds = [
    {
        name: "Downton Abbey",
        price: "399.99",
        image: "https://res.cloudinary.com/mark2code/image/upload/v1587033196/dlfqqekmrh51chhhl0jj.jpg",
        image_id: "dlfqqekmrh51chhhl0jj",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
        location: "Highclere Park, Highclere, Newbury RG20 9RN, UK",
        lat: 51.3265901,
        lng: -1.360666,
        createdAt: {
            type: "2020-04-16T10:33:15.041Z",
            default: Date.now
        },
        author: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            username: "Mark"
        }    
    },
    {
        name: "Ain Zhalta",
        price: "14.99",
        image: "https://res.cloudinary.com/mark2code/image/upload/v1587056884/diilkogop6myaleqnxhs.webp",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
        location: "Ain Zhalta, Lebanon",
        lat: 33.7413374,
        lng: 35.7004322,
        createdAt: {
            type: "2020-04-16T10:33:15.041Z",
            default: Date.now
        },
        author: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            username: "Mark"
        }
    },
    {
        name: "Clouds Rest",
        price: "24.99",
        image: "https://res.cloudinary.com/mark2code/image/upload/v1587057013/katxfvrp45zrijjuzqvp.webp",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
        location: "Himalayas",
        lat: 28.5983159,
        lng: 83.9310623,
        createdAt: {
            type: "2020-04-16T10:33:15.041Z",
            default: Date.now
        },
        author: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            username: "Mark"
        }
    },
    {
        name: "Highams Park", 
        price: "1.99",
        image: "https://res.cloudinary.com/mark2code/image/upload/v1587064150/ec82egnetiefuqqbxhlp.webp",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
        location: "Himalayas",
        lat: 51.6083754,
        lng: 0.0014712,
        createdAt: {
            type: "2020-04-16T10:33:15.041Z",
            default: Date.now
        },
        author: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            username: "Mark"
        }
    }
];


async function seedDB(){
    // remove all comments & campgrounds
    try {
        await Campground.remove({});
        console.log( "campgrounds cleared" );
        await Comment.remove({});
        console.log( "comments cleared" );
        
        // add fresh comments & campgrounds
        for( const seed of seeds ){
            let campground = await Campground.create( seed );
            console.log( "campground created" );
            let comment = await Comment.create(
                {
                    text: "This place is great, but I wish there was WiFi",
                    author: "Colt" 
                }
            );
            console.log( "comment created" );
            campground.comments.push( comment );
            campground.save();
            console.log( "comment added to campground" );
        }
    } catch( err ) {
        console.log( err );
    }
}


module.exports = seedDB;

