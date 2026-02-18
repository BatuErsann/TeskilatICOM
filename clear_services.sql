-- Clear all services from the database
USE teskilat_db;

TRUNCATE TABLE services;

SELECT 'All services have been deleted!' AS message;
