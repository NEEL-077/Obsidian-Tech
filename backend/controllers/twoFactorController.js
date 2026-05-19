const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const { sendEmail } = require('../utils/emailService');

// @desc    Setup 2FA (Generate Secret & QR Code)
// @route   POST /api/users/2fa/setup
// @access  Private
const setup2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { type } = req.body; // 'authenticator' or 'email'

        if (type === 'authenticator') {
            const secret = speakeasy.generateSecret({
                name: `OBSIDIAN TECH (${user.email})`,
                issuer: 'OBSIDIAN TECH'
            });

            // Update user with temporary secret (don't enable yet)
            user.twoFactorSecret = secret.base32;
            user.twoFactorType = 'authenticator';
            await user.save();

            const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
            res.json({
                secret: secret.base32,
                qrCode: qrCodeUrl,
                otpauth_url: secret.otpauth_url
            });
        } else if (type === 'email') {
            // No secret needed for email, just generate a temporary code
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            user.twoFactorCode = code;
            user.twoFactorCodeExpires = Date.now() + 10 * 60 * 1000; // 10 mins
            user.twoFactorType = 'email';
            await user.save();

            await sendEmail(user.email, 'twoFactorCode', { code });
            res.json({ message: 'Verification code sent to email' });
        } else {
            res.status(400).json({ message: 'Invalid 2FA type' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify and Enable 2FA
// @route   POST /api/users/2fa/verify
// @access  Private
const verifyAndEnable2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { code } = req.body;

        if (user.twoFactorType === 'authenticator') {
            const verified = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token: code,
            });

            if (verified) {
                user.twoFactorEnabled = true;
                await user.save();
                res.json({ message: '2FA enabled successfully', twoFactorEnabled: true });
            } else {
                res.status(400).json({ message: 'Invalid verification code' });
            }
        } else if (user.twoFactorType === 'email') {
            if (user.twoFactorCode === code && user.twoFactorCodeExpires > Date.now()) {
                user.twoFactorEnabled = true;
                user.twoFactorCode = undefined;
                user.twoFactorCodeExpires = undefined;
                await user.save();
                res.json({ message: '2FA enabled successfully', twoFactorEnabled: true });
            } else {
                res.status(400).json({ message: 'Invalid or expired code' });
            }
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Disable 2FA
// @route   POST /api/users/2fa/disable
// @access  Private
const disable2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.twoFactorEnabled = false;
        user.twoFactorSecret = undefined;
        user.twoFactorType = 'none';
        await user.save();

        res.json({ message: '2FA disabled successfully', twoFactorEnabled: false });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify 2FA Code (Internal Use / during login)
const verify2FACode = (user, code) => {
    if (user.twoFactorType === 'authenticator') {
        return speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: code,
        });
    } else if (user.twoFactorType === 'email') {
        return user.twoFactorCode === code && user.twoFactorCodeExpires > Date.now();
    }
    return false;
};

module.exports = {
    setup2FA,
    verifyAndEnable2FA,
    disable2FA,
    verify2FACode
};
