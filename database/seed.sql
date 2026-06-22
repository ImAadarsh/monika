-- Demo / sample forms seed
-- Run after schema.sql on a fresh database, or use the UPDATE below on existing data.

-- Publish the Customer Feedback form (created from the "Customer Feedback" template)
UPDATE forms SET is_published = 1 WHERE slug = 'customer-feedback';
