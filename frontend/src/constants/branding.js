// Branding Constants for Smart Veterinary Clinic Management System
// Use these constants throughout the application for consistent branding

export const BRAND = {
  // Full project name
  name: 'Smart Veterinary Clinic Management System',

  // Short name for UI
  shortName: 'SmartVet',

  // Tagline
  tagline: 'Smart Animal Healthcare Management',

  // Developer information
  developer: 'Kundan Patil',
  projectType: 'Final Year Project',
  year: new Date().getFullYear(),

  // Description
  description: 'Smart Veterinary Clinic Management System is designed to help veterinary clinics manage pet records, appointments, treatments, and clinic operations efficiently through a centralized digital platform.',

  // Contact (placeholder)
  supportEmail: 'support@smartvet.com',

  // Social links (placeholder)
  website: '',
  github: '',
};

export const COLORS = {
  primary: {
    blue: '#2563eb',
    emerald: '#10b981',
  },
  gradient: {
    primary: 'from-blue-600 to-emerald-600',
    admin: 'from-purple-600 to-pink-600',
    doctor: 'from-emerald-600 to-teal-600',
  },
};

export const ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  USER: 'user',
};

export default BRAND;
