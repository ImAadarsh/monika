-- Optional migration for enhanced FormFlow features
-- Run after schema.sql if you want submission metadata and view tracking

ALTER TABLE form_submissions
  ADD COLUMN completion_time_ms INT DEFAULT NULL,
  ADD COLUMN referrer VARCHAR(500) DEFAULT NULL,
  ADD COLUMN metadata JSON DEFAULT NULL;

CREATE TABLE IF NOT EXISTS form_views (
  id CHAR(36) PRIMARY KEY,
  form_id CHAR(36) NOT NULL,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
  INDEX idx_views_form (form_id),
  INDEX idx_views_date (viewed_at)
);

CREATE TABLE IF NOT EXISTS form_webhooks (
  id CHAR(36) PRIMARY KEY,
  form_id CHAR(36) NOT NULL,
  url VARCHAR(500) NOT NULL,
  events JSON NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
  INDEX idx_webhooks_form (form_id)
);
