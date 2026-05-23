const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        // Check if user already exists in public.users
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (existingUser && !fetchError) {
          // User already exists — return a compatible user object
          return done(null, {
            _id: existingUser.id,
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            isAdmin: existingUser.role === 'admin',
          });
        }

        // BUG #7 FIX: Hash the random password before storing it
        const rawPassword = Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(rawPassword, salt);

        // Create new Supabase auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: email,
          password: rawPassword, // Supabase stores this securely in auth.users
          email_confirm: true,
          user_metadata: { full_name: profile.displayName, google_id: profile.id },
        });

        if (authError) return done(authError, false);

        // Insert into public.users
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            name: profile.displayName,
            email: email,
            role: 'user',
          }])
          .select()
          .single();

        if (insertError) return done(insertError, false);

        return done(null, {
          _id: newUser.id,
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          isAdmin: false,
        });
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Serialize user for session (store only the id)
passport.serializeUser((user, done) => {
  done(null, user._id || user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !user) return done(null, false);

    done(null, {
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.role === 'admin',
    });
  } catch (error) {
    done(error, false);
  }
});

module.exports = passport;
