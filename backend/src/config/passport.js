import passport from 'passport';
import LocalStrategy from 'passport-local';
import GoogleStrategy from 'passport-google-oauth20';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const initializePassport = () => {
  // Local Strategy (Email/Password)
  passport.use(
    'local',
    new LocalStrategy.Strategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email }).select('+password');

          if (!user) {
            return done(null, false, {
              message: 'No user with that email address',
            });
          }

          const isPasswordMatch = await bcrypt.compare(password, user.password);

          if (!isPasswordMatch) {
            return done(null, false, { message: 'Incorrect password' });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Google OAuth 2.0 Strategy
  passport.use(
    'google',
    new GoogleStrategy.Strategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: (process.env.NODE_ENV === 'production' || process.env.RENDER === 'true')
          ? 'https://stockerai-backend.onrender.com/api/auth/google/callback'
          : 'http://localhost:5000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          // Create new user from Google profile
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            fullName: profile.displayName,
            profilePicture: profile.photos[0]?.value || null,
            role: 'manager',
            isVerified: true,
          });

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Serialize user for sessions
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from sessions
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};
