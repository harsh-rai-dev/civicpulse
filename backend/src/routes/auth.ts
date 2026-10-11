import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { getUserByEmail, createUser, setPasswordResetToken, updatePassword } from '../models/user';
import { hashPassword, comparePassword } from '../utils/auth';


const router = Router();

router.post('/register', async (req, res) => {
  const { name, email, password, passwordConfirmation, block_division } = req.body;
  if (!name || !email || !password || !passwordConfirmation) {
    return res.status(400).json({ error: 'All fields required' });
  }
  if (password !== passwordConfirmation) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await getUserByEmail(normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const hashed = await hashPassword(password);
  const user = await createUser(name, normalizedEmail, hashed, 'citizen', block_division);
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, block_division: user.block_division } });
});

router.post('/login', async (req, res) => {
  const { email, password, portal } = req.body;
  if (!portal || (portal !== 'citizen' && portal !== 'official')) {
    return res.status(400).json({ error: 'Invalid portal' });
  }
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  const normalizedEmail = email.trim().toLowerCase();
  const user = await getUserByEmail(normalizedEmail);
  console.log(`[LOGIN] Attempt for email: ${normalizedEmail}, User found: ${!!user}`);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const valid = await comparePassword(password, user.password_hash);
  console.log(`[LOGIN] Password valid: ${valid}`);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Portal Check
  if (portal === 'citizen' && user.role !== 'citizen') {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  if (portal === 'official' && user.role !== 'admin') {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, block_division: user.block_division } });
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  const normalizedEmail = email.trim().toLowerCase();
  const user = await getUserByEmail(normalizedEmail);
  console.log(`[RESET] Attempt for email: ${normalizedEmail}, User found: ${!!user}`);
  if (!user) {
    return res.status(404).json({ error: 'No account found with this email' });
  }
  // Generate deterministic/clean 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  // Valid for 5 minutes
  const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  await setPasswordResetToken(normalizedEmail, code, expires);

  // Send OTP via EmailJS REST API using native fetch with browser headers
  // (EmailJS blocks API access from non-browser environments unless these are present)
  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'http://localhost:3000',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID!,
        template_id: process.env.EMAILJS_TEMPLATE_ID!,
        user_id: process.env.EMAILJS_PUBLIC_KEY!,
        template_params: { email, passcode: code },
      }),
    });

    if (!response.ok) {
      throw new Error(`EmailJS responded with status ${response.status}`);
    }
  } catch (e) {
    console.error('Failed to send OTP email');
    return res.status(500).json({ error: 'Unable to send verification code' });
  }

  res.json({ message: 'Verification code generated successfully' });
});

router.post('/reset-password', async (req, res) => {
  const { email, code, newPassword, confirmPassword } = req.body;
  if (!email || !code || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await getUserByEmail(normalizedEmail);
  console.log(`[RESET-PASSWORD] Attempt for email: ${normalizedEmail}, User found: ${!!user}`);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (!user.reset_token || user.reset_token !== code) {
    return res.status(400).json({ error: 'Invalid verification code' });
  }
  if (!user.reset_token_expires || new Date() > new Date(user.reset_token_expires)) {
    return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
  }

  const newHash = await hashPassword(newPassword);
  await updatePassword(normalizedEmail, newHash);

  res.json({ message: 'Password has been reset successfully. Please log in with your new password.' });
});

export default router;
