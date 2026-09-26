-- =====================================================================
-- INVENTRA — Master Database Setup Script
-- Executes schema setup, initial seed data, and operational views
-- =====================================================================

SOURCE schema.sql;
SOURCE seed.sql;
SOURCE views_and_procedures.sql;

SELECT 'INVENTRA database initialized and populated successfully!' AS status;
