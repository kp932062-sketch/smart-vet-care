CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(191) NOT NULL,
  mobile VARCHAR(32) DEFAULT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'farmer', 'doctor', 'admin') NOT NULL DEFAULT 'user',
  pet_name VARCHAR(150) DEFAULT NULL,
  status ENUM('active','blocked','deleted') NOT NULL DEFAULT 'active',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  subscription_tier VARCHAR(64) DEFAULT NULL,
  subscription_expiry DATETIME DEFAULT NULL,
  reset_password_code VARCHAR(16) DEFAULT NULL,
  reset_password_expires DATETIME DEFAULT NULL,
  reactivation_requested TINYINT(1) NOT NULL DEFAULT 0,
  reactivation_reason TEXT DEFAULT NULL,
  reactivation_status VARCHAR(32) DEFAULT 'none',
  reactivation_admin_response TEXT DEFAULT NULL,
  reactivation_requested_at DATETIME DEFAULT NULL,
  reactivation_responded_at DATETIME DEFAULT NULL,
  last_login_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role_status (role, status),
  KEY idx_users_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS doctors (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED DEFAULT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(191) NOT NULL,
  phone VARCHAR(32) DEFAULT NULL,
  specialization VARCHAR(191) DEFAULT NULL,
  experience INT DEFAULT 0,
  qualifications TEXT DEFAULT NULL,
  consultation_fee DECIMAL(10,2) NOT NULL DEFAULT 500.00,
  license_number VARCHAR(128) DEFAULT NULL,
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  is_online TINYINT(1) NOT NULL DEFAULT 0,
  approved TINYINT(1) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  unique_access_link VARCHAR(191) DEFAULT NULL,
  profile_image VARCHAR(255) DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  languages JSON DEFAULT NULL,
  working_hours JSON DEFAULT NULL,
  documents JSON DEFAULT NULL,
  profile_completeness INT NOT NULL DEFAULT 0,
  bank_account_holder_name VARCHAR(191) DEFAULT NULL,
  bank_account_number VARCHAR(64) DEFAULT NULL,
  bank_ifsc_code VARCHAR(32) DEFAULT NULL,
  bank_name VARCHAR(191) DEFAULT NULL,
  bank_verified TINYINT(1) NOT NULL DEFAULT 0,
  submitted_at DATETIME DEFAULT NULL,
  approved_at DATETIME DEFAULT NULL,
  rejected_at DATETIME DEFAULT NULL,
  rejection_reason TEXT DEFAULT NULL,
  last_login_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_doctors_email (email),
  UNIQUE KEY uq_doctors_access_link (unique_access_link),
  KEY idx_doctors_status (status, approved),
  CONSTRAINT fk_doctors_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pets (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  owner_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  species VARCHAR(100) NOT NULL,
  breed VARCHAR(100) DEFAULT NULL,
  age INT DEFAULT NULL,
  gender VARCHAR(32) DEFAULT NULL,
  weight DECIMAL(10,2) DEFAULT NULL,
  health_status VARCHAR(64) DEFAULT 'healthy',
  vaccinations JSON DEFAULT NULL,
  image_url VARCHAR(255) DEFAULT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_pets_owner (owner_id, is_active),
  CONSTRAINT fk_pets_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS appointments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  appointment_uid VARCHAR(20) DEFAULT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  doctor_id BIGINT UNSIGNED NOT NULL,
  pet_id BIGINT UNSIGNED DEFAULT NULL,
  pet_name VARCHAR(150) DEFAULT NULL,
  reason TEXT DEFAULT NULL,
  description TEXT DEFAULT NULL,
  urgency_level VARCHAR(32) DEFAULT 'medium',
  appointment_date DATETIME NOT NULL,
  status ENUM('pending','confirmed','completed','cancelled','rejected') NOT NULL DEFAULT 'pending',
  confirmed_at DATETIME DEFAULT NULL,
  cancelled_at DATETIME DEFAULT NULL,
  cancellation_reason TEXT DEFAULT NULL,
  started_at DATETIME DEFAULT NULL,
  completed_at DATETIME DEFAULT NULL,
  consultation JSON DEFAULT NULL,
  prescription JSON DEFAULT NULL,
  payment JSON DEFAULT NULL,
  qr_code_data_url LONGTEXT DEFAULT NULL,
  report_generated TINYINT(1) NOT NULL DEFAULT 0,
  rating INT DEFAULT NULL,
  review TEXT DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_appointments_uid (appointment_uid),
  KEY idx_appointments_user (user_id, appointment_date),
  KEY idx_appointments_doctor (doctor_id, appointment_date),
  KEY idx_appointments_status (status),
  CONSTRAINT fk_appointments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_appointments_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  CONSTRAINT fk_appointments_pet FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE appointments
  MODIFY COLUMN status ENUM('pending','confirmed','completed','cancelled','rejected') NOT NULL DEFAULT 'pending';

SET @appt_has_uid := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'appointments' AND COLUMN_NAME = 'appointment_uid'
);
SET @appt_uid_sql := IF(@appt_has_uid = 0,
  'ALTER TABLE appointments ADD COLUMN appointment_uid VARCHAR(20) DEFAULT NULL AFTER id',
  'SELECT 1'
);
PREPARE appt_uid_stmt FROM @appt_uid_sql;
EXECUTE appt_uid_stmt;
DEALLOCATE PREPARE appt_uid_stmt;

SET @appt_has_qr := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'appointments' AND COLUMN_NAME = 'qr_code_data_url'
);
SET @appt_qr_sql := IF(@appt_has_qr = 0,
  'ALTER TABLE appointments ADD COLUMN qr_code_data_url LONGTEXT DEFAULT NULL AFTER payment',
  'SELECT 1'
);
PREPARE appt_qr_stmt FROM @appt_qr_sql;
EXECUTE appt_qr_stmt;
DEALLOCATE PREPARE appt_qr_stmt;

UPDATE appointments
SET appointment_uid = CONCAT('APT-', DATE_FORMAT(COALESCE(appointment_date, created_at), '%Y%m%d'), '-', LPAD(id, 4, '0'))
WHERE appointment_uid IS NULL;

SET @appt_has_uid_idx := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'appointments' AND INDEX_NAME = 'uq_appointments_uid'
);
SET @appt_uid_idx_sql := IF(@appt_has_uid_idx = 0,
  'CREATE UNIQUE INDEX uq_appointments_uid ON appointments (appointment_uid)',
  'SELECT 1'
);
PREPARE appt_uid_idx_stmt FROM @appt_uid_idx_sql;
EXECUTE appt_uid_idx_stmt;
DEALLOCATE PREPARE appt_uid_idx_stmt;

CREATE TABLE IF NOT EXISTS treatments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  pet_id BIGINT UNSIGNED NOT NULL,
  doctor_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  appointment_id BIGINT UNSIGNED DEFAULT NULL,
  title VARCHAR(191) NOT NULL,
  description TEXT DEFAULT NULL,
  diagnosis TEXT DEFAULT NULL,
  symptoms JSON DEFAULT NULL,
  treatment_notes TEXT DEFAULT NULL,
  recommendations TEXT DEFAULT NULL,
  prescriptions JSON DEFAULT NULL,
  clinical_note JSON DEFAULT NULL,
  consultation_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  platform_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  medicines_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  payment_status VARCHAR(32) NOT NULL DEFAULT 'unpaid',
  report_accessible TINYINT(1) NOT NULL DEFAULT 0,
  payment_id VARCHAR(191) DEFAULT NULL,
  treatment_date DATETIME NOT NULL,
  paid_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_treatments_pet_date (pet_id, treatment_date),
  KEY idx_treatments_doctor_date (doctor_id, treatment_date),
  KEY idx_treatments_user_date (user_id, treatment_date),
  CONSTRAINT fk_treatments_pet FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  CONSTRAINT fk_treatments_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  CONSTRAINT fk_treatments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_treatments_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS medical_reports (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  appointment_id BIGINT UNSIGNED NOT NULL,
  appointment_uid VARCHAR(20) DEFAULT NULL,
  pet_name VARCHAR(100) NOT NULL,
  owner_name VARCHAR(100) NOT NULL,
  doctor_name VARCHAR(100) NOT NULL,
  diagnosis TEXT NOT NULL,
  treatment TEXT NOT NULL,
  prescription TEXT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  qr_code_data_url LONGTEXT DEFAULT NULL,
  report_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_medical_reports_appointment_uid (appointment_uid),
  KEY idx_medical_reports_appointment (appointment_id),
  KEY idx_medical_reports_appointment_uid (appointment_uid),
  KEY idx_medical_reports_report_date (report_date),
  CONSTRAINT fk_medical_reports_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @mr_has_uid := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'medical_reports' AND COLUMN_NAME = 'appointment_uid'
);
SET @mr_uid_sql := IF(@mr_has_uid = 0,
  'ALTER TABLE medical_reports ADD COLUMN appointment_uid VARCHAR(20) DEFAULT NULL AFTER appointment_id',
  'SELECT 1'
);
PREPARE mr_uid_stmt FROM @mr_uid_sql;
EXECUTE mr_uid_stmt;
DEALLOCATE PREPARE mr_uid_stmt;

SET @mr_has_qr := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'medical_reports' AND COLUMN_NAME = 'qr_code_data_url'
);
SET @mr_qr_sql := IF(@mr_has_qr = 0,
  'ALTER TABLE medical_reports ADD COLUMN qr_code_data_url LONGTEXT DEFAULT NULL AFTER notes',
  'SELECT 1'
);
PREPARE mr_qr_stmt FROM @mr_qr_sql;
EXECUTE mr_qr_stmt;
DEALLOCATE PREPARE mr_qr_stmt;

SET @mr_has_uid_idx := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'medical_reports' AND INDEX_NAME = 'uq_medical_reports_appointment_uid'
);
SET @mr_uid_idx_sql := IF(@mr_has_uid_idx = 0,
  'CREATE UNIQUE INDEX uq_medical_reports_appointment_uid ON medical_reports (appointment_uid)',
  'SELECT 1'
);
PREPARE mr_uid_idx_stmt FROM @mr_uid_idx_sql;
EXECUTE mr_uid_idx_stmt;
DEALLOCATE PREPARE mr_uid_idx_stmt;

SET @mr_has_uid_search_idx := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'medical_reports' AND INDEX_NAME = 'idx_medical_reports_appointment_uid'
);
SET @mr_uid_search_idx_sql := IF(@mr_has_uid_search_idx = 0,
  'CREATE INDEX idx_medical_reports_appointment_uid ON medical_reports (appointment_uid)',
  'SELECT 1'
);
PREPARE mr_uid_search_idx_stmt FROM @mr_uid_search_idx_sql;
EXECUTE mr_uid_search_idx_stmt;
DEALLOCATE PREPARE mr_uid_search_idx_stmt;

CREATE TABLE IF NOT EXISTS chats (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  admin_id BIGINT UNSIGNED DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_chats_user_id (user_id),
  KEY idx_chats_admin_id (admin_id),
  CONSTRAINT fk_chats_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_chats_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  chat_id BIGINT UNSIGNED NOT NULL,
  sender_id BIGINT UNSIGNED DEFAULT NULL,
  sender_role ENUM('admin', 'user') NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_messages_chat_id_created (chat_id, created_at),
  KEY idx_messages_sender (sender_id, sender_role),
  CONSTRAINT fk_messages_chat FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_messages (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NOT NULL,
  sender      ENUM('admin','user') NOT NULL,
  message     TEXT NOT NULL,
  is_read     TINYINT(1) NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_am_user_id    (user_id),
  KEY idx_am_created    (created_at),
  KEY idx_am_user_read  (user_id, is_read),
  CONSTRAINT fk_am_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS animals (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_animals_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS breeds (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  animal_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_breeds_animal_name (animal_id, name),
  KEY idx_breeds_animal (animal_id),
  CONSTRAINT fk_breeds_animal FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS visit_reasons (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(191) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_visit_reasons_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO animals (name) VALUES
('Dog'),
('Cat'),
('Horse'),
('Cow'),
('Buffalo'),
('Goat'),
('Sheep'),
('Rabbit'),
('Hamster'),
('Guinea pig'),
('Parrot'),
('Elephant'),
('Camel'),
('Donkey'),
('Pig'),
('Chicken'),
('Duck'),
('Turkey'),
('Pigeon'),
('Tortoise');

INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Labrador Retriever' FROM animals WHERE name = 'Dog';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'German Shepherd' FROM animals WHERE name = 'Dog';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Golden Retriever' FROM animals WHERE name = 'Dog';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Persian' FROM animals WHERE name = 'Cat';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Siamese' FROM animals WHERE name = 'Cat';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Maine Coon' FROM animals WHERE name = 'Cat';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Arabian' FROM animals WHERE name = 'Horse';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Thoroughbred' FROM animals WHERE name = 'Horse';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Marwari' FROM animals WHERE name = 'Horse';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Holstein Friesian' FROM animals WHERE name = 'Cow';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Jersey' FROM animals WHERE name = 'Cow';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Gir' FROM animals WHERE name = 'Cow';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Murrah' FROM animals WHERE name = 'Buffalo';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Nili-Ravi' FROM animals WHERE name = 'Buffalo';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Jaffarabadi' FROM animals WHERE name = 'Buffalo';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Boer' FROM animals WHERE name = 'Goat';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Sirohi' FROM animals WHERE name = 'Goat';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Jamunapari' FROM animals WHERE name = 'Goat';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Merino' FROM animals WHERE name = 'Sheep';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Suffolk' FROM animals WHERE name = 'Sheep';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Deccani' FROM animals WHERE name = 'Sheep';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'New Zealand White' FROM animals WHERE name = 'Rabbit';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Dutch Rabbit' FROM animals WHERE name = 'Rabbit';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Angora Rabbit' FROM animals WHERE name = 'Rabbit';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Syrian Hamster' FROM animals WHERE name = 'Hamster';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Dwarf Hamster' FROM animals WHERE name = 'Hamster';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Roborovski' FROM animals WHERE name = 'Hamster';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'American Guinea Pig' FROM animals WHERE name = 'Guinea pig';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Abyssinian Guinea Pig' FROM animals WHERE name = 'Guinea pig';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Peruvian Guinea Pig' FROM animals WHERE name = 'Guinea pig';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'African Grey' FROM animals WHERE name = 'Parrot';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Macaw' FROM animals WHERE name = 'Parrot';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Cockatiel' FROM animals WHERE name = 'Parrot';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Indian Elephant' FROM animals WHERE name = 'Elephant';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'African Elephant' FROM animals WHERE name = 'Elephant';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Bactrian Camel' FROM animals WHERE name = 'Camel';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Dromedary Camel' FROM animals WHERE name = 'Camel';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Miniature Donkey' FROM animals WHERE name = 'Donkey';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Standard Donkey' FROM animals WHERE name = 'Donkey';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Yorkshire' FROM animals WHERE name = 'Pig';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Landrace' FROM animals WHERE name = 'Pig';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Large White' FROM animals WHERE name = 'Pig';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Leghorn' FROM animals WHERE name = 'Chicken';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Rhode Island Red' FROM animals WHERE name = 'Chicken';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Kadaknath' FROM animals WHERE name = 'Chicken';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Pekin Duck' FROM animals WHERE name = 'Duck';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Khaki Campbell' FROM animals WHERE name = 'Duck';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Muscovy Duck' FROM animals WHERE name = 'Duck';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Broad Breasted White' FROM animals WHERE name = 'Turkey';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Narragansett' FROM animals WHERE name = 'Turkey';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Homing Pigeon' FROM animals WHERE name = 'Pigeon';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Fantail Pigeon' FROM animals WHERE name = 'Pigeon';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Indian Star Tortoise' FROM animals WHERE name = 'Tortoise';
INSERT IGNORE INTO breeds (animal_id, name)
SELECT id, 'Red-footed Tortoise' FROM animals WHERE name = 'Tortoise';

DELETE FROM visit_reasons
WHERE title REGEXP '^(Dog|Cat|Horse|Cow|Buffalo|Goat|Sheep|Rabbit|Hamster|Guinea pig|Parrot|Elephant|Camel|Donkey|Pig|Chicken|Duck|Turkey|Pigeon|Tortoise) ';

INSERT IGNORE INTO visit_reasons (title) VALUES
('Fever'),
('High fever'),
('Low-grade fever'),
('Persistent cough'),
('Dry cough'),
('Breathing difficulty'),
('Rapid breathing'),
('Wheezing'),
('Nasal discharge'),
('Sneezing'),
('Vomiting'),
('Frequent vomiting'),
('Diarrhea'),
('Bloody stool'),
('Constipation'),
('Loss of appetite'),
('Reduced water intake'),
('Weight loss'),
('Sudden weight gain'),
('Lethargy'),
('Weakness'),
('Dehydration'),
('Abdominal pain'),
('Bloating'),
('Excessive drooling'),
('Bad breath'),
('Dental pain'),
('Tooth fracture'),
('Gum bleeding'),
('Difficulty chewing'),
('Eye redness'),
('Eye discharge'),
('Cloudy eyes'),
('Excessive tearing'),
('Vision problem'),
('Ear infection'),
('Ear discharge'),
('Head shaking'),
('Hearing concern'),
('Skin infection'),
('Skin rash'),
('Skin redness'),
('Itching'),
('Hair loss'),
('Dandruff'),
('Hot spot'),
('Wound care'),
('Deep cut'),
('Abscess'),
('Swelling'),
('Lump or mass'),
('Injury'),
('Limping'),
('Fracture suspicion'),
('Joint pain'),
('Arthritis pain'),
('Back pain'),
('Neck pain'),
('Mobility issue'),
('Seizure'),
('Tremors'),
('Fainting episode'),
('Behavior change'),
('Aggression'),
('Anxiety'),
('Depression signs'),
('Excessive barking or vocalization'),
('Urinary incontinence'),
('Frequent urination'),
('Straining to urinate'),
('Blood in urine'),
('Kidney concern'),
('Reproductive health check'),
('Pregnancy check'),
('Post-delivery check'),
('Infertility concern'),
('Heat cycle concern'),
('Mastitis concern'),
('Vaccination'),
('Booster vaccination'),
('Rabies vaccination'),
('Deworming'),
('Flea and tick treatment'),
('Parasite control'),
('Routine checkup'),
('Annual wellness exam'),
('Senior pet checkup'),
('Puppy or kitten checkup'),
('Pre-surgery evaluation'),
('Post-surgery follow-up'),
('Medication refill'),
('Medication side effects'),
('Chronic disease follow-up'),
('Diabetes follow-up'),
('Thyroid follow-up'),
('Heart condition follow-up'),
('Liver function concern'),
('Pancreatitis concern'),
('Allergy management'),
('Food allergy concern'),
('Poisoning suspicion'),
('Foreign body ingestion'),
('Emergency care'),
('Pain management'),
('Palliative care consultation'),
('Nail overgrowth'),
('Paw injury'),
('Tail injury'),
('Anal gland issue'),
('Travel health certificate'),
('Microchip consultation'),
('Pre-adoption health check'),
('Post-adoption checkup'),
('Grooming-related skin issue'),
('Obesity management'),
('Nutritional counseling');
