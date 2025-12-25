const db = require('./src/config/db');

async function update() {
  try {
    console.log("Updating database...");

    // Create Services Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    try {
        await db.execute("ALTER TABLE services ADD COLUMN display_order INT DEFAULT 0;");
    } catch (e) { }

    // Create Site Contents Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS site_contents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page_name VARCHAR(50) NOT NULL,
        section_name VARCHAR(50) NOT NULL,
        content_key VARCHAR(100) NOT NULL UNIQUE,
        content_value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log("Database updated successfully");
  } catch (err) {
    console.error("Error updating database:", err);
  }
  process.exit();
}

update();
