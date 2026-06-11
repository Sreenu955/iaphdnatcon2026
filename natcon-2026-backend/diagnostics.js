const db = require('./db');

async function test() {
  try {
    console.log("Checking submissions table columns and rows...");
    const [cols] = await db.query("SHOW COLUMNS FROM submissions");
    console.log("SUBMISSIONS COLUMNS:", JSON.stringify(cols, null, 2));
    
    const [rows] = await db.query("SELECT * FROM submissions LIMIT 5");
    console.log("SUBMISSIONS ROWS:", JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    process.exit(0);
  }
}

test();
