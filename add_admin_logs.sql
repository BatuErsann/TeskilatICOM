CREATE TABLE IF NOT EXISTS admin_action_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);