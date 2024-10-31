import passport from "passport";
import LocalStrategy from "passport-local";
import bcrypt from "bcrypt";
import User from "../models/User.js";

const strategy = new LocalStrategy(async (username, password, done) => {
    try{
        const user = await User.findOne({ username: username })
        if (!user) {
            return done(null, false, { message: "Wrong username" });
        } else {
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid) {
                return done(null, user);
            } else {
                return done(null, false, { message: "Wrong password" });
            }
        }
    }catch(err){
        done(err);
    }
})

passport.use(strategy);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id)
        .then((user) => {
            done(null, user);
        })
        .catch(err => done(err))
});