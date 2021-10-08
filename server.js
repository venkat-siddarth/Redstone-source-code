const nodemailer = require("nodemailer");
const express = require("express");
const app = express();
const mongoose = require('mongoose');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const jwt = require('jsonwebtoken');
var formidable = require('formidable');
var fs = require('fs');
const mv = require('mv');
const JWT_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTYyMTgzMzc0MCwiaWF0IjoxNjIxODMzNzQwfQ.rXmmNL9nboC0HuCOuY8NiWMDrn13o_TH-s1cYShMR6o";
const JWT_RESET_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTYyMTgzMzg1OSwiaWF0IjoxNjIxODMzODU5fQ.Q4ZMX_0WP_0AMNF2KG5X3BaLm7aY8akGvMvxHJpWp98";
const PORT = process.env.PORT || 8081;

const { ensureAuthenticated } = require('./database/auth');


// Passport config
require('./database/passport')(passport);


//Middleware
app.use(express.static(__dirname+'/'));
app.use(express.json());

// DataBase Configuration
const db = require('./database/keys').MongoURI;

// Connect to MongoDB
mongoose.connect(db,{
    useNewUrlParser:true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err));

const User = require('./database/userSchema');
const Product = require('./database/productSchema');
const Subscriber = require('./database/subscriberSchema');
const Cart = require('./database/cartSchema');
const Orders = require('./database/orderSchema') 

// for session no cache record for logout
app.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

// Register View Engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/');

// Server port
app.listen(PORT, () => {
    console.log('Server running on port ' + PORT + ' '+ __dirname);
});

// Bodyparser
app.use(express.urlencoded({extended:true}));

// Express session
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passing whether logged in or not
app.use(function(req, res, next){
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

//Connect flash
app.use(flash());

//Global Vars
app.use((req,res,next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});


app.get("/search",(req,res) => {
    var query=req.query;
    console.log(query)
    Product.find({ "_id": query.id}).then((result)=>{
        console.log(result)
        res.render("Productpage",{name: req.user.name, email: req.user.email, res:result});
    }).catch((err)=>{
        console.log("Something went wrong")

    })
})

app.get('/', (req, res) => {
    //res.send("Hello")
    //res.sendFile(__dirname + "/Homepage.ejs");
    if(req.isAuthenticated()){
        Cart.findOne({ "email": req.user.email})
        .then((result) => {
            if(!result){
                const newCart = new Cart({
                    email: req.user.email,
                    qty: {}
                })
                newCart.save()
                .then((re) => {
                    var count=0;
                    //console.log(re);
                    for(var i=0;i<re.product_id.length;i++){
                        count+=re.qty.get(re.product_id[i]);
                    }
                    res.render('Homepage',{ name: req.user.name, email: req.user.email ,count: count });
                })
                .catch(err => console.log(err));
            } else {
                var count=0;
                // console.log(result);
                for(var i=0;i<result.product_id.length;i++){
                    count+=result.qty.get(result.product_id[i]);
                }
                res.render('Homepage',{ name: req.user.name, email: req.user.email ,count: count });
            }
        }).catch((err)=>{
            console.log(err);
        });
    } else {
        res.render('Homepage');
    }
});
app.get('/Bags',ensureAuthenticated,(req,res) => {
    var count=0;
    Cart.findOne({ "email": req.user.email})
    .then((result) => {
        // console.log(result);
        for(var i=0;i<result.product_id.length;i++){
            count+=result.qty.get(result.product_id[i]);
        }
    }).catch((err) => {console.log(err)});
    Product.find({"productType":"Bags"}).then((result)=>{
        res.render("productDisplay", { type:"Bags",src:"./Images/BagHomePage.jpg", res:result, name: req.user.name, email: req.user.email, count: count});
    }).catch((err)=>{
        if(err)
            console.log("Something went wrong");
    });
});
app.get('/Headphones',ensureAuthenticated,(req,res) => {
    var count=0;
    Cart.findOne({ "email": req.user.email})
    .then((result) => {
        // console.log(result);
        for(var i=0;i<result.product_id.length;i++){
            count+=result.qty.get(result.product_id[i]);
        }
    }).catch((err) => {console.log(err)});
    Product.find({"productType":"Headphones"}).then((result)=>{
        res.render("productDisplay", { type:"Headphones",src:"./Images/headphoneImg.jpg", res:result, name: req.user.name, email: req.user.email, count: count});
    }).catch((err)=>{
        if(err)
            console.log("Something went wrong");
    });
});
app.get('/Watches',ensureAuthenticated,(req,res) => {
    var count=0;
    Cart.findOne({ "email": req.user.email})
    .then((result) => {
        // console.log(result);
        for(var i=0;i<result.product_id.length;i++){
            count+=result.qty.get(result.product_id[i]);
        }
    }).catch((err) => {console.log(err)});
    Product.find({"productType":"Watches"}).then((result)=>{
        res.render("productDisplay", { type:"Watches",src:"./Images/watchImg1.jpg", res:result, name: req.user.name, email: req.user.email, count: count});
    }).catch((err)=>{
        if(err)
            console.log("Something went wrong");
    });
});
app.get('/Loginpage',(req,res) => {
    res.render('Loginpage');
});
app.get('/SignUppage',(req,res) => {
    res.render('SignUppage');
});

app.get('/productUploadPage',(req, res) => {
    res.render('productUploadPage');
});

app.get('/address', ensureAuthenticated, (req, res) => {
    res.render("address",{name: req.user.name, email: req.user.email, mobile: req.user.mobile});
});
app.get("/neworders",ensureAuthenticated, (req,res)=>{
    var query = req.query;
    Cart.findOne({ "email": req.user.email}).then((result)=>{
        Product.find({"_id":{"$in":result.product_id}})
        .then((rep) => {
            var price=new Map();
            var arr=[];
            for(var i=0;i<rep.length;i++)
            {
                arr.push(rep[i].itemName);
                var discPrice = rep[i].price * (100-rep[i].discount)/100;
                price.set(rep[i]._id, discPrice.toFixed(2));
            }
           // console.log(price)
            let order = new Orders({
                email: req.user.email,
                product: result.product_id,
                productName: arr,
                price: price,
                ordered_date: new Date(),
                qty: result.qty,
                shipping_address: query.shippingAddress
            });
            console.log(order);
            order.save().then((rs) => {
                console.log(rs);
                Cart.updateOne({"email": req.user.email}, 
                {product_id: [], qty: {}}, function (err, docs) {
                    if (err){
                        console.log(err)
                    }
                    else{
                        console.log("Updated Docs : ", docs);
                    }
                });
                res.redirect("/orders");
            }).catch((err) => {
                console.log(err);
            })
        })
        
    })
});

app.get("/orders",ensureAuthenticated,(req, res)=>{
    Orders.find({ "email": req.user.email}).then((result)=>{
        console.log(result.length)
        res.render("orders",{orderData:result, name: req.user.name, email: req.user.email});
    }).then(()=>{
        console.log("Success")
    }).catch((err)=>{
        console.log(err)
    })
});

app.get("/invoice", ensureAuthenticated, (req, res) => {
    var query = req.query;
    Orders.findOne({"_id": query.id})
    .then((result) => {
        res.render('Invoice',{name: req.user.name, email: req.user.email, orderData: result});
    }).catch((err) => {
        console.log(err);
    });
});

app.get('/cart',ensureAuthenticated,(req, res) => {
    Cart.findOne({ "email": req.user.email})
    .then((result) => {
        if(result){
            Product.find({"_id":{$in:result.product_id}})
            .then((re)=>{
                res.render("cart",{cart_id:result._id, qty:result.qty, res:re, name: req.user.name, email: req.user.email});
            })
        } else {
            const newCart = new Cart({
                email: req.user.email,
                qty: {}
            })
            newCart.save()
            .then((re) => {
                res.render("cart",{cart_id:re._id, qty:re.qty, res:re, name: req.user.name, email: req.user.email});
            })
            .catch(err => console.log(err));
        }
    }).catch((err)=>{
        console.log(err);
    });
    //res.render('cart',{ name: req.user.name, email: req.user.email });
});

// Product entry in database
app.post('/seller',(req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var oldpath = files.prodImg.path;
        var newpath = __dirname + "/uploads/"+ files.prodImg.name;
        mv(oldpath, newpath, function (err) {
            if (err) throw err;
            console.log('File uploaded and moved! to '+newpath);
        });
        const newProduct=new Product({
            itemName: fields.itemName,
            description: fields.description,
            price: parseInt(fields.price),
            quantity: fields.quantity,
            discount: fields.discount,
            seller: fields.seller,
            productType: fields.productType,
            prodImg: files.prodImg.name
        });
        newProduct.save()
        .then((result) => {
            req.flash('success_msg','Database has been updated...');
            res.redirect('/productUploadPage');
        }).catch((error) => {
           console.log(error);
        });
    });
});

app.post("/addtocart", ensureAuthenticated, (req,res) => { 
    var obj=req.body;
    Cart.findOne({ "email": req.user.email })
    .then((result) => {
        var k = result.product_id;
        var flag=true;
        console.log(k);
        for(var i=0;i<k.length;i++){
            if(k[i]==obj.id)
            {
                flag=false;
                break;
            }
        }
        qty=result.qty
        //console.log(qty)
        if(flag){
            k.push(obj.id);
        }
        qty.set(obj.id,obj.qty);
        console.log(k);
        console.log(qty);
        Cart.updateOne({ "email": req.user.email }, { "product_id": k, "qty": qty })
        .then((result) => {
            res.send("ok")
            console.log("Update succesful");
        }).catch((err) => {
            console.log(err)
            res.send("notok")
        })
    }).catch((err) => {
        console.log(err)
    })

});

app.post("/process",(req,res)=>{
    let obj=req.body;
    Cart.findOne({"_id":obj.cart_id}).then((result)=>{
        var k=result.product_id;
        //console.log(k);
        var new_products=k.filter(function(m){
            return m!=obj.id;});
        var qty=result.qty;
        console.log(qty)
        qty.delete(obj.id)
        console.log(qty)
        Cart.updateOne({"_id":obj.cart_id},{"$set":{"product_id":new_products,"qty":qty}}).then((result)=>{
            //console.log(result);
            console.log("Update succesful");
        }).catch((err)=>{
            console.log(err)
        })
    }).catch((err) => {
        console.log(err)
    })
});

// Register Handle
app.post('/signup',async(req,res) => {
    const { name, mobile, organization, email, password} = req.body;
    let errors = [];

    // Check required fields
    if(!name || !mobile || !email || !password){
        errors.push({msg: 'Please fill in the required fields'});
    }

    // Check password is atleast 6 digits
    if(password.length < 6){
        errors.push({msg: 'Password should be atleast 6 characters'});
    }

    if(errors.length > 0){
        res.render('SignUppage',{
            errors,
            name,
            mobile,
            email,
            password
        });
    } else {
        // Validation passed
        User.findOne({ email: email})
        .then(user => {
            if(user){
                // User Exists
                errors.push({msg: 'Email is already Registered.'});
                res.render('SignUppage',{
                    errors,
                    name,
                    mobile,
                    email,
                    password
                });
            } else {
                const token = jwt.sign({ name, mobile, organization, email, password }, JWT_KEY, { expiresIn: '30m' });
                const CLIENT_URL = 'http://' + req.headers.host;

                const output = `${CLIENT_URL}/activate/${token}`;

                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: <email>,
                        pass: <password>
                    
                    }
                });

                // send mail with defined transport object
                const mailOptions = {
                    from: '"Do not Reply "<email>', 
                    to: email, 
                    subject: "Account Verification: Redstone", 
                    html: "<h2>Please click on below link to activate your account</h2>"+
                    "<a href='"+output+"'>Activate Your Account</a>"+
                    "<p><b>NOTE: </b> The above activation link expires in 30 minutes.</p>"

                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                        req.flash('error_msg','Something went wrong on our end. Please register again.');
                        res.redirect('/SignUppage');
                    }
                    else {
                        console.log('Mail sent : %s', info.response);
                        req.flash('success_msg','Activation link sent to email ID. Please activate to log in.');
                        res.redirect('/Loginpage');
                    }
                })
            }
        });
    }
});

//------------ Activate Account Handle ------------//
app.get('/activate/:token',async function(req, res){
    const token = req.params.token;
    let errors = [];
    if (token) {
        jwt.verify(token, JWT_KEY, (err, decodedToken) => {
            if (err) {
                req.flash('error_msg','Incorrect or expired link! Please register again.');
                res.redirect('/SignUppage');
            }
            else {
                const { name, mobile, organization, email, password } = decodedToken;
                User.findOne({ email: email }).then(user => {
                    if (user) {
                        //------------ User already exists ------------//
                        req.flash('error_msg','Email ID already registered! Please log in.');
                        res.redirect('/Loginpage');
                    } else {
                        const newUser = new User({
                            name,
                            mobile,
                            organization,
                            email,
                            password
                        });

                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(newUser.password, salt, (err, hash) => {
                                if (err) throw err;
                                newUser.password = hash;
                                newUser.save()
                                .then(user => {
                                    req.flash('success_msg','Account activated. You can now log in !!!');
                                    res.redirect('/Loginpage');
                                })
                                .catch(err => console.log(err));
                            });
                        });
                    }
                });
            }

        })
    }
    else {
        console.log("Account activation error!")
    }
});

// Login Handle
app.post('/login',(req,res,next) => {
    passport.authenticate('local',{
        successRedirect: '/',
        failureRedirect: '/Loginpage',
        failureFlash: true
    })(req, res, next);
});

// Logout Handle
app.get('/logout',(req,res) => {
    req.logout();
    req.flash('success_msg','You are successfully logged out');
    res.redirect('/Loginpage');
});


//Sending a mail for subscription
app.post('/', (req, res) => {
    let obj = req.body;
    Subscriber.findOne({email: obj.mail}).then(user => {
        if(user){
            req.flash('error_msg','Email ID already subscribed!');
        } else {
            const newSubscriber = new Subscriber({
                email: obj.mail
            });
            newSubscriber.save()
            .then(user => {
                req.flash('success_msg','You are Subcribed!!!');
                console.log("Sending Mails!!");
                sendMail(obj.mail, res);
            })
            .catch(err => console.log(err));
        }
    })
});
function sendMail(mail, res) {
    var ret;
    var transporter = nodemailer.createTransport(
    {
        service: "gmail",
        auth: {
            user: <email>,
            pass: <password>
        }
    });
    var mailOptions = {
        from: <email>,
        to: mail,
        subject: "REDSTONE|Welcomes you to our community",
        html: "<h1>Welcome to redstone community</h1><div><h1>Check out new products</h1><br>" +
            "<p><tt>Greetings from :<br />Raghav Agrawal<br />Co-owner Redstone</tt></p></div>"
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            ret = false;
            console.log(error);
        }
        else {
            ret = true;
            console.log('Email sent: ' + info.response);
        }
        res.send(ret);
    });
}
