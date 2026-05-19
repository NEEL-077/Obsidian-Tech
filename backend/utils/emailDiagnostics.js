const nodemailer = require('nodemailer');

// Test configurations for mainstream providers
const providerConfigs = {
  gmail: {
    name: 'Gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    notes: 'Requires App Password (not regular password). Enable 2FA first.',
    setupUrl: 'https://myaccount.google.com/apppasswords',
  },
  outlook: {
    name: 'Outlook/Hotmail',
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    notes: 'May need to enable "Less secure app access" or use App Password.',
    setupUrl: 'https://account.live.com/proofs/Manage',
  },
  yahoo: {
    name: 'Yahoo Mail',
    host: 'smtp.mail.yahoo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    notes: 'Generate App Password at Account Security settings.',
    setupUrl: 'https://login.yahoo.com/account/security',
  },
};

// Test a specific provider
const testProvider = async (providerKey) => {
  const config = providerConfigs[providerKey];
  if (!config) {
    return { success: false, error: 'Unknown provider' };
  }

  console.log(`\n🔍 Testing ${config.name}...`);
  console.log(`   Host: ${config.host}:${config.port}`);
  console.log(`   User: ${config.auth.user || 'NOT SET'}`);

  if (!config.auth.user || !config.auth.pass) {
    return {
      success: false,
      provider: config.name,
      error: 'EMAIL_USER or EMAIL_PASS not configured',
      setupNotes: config.notes,
      setupUrl: config.setupUrl,
    };
  }

  try {
    const transporter = nodemailer.createTransporter({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass.replace(/\s/g, ''),
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });

    await transporter.verify();
    
    return {
      success: true,
      provider: config.name,
      message: 'Connection successful',
    };
  } catch (error) {
    return {
      success: false,
      provider: config.name,
      error: error.message,
      code: error.code,
      setupNotes: config.notes,
      setupUrl: config.setupUrl,
    };
  }
};

// Test all providers
const testAllProviders = async () => {
  console.log('📧 Email Provider Diagnostics\n');
  console.log('===========================\n');

  const results = [];

  for (const [key, config] of Object.entries(providerConfigs)) {
    const result = await testProvider(key);
    results.push(result);

    if (result.success) {
      console.log(`   ✅ ${result.provider}: WORKING`);
    } else {
      console.log(`   ❌ ${result.provider}: FAILED`);
      console.log(`      Error: ${result.error}`);
      if (result.code) console.log(`      Code: ${result.code}`);
    }
    console.log();
  }

  // Summary
  console.log('===========================\n');
  const working = results.filter(r => r.success);
  
  if (working.length > 0) {
    console.log(`✅ Working providers: ${working.map(r => r.provider).join(', ')}`);
  } else {
    console.log('❌ No providers are working. Check your configuration.');
    console.log('\n💡 Common fixes:');
    console.log('   1. For Gmail: Enable 2FA, then generate App Password');
    console.log('   2. For Outlook: Check "Less secure app access" settings');
    console.log('   3. For Yahoo: Generate App Password in Account Security');
    console.log('   4. Make sure EMAIL_USER and EMAIL_PASS are set in .env');
  }

  return results;
};

// Get provider-specific help
const getProviderHelp = (provider) => {
  const help = {
    gmail: `
🔧 Gmail Setup Instructions:

1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification" (required for App Passwords)
3. Go to https://myaccount.google.com/apppasswords
4. Select "Mail" and your device
5. Click "Generate"
6. Copy the 16-character password (no spaces)
7. Paste it in your .env file as EMAIL_PASS

⚠️  Do NOT use your regular Gmail password!
    `,
    outlook: `
🔧 Outlook/Hotmail Setup Instructions:

1. Go to https://account.live.com/proofs/Manage
2. Enable "Two-step verification"
3. Go to "App passwords" section
4. Create a new app password
5. Copy the password to your .env file

Alternative:
- Go to https://account.microsoft.com/security
- Sign in → Advanced security options
- Create app password
    `,
    yahoo: `
🔧 Yahoo Mail Setup Instructions:

1. Go to https://login.yahoo.com/account/security
2. Sign in with your Yahoo account
3. Enable "Two-step verification"
4. Click "Generate app password"
5. Select "Other app" and name it "Obsidian Tech"
6. Copy the generated password to your .env file
    `,
  };

  return help[provider] || 'Provider not found. Use: gmail, outlook, or yahoo';
};

module.exports = {
  testProvider,
  testAllProviders,
  getProviderHelp,
  providerConfigs,
};
