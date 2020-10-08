var express             = require("express"),
    methodOverride      = require("method-override"),
	app                 = express(),
	bodyParser          = require("body-parser"),
	mongoose            = require("mongoose"),
	passport            = require("passport"),
	localStrategy       = require("passport-local"),
	User                = require("./models/user");

 

//mongoose.connect("mongodb://localhost:27017/blog_app", {useNewUrlParser:true});
//mongodb+srv://Magda:Kapsel909@cluster0.tiveo.mongodb.net/<dbname>?retryWrites=true&w=majority
mongoose.connect("mongodb+srv://Magda:Kapsel909@cluster0.tiveo.mongodb.net/cluster0?retryWrites=true&w=majority", {
	useNewUrlParser: true,
	useCreateIndex: true
}).then (() => {
	console.log("Connected to DB");
}).catch(err =>{
	console.log("ERROR:", err.message);
});

mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('/public'))
app.use(methodOverride("_method"));

//PASSPORT CONFICURATION/////////////
app.use(require("express-session")({
	secret: "music is the best",
	resave: false,
	saveUninitialized: false
	
	
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//CREATING A SCHEMA 

var blogSchema = new mongoose.Schema({
	title: String, 
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});
// convert to mongoose mmodel!
var Blog = mongoose.model("Blog", blogSchema);

//creating first post just for the example for the style

//RESTFUL ROUTES

//main route which redirects to index
app.get("/", function(req, res){
	res.render("main");
});


//INDEX route
app.get("/blogs", isLoggedIn, function (req, res){
	Blog.find({}, function(err, blogs){
		if (err){
			console.log("Error!");
		}else{
			res.render("index", {blogs: blogs})
		};
	});
	
});

//NEW ROUTES
app.get("/blogs/new", isLoggedIn, function(req, res){
	res.render("new");
})


//CREATE ROUTE 
app.post("/blogs", isLoggedIn,  function(req, res){
	//create blog
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			res.render("new");
		//redirect to the index
		}else{
			res.redirect("/blogs");
		}
	});
	
});

//SHOW ROUTE
app.get("/blogs/:id", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("show", {blog: foundBlog});
		}
	})
});

//EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if (err){
			res.redirect("/blogs");
		}else{
			res.render("edit", {blog: foundBlog});
		}
	});
});	

//UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
	//we have to put three arguments - id, newDate and callback
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

//DELETE ROUTE

app.delete("/blogs/:id", function(req, res){
	
	//destroy blog post
	//redirect somewhere
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs");
		}
	});
	
	
	
});


//AUTH ROADS////////////
///////////////////////

app.get("/register", function(req, res){
	res.render("register");
});

//handling sign up logic

app.post("/register", function(req, res){
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if (err){
			console.log(err);
			return res.render("main");
		}
		passport.authenticate("local")(req, res, function(){
			res.redirect("/blogs");
		});
	});
});


//show login form 
app.get("/login", function(req,res){
	res.render("login");
});

//login logic-> login, middleware, callback
app.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/blogs",
		failureRedirect:"/login"
	
	}), function(req,res){
	
});

//logout route 
app.get("/logout", function(req,res){
	req.logout();
	res.redirect("/");
});


//MIDDLEWARE -> the user must be logged in to make a new post
function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}








app.listen(3000, function(){
	console.log("BlogApp server is running!");
});
