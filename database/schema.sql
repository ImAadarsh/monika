-- FormFlow schema for u262009927_monika

CREATE TABLE IF NOT EXISTS admins (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forms (
  id CHAR(36) PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  settings JSON,
  is_published TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_forms_slug (slug),
  INDEX idx_forms_published (is_published)
);

CREATE TABLE IF NOT EXISTS form_fields (
  id CHAR(36) PRIMARY KEY,
  form_id CHAR(36) NOT NULL,
  type VARCHAR(50) NOT NULL,
  label VARCHAR(500) NOT NULL,
  placeholder VARCHAR(500),
  required TINYINT(1) DEFAULT 0,
  options JSON,
  settings JSON,
  order_index INT NOT NULL DEFAULT 0,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
  INDEX idx_fields_form (form_id)
);

CREATE TABLE IF NOT EXISTS form_submissions (
  id CHAR(36) PRIMARY KEY,
  form_id CHAR(36) NOT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
  INDEX idx_submissions_form (form_id),
  INDEX idx_submissions_date (submitted_at)
);

CREATE TABLE IF NOT EXISTS submission_answers (
  id CHAR(36) PRIMARY KEY,
  submission_id CHAR(36) NOT NULL,
  field_id CHAR(36) NOT NULL,
  value TEXT,
  FOREIGN KEY (submission_id) REFERENCES form_submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (field_id) REFERENCES form_fields(id) ON DELETE CASCADE,
  INDEX idx_answers_submission (submission_id),
  INDEX idx_answers_field (field_id)
);

INSERT INTO admins (id, email, password_hash, name)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@formflow.com',
  '$2b$12$luUJuR6uxJWUmGkuVPmygu64XboQd8wzTyUHzhcA93oj36U2UapBm',
  'Admin'
) ON DUPLICATE KEY UPDATE email = email;
