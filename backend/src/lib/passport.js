import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.js";
import { upsertStreamUser } from "../lib/stream.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, emails, displayName, photos } = profile;
        const email = emails[0].value;

        let user = await User.findOne({ $or: [{ googleId: id }, { email }] });

        if (user) {
          if (!user.googleId) {
            user.googleId = id;
            await user.save();
          }
        } else {
          user = await User.create({
            fullName: displayName,
            email,
            googleId: id,
            profilePic: photos[0]?.value || "",
            isOnboarded: false,
          });
        }

        try {
          await upsertStreamUser({
            id: user._id.toString(),
            name: user.fullName,
            image: user.profilePic || "",
          });
        } catch (streamError) {
          console.error("Error upserting Stream user during Google auth:", streamError.message);
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
