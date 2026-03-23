import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <>
      <footer className="w-full bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-gray-300 mt-auto">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center text-2xl text-white">
                  🩺
                </div>
                <h3 className="text-2xl font-bold">
                  <span className="text-blue-300">Smart</span><span className="text-emerald-300">Vet</span>
                </h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Smart Veterinary Clinic Management System - A comprehensive platform connecting pet owners with certified veterinary doctors.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"><span>🏠</span> Home</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"><span>🔐</span> Login</Link></li>
                <li><Link to="/register" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"><span>📝</span> Register</Link></li>
                <li><Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"><span>📊</span> Dashboard</Link></li>
                <li><Link to="/career-portal" className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"><span>💼</span> Career Portal</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Our Services</h4>
              <ul className="space-y-3">
                <li className="text-gray-400 flex items-center gap-2"><span>🩺</span> Expert Veterinarians</li>
                <li className="text-gray-400 flex items-center gap-2"><span>📱</span> Telemedicine Consultations</li>
                <li className="text-gray-400 flex items-center gap-2"><span>🚨</span> Emergency Animal Care</li>
                <li className="text-gray-400 flex items-center gap-2"><span>🐄</span> Livestock Health Management</li>
                <li className="text-gray-400 flex items-center gap-2"><span>💊</span> Medicine & Vaccine Delivery</li>
                <li className="text-gray-400 flex items-center gap-2"><span>📊</span> Health Analytics</li>
              </ul>
            </div>

            {/* Contact & Support */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Contact & Support</h4>
              <ul className="space-y-3">
                <li className="text-gray-400 flex items-center gap-2"><span>⚡</span> 24/7 Emergency Support</li>
                <li className="text-gray-400 flex items-center gap-2"><span>🔒</span> Secure & Private</li>
                <li className="text-gray-400 flex items-center gap-2"><span>🌍</span> Serving All India</li>
              </ul>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="border-t border-gray-700 mt-12 pt-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-400">10K+</div>
                <div className="text-sm text-gray-400">Animals Treated</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-emerald-400">500+</div>
                <div className="text-sm text-gray-400">Certified Vets</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-purple-400">50+</div>
                <div className="text-sm text-gray-400">Cities Covered</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-400">24/7</div>
                <div className="text-sm text-gray-400">Emergency Care</div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Smart Veterinary Clinic Management System. Final Year Project by Kundan Patil.
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
