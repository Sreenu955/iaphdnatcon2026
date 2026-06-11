const db = require('./db');

async function run() {
  try {
    console.log("Syncing database: Checking registrations table columns...");
    const [columns] = await db.query("SHOW COLUMNS FROM registrations LIKE 'city'");
    if (columns.length > 0) {
      console.log("✅ Column 'city' already exists!");
    } else {
      await db.query("ALTER TABLE registrations ADD COLUMN city VARCHAR(100) AFTER address");
      console.log("✅ Column 'city' added successfully after 'address'!");
    }

    const [offlineColumns] = await db.query("SHOW COLUMNS FROM registrations LIKE 'offline_online'");
    if (offlineColumns.length > 0) {
      console.log("✅ Column 'offline_online' already exists!");
    } else {
      await db.query("ALTER TABLE registrations ADD COLUMN offline_online VARCHAR(20) DEFAULT 'online'");
      console.log("✅ Column 'offline_online' added successfully!");
    }

    const [profilePicColumns] = await db.query("SHOW COLUMNS FROM registrations LIKE 'profilePic'");
    if (profilePicColumns.length > 0) {
      await db.query("ALTER TABLE registrations MODIFY COLUMN profilePic LONGTEXT DEFAULT NULL");
      console.log("✅ Column 'profilePic' already exists and is ensured as LONGTEXT!");
    } else {
      await db.query("ALTER TABLE registrations ADD COLUMN profilePic LONGTEXT DEFAULT NULL");
      console.log("✅ Column 'profilePic' added successfully as LONGTEXT!");
    }

    const [screenshotColumns] = await db.query("SHOW COLUMNS FROM registrations LIKE 'paymentScreenshot'");
    if (screenshotColumns.length > 0) {
      console.log("✅ Column 'paymentScreenshot' already exists!");
    } else {
      await db.query("ALTER TABLE registrations ADD COLUMN paymentScreenshot LONGTEXT DEFAULT NULL AFTER profilePic");
      console.log("✅ Column 'paymentScreenshot' added successfully!");
    }

    console.log("Syncing database: Creating schedules table...");
    await db.query(`
      CREATE TABLE IF NOT EXISTS schedules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dayNumber INT NOT NULL,
        timeSlot VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        speaker VARCHAR(255) NOT NULL,
        venue VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table 'schedules' is active!");

    console.log("Syncing database: Creating sponsors table...");
    await db.query(`
      CREATE TABLE IF NOT EXISTS sponsors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        logoUrl TEXT NOT NULL,
        tier VARCHAR(100) NOT NULL,
        orderIndex INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table 'sponsors' is active!");

    console.log("Syncing database: Creating announcements table...");
    await db.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        isActive BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table 'announcements' is active!");

    console.log("Syncing database: Creating gallery table...");
    await db.query(`
      CREATE TABLE IF NOT EXISTS gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        mediaUrl TEXT NOT NULL,
        mediaType VARCHAR(50) DEFAULT 'image',
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table 'gallery' is active!");

  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  } finally {
    process.exit(0);
  }
}

run();
