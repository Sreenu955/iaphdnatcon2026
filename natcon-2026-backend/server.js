const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
require('dotenv').config();

const app = express();

// Middleware configuration
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const JWT_SECRET = process.env.JWT_SECRET || 'natcon_secret_key';

// Middleware to verify Admin JWT Tokens
const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1]; // Expected format: Bearer <token>
  if (!token) {
    return res.status(401).json({ error: 'Access denied. Invalid token format.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.admin = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// ── SETTINGS / CMS ENDPOINTS ──────────────────────────────────────────────

// 1. Fetch all CMS settings
app.get('/api/settings', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM settings');
    const settings = {};
    rows.forEach(row => {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch (e) {
        settings[row.key] = row.value;
      }
    });
    res.json(settings);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Database error fetching settings.' });
  }
});

// 2. Save/Update a CMS setting
app.post('/api/settings', async (req, res) => {
  const { key, value } = req.body;
  if (!key || value === undefined) {
    return res.status(400).json({ error: 'Missing key or value fields.' });
  }

  try {
    const stringValue = JSON.stringify(value);
    await db.query(
      'INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?',
      [key, stringValue, stringValue]
    );
    res.json({ success: true, message: `Setting '${key}' saved successfully.` });
  } catch (err) {
    console.error('Error saving setting:', err);
    res.status(500).json({ error: 'Database error saving setting.' });
  }
});

// ── SCHEDULE ENDPOINTS ───────────────────────────────────────────────────
app.get('/api/schedules', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM schedules ORDER BY dayNumber ASC, timeSlot ASC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching schedules:', err);
    res.status(500).json({ error: 'Database error fetching schedules.' });
  }
});

app.post('/api/schedules', verifyAdminToken, async (req, res) => {
  const { dayNumber, timeSlot, title, speaker, venue } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO schedules (dayNumber, timeSlot, title, speaker, venue) VALUES (?, ?, ?, ?, ?)',
      [dayNumber, timeSlot, title, speaker, venue]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('Error saving schedule:', err);
    res.status(500).json({ error: 'Database error saving schedule.' });
  }
});

// ── SPONSOR ENDPOINTS ────────────────────────────────────────────────────
app.get('/api/sponsors', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM sponsors ORDER BY orderIndex ASC, name ASC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching sponsors:', err);
    res.status(500).json({ error: 'Database error fetching sponsors.' });
  }
});

app.post('/api/sponsors', verifyAdminToken, async (req, res) => {
  const { name, logoUrl, tier, orderIndex } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO sponsors (name, logoUrl, tier, orderIndex) VALUES (?, ?, ?, ?)',
      [name, logoUrl, tier, orderIndex || 0]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('Error saving sponsor:', err);
    res.status(500).json({ error: 'Database error saving sponsor.' });
  }
});

// ── ANNOUNCEMENT ENDPOINTS ────────────────────────────────────────────────
app.get('/api/announcements', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM announcements ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching announcements:', err);
    res.status(500).json({ error: 'Database error fetching announcements.' });
  }
});

app.post('/api/announcements', verifyAdminToken, async (req, res) => {
  const { title, content, isActive } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO announcements (title, content, isActive) VALUES (?, ?, ?)',
      [title, content, isActive !== false]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('Error saving announcement:', err);
    res.status(500).json({ error: 'Database error saving announcement.' });
  }
});

// ── GALLERY ENDPOINTS ─────────────────────────────────────────────────────
app.get('/api/gallery', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM gallery ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching gallery:', err);
    res.status(500).json({ error: 'Database error fetching gallery.' });
  }
});

app.post('/api/gallery', verifyAdminToken, async (req, res) => {
  const { title, mediaUrl, mediaType, category } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO gallery (title, mediaUrl, mediaType, category) VALUES (?, ?, ?, ?)',
      [title, mediaUrl, mediaType || 'image', category]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('Error saving gallery item:', err);
    res.status(500).json({ error: 'Database error saving gallery item.' });
  }
});

// ── REGISTRATION ENDPOINTS ────────────────────────────────────────────────

// 1. Fetch all registrations (Protected: Admin dashboard only)
app.get('/api/registrations', verifyAdminToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM registrations ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching registrations:', err);
    res.status(500).json({ error: 'Database error fetching registrations.' });
  }
});

// 2. Check duplicate registration (Public Step 1 verification)
app.post('/api/registrations/check-duplicate', async (req, res) => {
  const { email, mobile } = req.body;
  if (!email || !mobile) {
    return res.status(400).json({ error: 'Email and mobile are required.' });
  }

  try {
    const [rows] = await db.query(
      'SELECT email, mobile FROM registrations WHERE (email = ? OR mobile = ?) AND status != "FAILED" LIMIT 1',
      [email, mobile]
    );

    if (rows.length > 0) {
      return res.json({
        exists: true,
        error: 'You are already registered. Duplicate registrations are not accepted.'
      });
    } else {
      return res.json({ exists: false });
    }
  } catch (err) {
    console.error('Error checking duplicate:', err);
    res.status(500).json({ error: 'Database error.' });
  }
});

// 3. Query registration by email, mobile, or id (Public verification / auto-prefill)
// 3. Query registration by email, mobile, or id (Public verification / auto-prefill)
app.post('/api/registrations/query', async (req, res) => {
  const { type, value } = req.body;
  if (!type || !value) {
    return res.status(400).json({ error: 'Type and value are required.' });
  }

  try {
    let rows = [];
    if (type === 'email') {
      const cleanValue = value.trim().toLowerCase();
      [rows] = await db.query('SELECT * FROM registrations WHERE LOWER(email) = ? LIMIT 1', [cleanValue]);
    } else if (type === 'id') {
      const cleanValue = value.trim().toUpperCase();
      [rows] = await db.query('SELECT * FROM registrations WHERE UPPER(id) = ? LIMIT 1', [cleanValue]);
    } else {
      const cleanValue = value.replace(/\D/g, '');
      [rows] = await db.query(
        'SELECT * FROM registrations WHERE mobile = ? OR REPLACE(mobile, " ", "") = ? OR REPLACE(REPLACE(mobile, " ", ""), "-", "") = ? LIMIT 1',
        [cleanValue, cleanValue, cleanValue]
      );
    }

    if (rows.length > 0) {
      res.json({ success: true, record: rows[0] });
    } else {
      res.json({ success: false, error: `No registration found matching the entered ${type}.` });
    }
  } catch (err) {
    console.error('Error querying registration:', err);
    res.status(500).json({ error: 'Database error querying registration.' });
  }
});

// 4. Delegate login (verify ID/email and password/mobile)
app.post('/api/registrations/login', async (req, res) => {
  const { value, password } = req.body;
  if (!value || !password) {
    return res.status(400).json({ error: 'Value (ID or Email) and password are required.' });
  }

  try {
    const cleanValue = value.trim();
    const inputPassword = password.trim();

    const [rows] = await db.query(
      'SELECT * FROM registrations WHERE (TRIM(id) = ? OR LOWER(email) = ?) AND status != "FAILED" LIMIT 1',
      [cleanValue, cleanValue.toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No active registration record found matching the entered ID/email.' });
    }

    const record = rows[0];
    const dbPassword = record.password ? record.password.trim() : '';
    const dbMobile = record.mobile ? record.mobile.replace(/\D/g, '') : '';

    let isValid = false;
    if (dbPassword) {
      isValid = (dbPassword.toLowerCase() === inputPassword.toLowerCase());
    } else if (dbMobile) {
      const cleanInputMobile = inputPassword.replace(/\D/g, '');
      isValid = (dbMobile === cleanInputMobile) || 
                (dbMobile.length >= 10 && cleanInputMobile.length >= 10 && dbMobile.slice(-10) === cleanInputMobile.slice(-10));
    }

    if (isValid) {
      res.json({ success: true, record });
    } else {
      res.status(401).json({ error: 'Invalid password. For existing users without a set password, please try using your registered 10-digit mobile number as the password.' });
    }
  } catch (err) {
    console.error('Delegate login error:', err);
    res.status(500).json({ error: 'Database authentication error.' });
  }
});

// 5. Update delegate profile details
app.post('/api/registrations/update-profile', async (req, res) => {
  const {
    id, password, newPassword, fullName, gender, institution, designation,
    councilRegNo, address, city, state, pincode, tier, category, iaphdNo,
    foodPreference, hasAccompanying, accompanyingName, accompanyingCount, accompanyingFood, profilePic
  } = req.body;

  if (!id || !password) {
    return res.status(400).json({ error: 'ID and password are required.' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM registrations WHERE TRIM(id) = ? AND status != "FAILED" LIMIT 1', [id.trim()]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Registration record not found.' });
    }

    const record = rows[0];
    const dbPassword = record.password ? record.password.trim() : '';
    const dbMobile = record.mobile ? record.mobile.replace(/\D/g, '') : '';

    let isValid = false;
    if (dbPassword) {
      isValid = (dbPassword.toLowerCase() === password.trim().toLowerCase());
    } else if (dbMobile) {
      const cleanInputMobile = password.trim().replace(/\D/g, '');
      isValid = (dbMobile === cleanInputMobile) || 
                (dbMobile.length >= 10 && cleanInputMobile.length >= 10 && dbMobile.slice(-10) === cleanInputMobile.slice(-10));
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Authentication failed. Unable to save profile changes.' });
    }

    const finalPassword = newPassword && newPassword.trim() ? newPassword.trim() : (dbPassword || password.trim());

    await db.query(
      `UPDATE registrations SET 
        fullName = ?, gender = ?, institution = ?, designation = ?, councilRegNo = ?, address = ?, city = ?, state = ?, 
        pincode = ?, tier = ?, category = ?, iaphdNo = ?, foodPreference = ?, hasAccompanying = ?, accompanyingName = ?, 
        accompanyingCount = ?, accompanyingFood = ?, profilePic = ?, password = ?
      WHERE id = ?`,
      [
        fullName || record.fullName, gender || null, institution || null, designation || null,
        councilRegNo || null, address || null, city || null, state || null, pincode || null,
        tier || record.tier, category || record.category, iaphdNo || null, foodPreference || null,
        hasAccompanying || 'no', accompanyingName || null, parseInt(accompanyingCount, 10) || 0,
        accompanyingFood || null, profilePic || record.profilePic, finalPassword, id.trim()
      ]
    );

    const [updatedRows] = await db.query('SELECT * FROM registrations WHERE id = ? LIMIT 1', [id.trim()]);
    res.json({ success: true, message: 'Profile updated successfully!', record: updatedRows[0] });
  } catch (err) {
    console.error('Error updating delegate profile:', err);
    res.status(500).json({ error: 'Database error updating profile.' });
  }
});

// 6. Submit a new registration (Public checkout callback)
app.post('/api/registrations', async (req, res) => {
  const {
    fullName, email, mobile, gender, institution, designation,
    councilRegNo, address, city, state, pincode, tier, category, iaphdNo,
    foodPreference, hasAccompanying, accompanyingName, accompanyingCount,
    accompanyingFood, transactionId, paymentDate, amountPaid, status, offline_online, profilePic, paymentScreenshot
  } = req.body;

  const trimmedFullName = typeof fullName === 'string' ? fullName.trim() : '';
  const trimmedEmail = typeof email === 'string' ? email.trim() : '';
  const trimmedMobile = typeof mobile === 'string' ? mobile.trim() : '';
  const trimmedTier = typeof tier === 'string' ? tier.trim() : '';
  const trimmedCategory = typeof category === 'string' ? category.trim() : '';

  if (!trimmedFullName || !trimmedEmail || !trimmedMobile || !trimmedTier || !trimmedCategory) {
    return res.status(400).json({ error: 'Missing mandatory registration fields.' });
  }

  try {
    // Check if email or mobile already exists with status other than FAILED
    const [existingRows] = await db.query(
      'SELECT email, mobile FROM registrations WHERE (email = ? OR mobile = ?) AND status != "FAILED" LIMIT 1',
      [trimmedEmail, trimmedMobile]
    );

    if (existingRows.length > 0) {
      return res.status(400).json({ error: 'You are already registered. Duplicate registrations are not accepted.' });
    }

    // Check if there is an existing failed registration to update/reuse
    const [failedRows] = await db.query(
      'SELECT id FROM registrations WHERE (email = ? OR mobile = ?) AND status = "FAILED" LIMIT 1',
      [trimmedEmail, trimmedMobile]
    );

    let isUpdate = false;
    let existingFailedId = null;
    if (failedRows.length > 0) {
      isUpdate = true;
      existingFailedId = failedRows[0].id;
    }

    let generatedPassword = null;
    if (status !== 'FAILED') {
      generatedPassword = Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    let generatedId;
    if (status === 'FAILED') {
      if (isUpdate) {
        generatedId = existingFailedId;
      } else {
        generatedId = `FAIL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    } else if (offline_online === 'offline' && status === 'PENDING') {
      // Generate sequential registration ID like OFFLINE-0001
      const [idRows] = await db.query("SELECT id FROM registrations WHERE id LIKE 'OFFLINE-%' ORDER BY created_at DESC, id DESC LIMIT 1");
      let nextNum = 1;
      if (idRows.length > 0) {
        const latestId = idRows[0].id;
        const num = parseInt(latestId.replace('OFFLINE-', ''), 10);
        nextNum = num + 1;
      }
      generatedId = `OFFLINE-${String(nextNum).padStart(4, '0')}`;
    } else {
      // Generate sequential registration ID like NATCON-0001
      const [idRows] = await db.query("SELECT id FROM registrations WHERE id LIKE 'NATCON-%' ORDER BY created_at DESC, id DESC LIMIT 1");
      let nextNum = 1;
      if (idRows.length > 0) {
        const latestId = idRows[0].id;
        const num = parseInt(latestId.replace('NATCON-', ''), 10);
        nextNum = num + 1;
      }
      generatedId = `NATCON-${String(nextNum).padStart(4, '0')}`;
    }

    if (isUpdate) {
      await db.query(
        `UPDATE registrations SET 
          id = ?, fullName = ?, email = ?, mobile = ?, gender = ?, institution = ?, designation = ?, councilRegNo = ?, 
          address = ?, city = ?, state = ?, pincode = ?, tier = ?, category = ?, iaphdNo = ?, foodPreference = ?, 
          hasAccompanying = ?, accompanyingName = ?, accompanyingCount = ?, accompanyingFood = ?, transactionId = ?, 
          paymentDate = ?, amountPaid = ?, status = ?, offline_online = ?, profilePic = ?, paymentScreenshot = ?, password = ?
        WHERE id = ?`,
        [
          generatedId, trimmedFullName, trimmedEmail, trimmedMobile, gender || null, institution || null, designation || null,
          councilRegNo || null, address || null, city || null, state || null, pincode || null, trimmedTier, trimmedCategory,
          iaphdNo || null, foodPreference || null, hasAccompanying || 'no', accompanyingName || null,
          accompanyingCount || 0, accompanyingFood || null, transactionId || null,
          paymentDate || null, amountPaid || 0, status || 'PENDING', offline_online || 'online', profilePic || null, paymentScreenshot || null,
          generatedPassword,
          existingFailedId
        ]
      );
    } else {
      await db.query(
        `INSERT INTO registrations 
        (id, fullName, email, mobile, gender, institution, designation, councilRegNo, address, city, state, pincode, tier, category, iaphdNo, foodPreference, hasAccompanying, accompanyingName, accompanyingCount, accompanyingFood, transactionId, paymentDate, amountPaid, status, offline_online, profilePic, paymentScreenshot, password) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          generatedId, trimmedFullName, trimmedEmail, trimmedMobile, gender || null, institution || null, designation || null,
          councilRegNo || null, address || null, city || null, state || null, pincode || null, trimmedTier, trimmedCategory,
          iaphdNo || null, foodPreference || null, hasAccompanying || 'no', accompanyingName || null,
          accompanyingCount || 0, accompanyingFood || null, transactionId || null,
          paymentDate || null, amountPaid || 0, status || 'PENDING', offline_online || 'online', profilePic || null, paymentScreenshot || null,
          generatedPassword
        ]
      );
    }

    // Mock Email Integration logging for local testing (skip for FAILED status)
    if (status !== 'FAILED') {
      if (offline_online === 'offline' && status === 'PENDING') {
        console.log(`\n========================================`);
        console.log(`✉️ [MOCK EMAIL OFFLINE RECEIVED DISPATCHED]`);
        console.log(`👉 To Delegate: ${email}`);
        console.log(`👉 Subject: Offline Registration Received - 30th IAPHD NATCON 2026 (ID: ${generatedId})`);
        console.log(`👉 Status: PENDING`);
        console.log(`----------------------------------------`);
        console.log(`========================================\n`);
      } else {
        console.log(`\n========================================`);
        console.log(`✉️ [MOCK EMAIL CONFIRMATION DISPATCHED]`);
        console.log(`👉 To Delegate: ${email}`);
        console.log(`👉 Subject: Registration Confirmed - 30th IAPHD NATCON 2026 (ID: ${generatedId})`);
        console.log(`👉 Password: ${generatedPassword}`);
        console.log(`👉 City: ${city || 'N/A'}`);
        console.log(`👉 Delegate Category: ${category}`);
        console.log(`👉 Amount Paid: ₹${amountPaid}`);
        console.log(`👉 Transaction ID: ${transactionId || 'N/A'}`);
        console.log(`----------------------------------------`);
        console.log(`👉 Notification Sent to Admin: registrations.30thiaphdnatcon@gmail.com`);
        console.log(`========================================\n`);
      }
    }

    res.status(isUpdate ? 200 : 201).json({ 
      success: true, 
      message: isUpdate ? 'Registration updated successfully!' : 'Registration recorded successfully!', 
      id: generatedId,
      password: generatedPassword
    });
  } catch (err) {
    console.error('Error inserting/updating registration:', err);
    res.status(500).json({ error: 'Database error recording registration: ' + err.message });
  }
});

const confirmOfflineRegistrationIfNeeded = async (id) => {
  const [rows] = await db.query('SELECT * FROM registrations WHERE id = ? LIMIT 1', [id]);
  if (rows.length === 0) {
    return { success: false, error: 'Registration record not found.' };
  }

  const record = rows[0];
  const isOffline = (id.startsWith('OFFLINE-') || record.offline_online === 'offline');

  if (isOffline && record.status !== 'CONFIRMED') {
    // Generate next NATCON-XXXX ID
    const [idRows] = await db.query("SELECT id FROM registrations WHERE id LIKE 'NATCON-%' ORDER BY created_at DESC, id DESC LIMIT 1");
    let nextNum = 1;
    if (idRows.length > 0) {
      const latestId = idRows[0].id;
      const num = parseInt(latestId.replace('NATCON-', ''), 10);
      nextNum = num + 1;
    }
    const newId = `NATCON-${String(nextNum).padStart(4, '0')}`;
    const password = record.password || Math.random().toString(36).substring(2, 10).toUpperCase();

    // Use connection for transaction to ensure integrity and order
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      // 1. Update submissions first to avoid FK constraint issues
      await connection.query('UPDATE submissions SET regId = ? WHERE regId = ?', [newId, id]);
      
      // 2. Update registrations table primary key id and status
      await connection.query(
        "UPDATE registrations SET id = ?, status = 'CONFIRMED', password = ? WHERE id = ?",
        [newId, password, id]
      );
      
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

    // Mock Email Integration logging for confirmation
    console.log(`\n========================================`);
    console.log(`✉️ [MOCK EMAIL CONFIRMATION DISPATCHED ON UPGRADE]`);
    console.log(`👉 To Delegate: ${record.email}`);
    console.log(`👉 Subject: Registration Confirmed - 30th IAPHD NATCON 2026 (ID: ${newId})`);
    console.log(`👉 Password: ${password}`);
    console.log(`👉 City: ${record.city || 'N/A'}`);
    console.log(`👉 Delegate Category: ${record.category}`);
    console.log(`👉 Amount Paid: ₹${record.amountPaid}`);
    console.log(`----------------------------------------`);
    console.log(`👉 Notification Sent to Admin: registrations.30thiaphdnatcon@gmail.com`);
    console.log(`========================================\n`);

    return { success: true, newId, password };
  }

  return { success: false, notOfflineOrAlreadyConfirmed: true };
};

// Approve delegate registration action
app.post('/api/registrations/:id/approve', verifyAdminToken, async (req, res) => {
  const { id } = req.params;
  try {
    const upgradeRes = await confirmOfflineRegistrationIfNeeded(id);
    if (upgradeRes.success) {
      return res.json({ success: true, newId: upgradeRes.newId, password: upgradeRes.password });
    }
    
    if (upgradeRes.notOfflineOrAlreadyConfirmed) {
      // Normal/already confirmed registration, just update status if not confirmed
      await db.query("UPDATE registrations SET status = 'CONFIRMED' WHERE id = ?", [id]);
      
      // Fetch updated record and log email
      const [rows] = await db.query('SELECT * FROM registrations WHERE id = ? LIMIT 1', [id]);
      if (rows.length > 0) {
        const record = rows[0];
        console.log(`\n========================================`);
        console.log(`✉️ [MOCK EMAIL CONFIRMATION DISPATCHED]`);
        console.log(`👉 To Delegate: ${record.email}`);
        console.log(`👉 Subject: Registration Confirmed - 30th IAPHD NATCON 2026 (ID: ${id})`);
        console.log(`----------------------------------------`);
        console.log(`========================================\n`);
      }
      return res.json({ success: true });
    }

    return res.status(400).json({ error: upgradeRes.error || 'Failed to approve registration.' });
  } catch (err) {
    console.error('Error approving registration:', err);
    res.status(500).json({ error: 'Database error approving registration: ' + err.message });
  }
});

// Update registration action
app.put('/api/registrations/:id', verifyAdminToken, async (req, res) => {
  const { id } = req.params;
  const {
    fullName, email, mobile, gender, institution, designation,
    councilRegNo, address, city, state, pincode, tier, category, iaphdNo,
    foodPreference, hasAccompanying, accompanyingName, accompanyingCount,
    accompanyingFood, status, offline_online, profilePic, paymentScreenshot, password
  } = req.body;

  try {
    // If status is updated to CONFIRMED, check if we need offline confirm logic first
    if (status === 'CONFIRMED') {
      const upgradeRes = await confirmOfflineRegistrationIfNeeded(id);
      if (upgradeRes.success) {
        // If upgraded, perform updates on the newly generated id instead
        const targetId = upgradeRes.newId;
        const targetPassword = upgradeRes.password;
        await db.query(
          `UPDATE registrations SET 
            fullName = ?, email = ?, mobile = ?, gender = ?, institution = ?, designation = ?, councilRegNo = ?, 
            address = ?, city = ?, state = ?, pincode = ?, tier = ?, category = ?, iaphdNo = ?, foodPreference = ?, 
            hasAccompanying = ?, accompanyingName = ?, accompanyingCount = ?, accompanyingFood = ?, status = ?,
            offline_online = ?, profilePic = ?, paymentScreenshot = ?, password = ?
          WHERE id = ?`,
          [
            fullName, email, mobile, gender || null, institution || null, designation || null,
            councilRegNo || null, address || null, city || null, state || null, pincode || null, tier, category,
            iaphdNo || null, foodPreference || null, hasAccompanying || 'no', accompanyingName || null,
            accompanyingCount || 0, accompanyingFood || null, 'CONFIRMED',
            offline_online || 'offline', profilePic || null, paymentScreenshot || null, targetPassword, targetId
          ]
        );
        return res.json({ success: true, newId: targetId, password: targetPassword });
      }
    }

    // Normal update
    await db.query(
      `UPDATE registrations SET 
        fullName = ?, email = ?, mobile = ?, gender = ?, institution = ?, designation = ?, councilRegNo = ?, 
        address = ?, city = ?, state = ?, pincode = ?, tier = ?, category = ?, iaphdNo = ?, foodPreference = ?, 
        hasAccompanying = ?, accompanyingName = ?, accompanyingCount = ?, accompanyingFood = ?, status = ?,
        offline_online = ?, profilePic = ?, paymentScreenshot = ?, password = ?
      WHERE id = ?`,
      [
        fullName, email, mobile, gender || null, institution || null, designation || null,
        councilRegNo || null, address || null, city || null, state || null, pincode || null, tier, category,
        iaphdNo || null, foodPreference || null, hasAccompanying || 'no', accompanyingName || null,
        accompanyingCount || 0, accompanyingFood || null, status || 'PENDING',
        offline_online || 'online', profilePic || null, paymentScreenshot || null, password || null, id
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error updating registration:', err);
    res.status(500).json({ error: 'Database error updating registration: ' + err.message });
  }
});

// ── ADMIN ROOT AUTHENTICATION ─────────────────────────────────────────────

// 1. Admin login endpoint
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Please enter username and password.' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // Sign JWT token valid for 8 hours
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ success: true, token, username: admin.username });
  } catch (err) {
    console.error('Server login error:', err);
    res.status(500).json({ error: 'Server authentication error.' });
  }
});

// 2. Token verification endpoint (checks if admin is logged in)
app.get('/api/admin/verify', verifyAdminToken, (req, res) => {
  res.json({ success: true, username: req.admin.username });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`🚀 IAPHD NATCON 2026 API Server is running!`);
  console.log(`🔗 Port: http://localhost:${PORT}`);
  console.log(`========================================`);
});
