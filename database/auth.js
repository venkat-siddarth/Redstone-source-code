module.exports = {
    ensureAuthenticated: function(req,res,next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error_msg','Please Login to view the Resource');
        res.redirect('./LoginPage');
    }
}