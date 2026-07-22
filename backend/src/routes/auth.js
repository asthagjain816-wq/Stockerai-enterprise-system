const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// ============================================
// LOCAL STRATEGY (Email/Password Login)
// ============================================
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        if (!email || !password) {
          return done(null, false, { message: 'Please enter both email and password' });
        }

        const cleanEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: cleanEmail }).select('+password');
        if (!user) {
          return done(null, false, { message: 'User not found' });
        }

        if (!user.password) {
          return done(null, false, {
            message: 'This account was created with Google Sign-In. Please click "Continue with Google".',
          });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid password' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// ============================================
// GOOGLE OAUTH STRATEGY
// ============================================
const getCallbackURL = () => {
  if (process.env.NODE_ENV === 'production' || process.env.RENDER === 'true') {
    return 'https://stockerai-backend.onrender.com/api/auth/google/callback';
  }
  return process.env.LOCAL_GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: getCallbackURL(),
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        // 1️⃣ Check by googleId
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // 2️⃣ Check if email already exists
        user = await User.findOne({ email });

        if (user) {
          // 👉 Existing user ko Google se link karo
          user.googleId = profile.id;
          await user.save();

          return done(null, user);
        }

        // 3️⃣ New user create karo
        const newUser = await User.create({
          googleId: profile.id,
          fullName: profile.displayName,
          email,
          password: null,
        });

        return done(null, newUser);
      } catch (error) {
        console.error('Google Strategy Error:', error);
        return done(error, null);
      }
    }
  )
);

// ============================================
// SERIALIZE & DESERIALIZE
// ============================================
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// ============================================
// AUTH ROUTES
// ============================================

// Register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, passwordConfirm } = req.body;
    const effectiveConfirmPassword = confirmPassword || passwordConfirm;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (password !== effectiveConfirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Hash password BEFORE creating user
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with hashed password
    const user = new User({
      fullName: fullName.trim(),
      email: cleanEmail,
      password: hashedPassword,
    });

    await user.save(); // Save करो

    req.logIn(user, (err) => {
      if (err) {
        console.error('Login error after register:', err);
        return res.status(500).json({
          success: false,
          message: 'Login failed after registration',
        });
      }

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          avatar: user.avatar || null,
        },
      });
    });
  } catch (error) {
    console.error('Register Error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map((e) => e.message).join(', '),
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
});

// Local Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Login Error:', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Login failed',
      });
    }
    if (!user) {
      return res.status(401).json({
        success: false,
        message: info && info.message ? info.message : 'Invalid email or password',
      });
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error('Login Session Error:', err);
        return res.status(500).json({
          success: false,
          message: 'Login session failed',
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          avatar: user.avatar || null,
        },
      });
    });
  })(req, res, next);
});

// Google Login Initiate
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Callback
router.get(
  '/google/callback',
  (req, res, next) => {
    const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
    passport.authenticate('google', {
      failureRedirect: `${frontendUrl}/login`,
      session: true,
    })(req, res, next);
  },
  (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
    // Successful authentication
    res.redirect(`${frontendUrl}/dashboard`);
  }
);

// Get Current User
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(200).json({
      success: false,
      message: 'Not authenticated',
      user: null,
    });
  }

  return res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      avatar: req.user.avatar || null,
    },
  });
});

// Update Profile
router.put('/profile', async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  try {
    const { fullName, email, avatar, password } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (avatar !== undefined) user.avatar = avatar;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    await user.save();

    // Sync session details
    req.user.fullName = user.fullName;
    req.user.email = user.email;
    req.user.avatar = user.avatar || null;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar || null
      }
    });
  } catch (err) {
    next(err);
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.logOut((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Logout failed',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  });
});

module.exports = router;