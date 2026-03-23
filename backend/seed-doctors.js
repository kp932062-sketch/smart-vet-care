/**
 * seed-doctors.js
 * Seeds sample approved doctors into the database.
 * Safe to run multiple times — uses INSERT IGNORE to avoid duplicates.
 * 
 * Usage: node seed-doctors.js
 */

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env'), quiet: true });

const crypto = require('crypto');
const { initializeDatabaseWithRetry, query, closePool } = require('./config/database');

const SAMPLE_DOCTORS = [
  {
    name: 'Dr. Priya Sharma',
    email: 'dr.priya.sharma@vetcare.com',
    phone: '+91-9876543201',
    specialization: 'Small Animal Medicine',
    experience: 8,
    qualifications: 'BVSc, MVSc (Small Animal Medicine)',
    consultation_fee: 500,
    license_number: 'VET-MH-001-2018',
    bio: 'Specializes in dogs, cats, and small pets. Expert in preventive medicine and chronic disease management.',
    languages: JSON.stringify(['English', 'Hindi', 'Marathi']),
    working_hours: JSON.stringify({ mon: '09:00-18:00', tue: '09:00-18:00', wed: '09:00-18:00', thu: '09:00-18:00', fri: '09:00-18:00' }),
    is_available: 1
  },
  {
    name: 'Dr. Rajesh Kumar',
    email: 'dr.rajesh.kumar@vetcare.com',
    phone: '+91-9876543202',
    specialization: 'Large Animal & Livestock',
    experience: 12,
    qualifications: 'BVSc, MVSc (Animal Reproduction), PhD',
    consultation_fee: 600,
    license_number: 'VET-UP-002-2014',
    bio: 'Expert in cattle, horses, and large livestock. Specializes in reproduction, surgery, and emergency care.',
    languages: JSON.stringify(['English', 'Hindi']),
    working_hours: JSON.stringify({ mon: '08:00-17:00', tue: '08:00-17:00', wed: '08:00-17:00', thu: '08:00-17:00', sat: '09:00-14:00' }),
    is_available: 1
  },
  {
    name: 'Dr. Ananya Patel',
    email: 'dr.ananya.patel@vetcare.com',
    phone: '+91-9876543203',
    specialization: 'Exotic & Wildlife Animals',
    experience: 6,
    qualifications: 'BVSc (Gold Medalist), MVSc (Wildlife Medicine)',
    consultation_fee: 700,
    license_number: 'VET-GJ-003-2020',
    bio: 'Treats exotic pets including birds, reptiles, rabbits, and guinea pigs. Certified wildlife rehabilitator.',
    languages: JSON.stringify(['English', 'Hindi', 'Gujarati']),
    working_hours: JSON.stringify({ mon: '10:00-19:00', tue: '10:00-19:00', thu: '10:00-19:00', fri: '10:00-19:00', sat: '10:00-16:00' }),
    is_available: 1
  },
  {
    name: 'Dr. Suresh Menon',
    email: 'dr.suresh.menon@vetcare.com',
    phone: '+91-9876543204',
    specialization: 'Veterinary Surgery & Orthopaedics',
    experience: 15,
    qualifications: 'BVSc, MVSc (Surgery), FIVS',
    consultation_fee: 800,
    license_number: 'VET-KL-004-2011',
    bio: 'Senior veterinary surgeon with 15+ years experience in soft tissue and orthopaedic surgery.',
    languages: JSON.stringify(['English', 'Hindi', 'Malayalam']),
    working_hours: JSON.stringify({ mon: '09:00-17:00', wed: '09:00-17:00', fri: '09:00-17:00' }),
    is_available: 1
  },
  {
    name: 'Dr. Meera Nair',
    email: 'dr.meera.nair@vetcare.com',
    phone: '+91-9876543205',
    specialization: 'Veterinary Dermatology & Nutrition',
    experience: 5,
    qualifications: 'BVSc, MVSc (Dermatology & Nutrition)',
    consultation_fee: 450,
    license_number: 'VET-KL-005-2021',
    bio: 'Specialist in pet skin conditions, allergies, and nutritional counseling for all species.',
    languages: JSON.stringify(['English', 'Hindi', 'Malayalam', 'Tamil']),
    working_hours: JSON.stringify({ tue: '09:00-18:00', wed: '09:00-18:00', thu: '09:00-18:00', sat: '09:00-15:00' }),
    is_available: 1
  },
  {
    name: 'Dr. Vikram Singh',
    email: 'dr.vikram.singh@vetcare.com',
    phone: '+91-9876543206',
    specialization: 'Equine Medicine',
    experience: 18,
    qualifications: 'BVSc, MVSc (Equine Practice)',
    consultation_fee: 1000,
    license_number: 'VET-RJ-006-2008',
    bio: 'Renowned equine specialist. Extensive experience with racehorses and farm horses.',
    languages: JSON.stringify(['English', 'Hindi', 'Punjabi']),
    working_hours: JSON.stringify({ mon: '07:00-15:00', tue: '07:00-15:00', wed: '07:00-15:00', thu: '07:00-15:00', fri: '07:00-15:00' }),
    is_available: 1
  },
  {
    name: 'Dr. Fatima Khan',
    email: 'dr.fatima.khan@vetcare.com',
    phone: '+91-9876543207',
    specialization: 'Feline Specialist',
    experience: 7,
    qualifications: 'BVSc, ISFM Cert',
    consultation_fee: 550,
    license_number: 'VET-TS-007-2019',
    bio: 'Passionate cat expert. Focuses heavily on feline behavior, stress-free handling, and geriatric care.',
    languages: JSON.stringify(['English', 'Hindi', 'Urdu', 'Telugu']),
    working_hours: JSON.stringify({ mon: '11:00-20:00', wed: '11:00-20:00', thu: '11:00-20:00', fri: '11:00-20:00', sun: '10:00-14:00' }),
    is_available: 1
  },
  {
    name: 'Dr. Rohan Desai',
    email: 'dr.rohan.desai@vetcare.com',
    phone: '+91-9876543208',
    specialization: 'Veterinary Dentistry',
    experience: 10,
    qualifications: 'BVSc, MVSc (Veterinary Dentistry)',
    consultation_fee: 650,
    license_number: 'VET-MH-008-2016',
    bio: 'Expert in animal oral health. Performs cleanings, extractions, and advanced oral surgeries.',
    languages: JSON.stringify(['English', 'Hindi', 'Marathi']),
    working_hours: JSON.stringify({ tue: '10:00-18:00', wed: '10:00-18:00', thu: '10:00-18:00', fri: '10:00-18:00', sat: '10:00-18:00' }),
    is_available: 1
  },
  {
    name: 'Dr. Kavita Reddy',
    email: 'dr.kavita.reddy@vetcare.com',
    phone: '+91-9876543209',
    specialization: 'Poultry Medicine',
    experience: 14,
    qualifications: 'BVSc, PhD (Avian Medicine)',
    consultation_fee: 500,
    license_number: 'VET-AP-009-2012',
    bio: 'Extensive background in commercial poultry farming diseases and backyard flock health.',
    languages: JSON.stringify(['English', 'Hindi', 'Telugu']),
    working_hours: JSON.stringify({ mon: '08:00-16:00', tue: '08:00-16:00', wed: '08:00-16:00', thu: '08:00-16:00' }),
    is_available: 1
  },
  {
    name: 'Dr. Amit Chatterjee',
    email: 'dr.amit.chatterjee@vetcare.com',
    phone: '+91-9876543210',
    specialization: 'Emergency and Critical Care',
    experience: 9,
    qualifications: 'BVSc, DACVECC',
    consultation_fee: 900,
    license_number: 'VET-WB-010-2017',
    bio: 'Dedicated to rapid response and stabilization of critically ill or traumatized animals.',
    languages: JSON.stringify(['English', 'Hindi', 'Bengali']),
    working_hours: JSON.stringify({ wed: '20:00-06:00', thu: '20:00-06:00', fri: '20:00-06:00', sat: '20:00-06:00' }),
    is_available: 1
  }
];

async function seedDoctors() {
  try {
    await initializeDatabaseWithRetry({ maxAttempts: 5, delayMs: 1500 });
    console.log('Database initialized. Seeding doctors...');

    let seeded = 0;
    let skipped = 0;

    for (const doctor of SAMPLE_DOCTORS) {
      // Check if doctor already exists
      const existing = await query('SELECT id FROM doctors WHERE email = ? LIMIT 1', [doctor.email]);

      if (existing.length > 0) {
        console.log(`  [SKIP]  ${doctor.name} already exists`);
        skipped++;
        continue;
      }

      const accessLink = crypto.randomBytes(24).toString('hex');

      await query(
        `INSERT INTO doctors (
          name, email, phone, specialization, experience, qualifications, consultation_fee,
          license_number, bio, languages, working_hours, is_available, approved, status,
          unique_access_link, profile_completeness, submitted_at, approved_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'active', ?, 90, NOW(), NOW())`,
        [
          doctor.name,
          doctor.email.toLowerCase(),
          doctor.phone,
          doctor.specialization,
          doctor.experience,
          doctor.qualifications,
          doctor.consultation_fee,
          doctor.license_number,
          doctor.bio,
          doctor.languages,
          doctor.working_hours,
          doctor.is_available,
          accessLink
        ]
      );

      console.log(`  [OK]    ${doctor.name} (${doctor.specialization}) seeded`);
      seeded++;
    }

    console.log(`\nDone! ${seeded} doctors seeded, ${skipped} already existed.`);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  } finally {
    await closePool();
  }
}

seedDoctors();
