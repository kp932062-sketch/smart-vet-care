// Core Team Array
const coreTeam = [
  {
    name: 'Kundan Patil',
    role: 'Developer - Final Year Project',
    avatar: '👨‍💻',
    bio: (
      <>
        <h4 className="text-xl font-bold text-gray-900 mb-2">About This Project</h4>
        <p className="text-gray-700 leading-relaxed mb-2">
          Smart Veterinary Clinic Management System is a comprehensive platform designed to help veterinary clinics manage pet records, appointments, treatments, and clinic operations efficiently.
        </p>
        <p className="text-gray-700 leading-relaxed mb-2">
          This project was developed as a Final Year Project to demonstrate the practical application of modern web technologies in solving real-world healthcare management challenges.
        </p>
        <p className="text-gray-700 leading-relaxed mb-2">
          The system connects pet owners with certified veterinary doctors, enabling seamless appointment booking, online consultations, and digital health record management.
        </p>
      </>
    ),
    links: [],
  },
];

// Features Array
const features = [
  {
    icon: '📅',
    title: 'Easy Appointments',
    desc: 'Book with available doctors in seconds and get reminders for your pets.',
  },
  {
    icon: '💬',
    title: 'Live Chat',
    desc: 'Consult with vets via live chat and share images for diagnosis.',
  },
  {
    icon: '📄',
    title: 'Treatment Records',
    desc: 'Download prescriptions and view your pet\'s medical history anytime.',
  },
  {
    icon: '🔒',
    title: 'Secure Dashboard',
    desc: 'Your data is protected and always accessible from any device.',
  },
];

// Stats Array
const stats = [
  { number: '10,000+', label: 'Animals Treated' },
  { number: '500+', label: 'Certified Vets' },
  { number: '50+', label: 'Cities Covered' },
  { number: '24/7', label: 'Emergency Care' },
];


// Testimonials Array (expanded for carousel)
const testimonials = [
  {
    name: 'Ravi Kumar',
    text: 'This platform helped me save my cattle with instant video consultation. The doctors are very supportive and knowledgeable!',
    avatar: '🐮',
  },
  {
    name: 'Priya Singh',
    text: 'Booking appointments and getting prescriptions is so easy now. My pets are healthier than ever!',
    avatar: '🐐',
  },
  {
    name: 'Amit Patel',
    text: 'I live in a remote area and this platform made it possible to get expert advice for my animals without traveling far.',
    avatar: '🐄',
  },
  {
    name: 'Sunita Devi',
    text: 'The doctors are patient and explain everything clearly. I feel confident about my animals\' health now.',
    avatar: '🐓',
  },
  {
    name: 'Deepak Sharma',
    text: 'Emergency care at midnight! This system truly cares for animals and their owners.',
    avatar: '🐕',
  },
  {
    name: 'Meena Kumari',
    text: 'I was worried about my goat, but the video call and prescription were so easy. Thank you!',
    avatar: '🐐',
  },
  {
    name: 'Ramesh Yadav',
    text: 'Affordable, fast, and trustworthy. A blessing for farmers like me.',
    avatar: '🐃',
  },
  {
    name: 'Pooja Verma',
    text: 'I love how I can access all my pet\'s reports and prescriptions in one place.',
    avatar: '🐈',
  },
  {
    name: 'Suresh Singh',
    text: 'The support team is always available and very helpful. Highly recommend!',
    avatar: '🐎',
  },
  {
    name: 'Anjali Gupta',
    text: 'My pet dog received the best care. The doctors are genuine and caring.',
    avatar: '🐶',
  },
];




import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';


// TestimonialCarousel: pure CSS marquee effect
const TestimonialCarousel = ({ testimonials }) => {
  // Duplicate testimonials for seamless loop
  const items = [...testimonials, ...testimonials];
  return (
    <div className="relative w-full max-w-5xl overflow-x-hidden">
      <div className="flex gap-8 py-4 px-4 animate-testimonial-scroll" style={{ width: 'max-content', minWidth: '100%' }}>
        {items.map((t, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow p-8 flex flex-col items-center text-center min-w-[280px] md:min-w-[320px] max-w-xs hover:shadow-lg transition-shadow mx-2 border border-blue-100"
            style={{ flex: '0 0 80vw', maxWidth: 340, minWidth: 280 }}
          >
            <div className="text-4xl mb-4">{t.avatar}</div>
            <p className="text-gray-700 mb-4 break-words whitespace-normal">{t.text}</p>
            <div className="text-gray-900 font-bold">{t.name}</div>
          </div>
        ))}
      </div>
      <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-blue-50 to-transparent pointer-events-none" />
      <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-blue-50 to-transparent pointer-events-none" />
    </div>
  );
};



// TestimonialCarousel: slow, infinite horizontal motion
const Landing = () => {
  const navigate = useNavigate();
  const [selectedMember, setSelectedMember] = useState(null);
  const [openModal, setOpenModal] = useState(null); // 'privacy' | 'terms' | 'cookies' | 'help' | null
  return (
    <div className="min-h-screen w-full bg-white">
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 px-2 sm:px-4 md:px-8 pt-16 pb-10 sm:pt-20 sm:pb-16">
        <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          <div className="flex-1 flex flex-col items-start justify-center">
            <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              🩺 Professional Veterinary Care Platform
            </div>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 sm:mb-6 text-gray-900 leading-tight text-center sm:text-left">
              <span className="text-blue-600">Smart</span><span className="text-emerald-600">Vet</span> - Where <span className="text-green-600">Animals</span> Get the Best Care
            </h1>
            <p className="mb-6 sm:mb-8 text-base xs:text-lg sm:text-xl text-gray-600 max-w-xl leading-relaxed text-center sm:text-left">
              Smart Veterinary Clinic Management System is designed to help veterinary clinics manage pet records, appointments, treatments, and clinic operations efficiently through a centralized digital platform.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-8 justify-center sm:justify-start">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all text-lg" onClick={() => navigate('/register')}>Get Started Free</button>
              <button className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-blue-50 transition-all text-lg" onClick={() => navigate('/login')}>Login</button>
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm" onClick={() => navigate('/admin-login')}>👑 Admin</button>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600 justify-center sm:justify-start">
              <div className="flex items-center gap-2"><span className="text-green-600">🩺</span> Certified Vets Only</div>
              <div className="flex items-center gap-2"><span className="text-green-600">⚡</span> Instant Consultation</div>
              <div className="flex items-center gap-2"><span className="text-green-600">🏆</span> Trusted by 10K+ Users</div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center mt-8 sm:mt-0 w-full">
            <div className="relative w-full max-w-[320px] xs:max-w-[360px] sm:max-w-md md:max-w-lg lg:max-w-xl">
              <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-3xl opacity-20 blur-2xl"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl w-full h-[360px] xs:h-[380px] sm:h-[400px] border-4 border-white overflow-hidden">
                <div className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-br from-green-100 to-green-200 flex flex-col items-center justify-center p-3 xs:p-4 sm:p-6">
                  <h3 className="text-lg font-bold text-green-800 mb-4 text-center">Animals We Care For</h3>
                  <div className="grid grid-cols-2 gap-2 xs:gap-3">
                    <div className="bg-white rounded-xl p-2 xs:p-3 text-center shadow-sm"><div className="text-2xl xs:text-3xl mb-1">🐄</div><div className="text-xs font-semibold text-gray-700 truncate">Cattle</div></div>
                    <div className="bg-white rounded-xl p-2 xs:p-3 text-center shadow-sm"><div className="text-2xl xs:text-3xl mb-1">🐐</div><div className="text-xs font-semibold text-gray-700 truncate">Goats</div></div>
                    <div className="bg-white rounded-xl p-2 xs:p-3 text-center shadow-sm"><div className="text-2xl xs:text-3xl mb-1">🐕</div><div className="text-xs font-semibold text-gray-700 truncate">Dogs</div></div>
                    <div className="bg-white rounded-xl p-2 xs:p-3 text-center shadow-sm"><div className="text-2xl xs:text-3xl mb-1">🐈</div><div className="text-xs font-semibold text-gray-700 truncate">Cats</div></div>
                    <div className="bg-white rounded-xl p-2 xs:p-3 text-center shadow-sm"><div className="text-2xl xs:text-3xl mb-1">🐎</div><div className="text-xs font-semibold text-gray-700 truncate">Horses</div></div>
                    <div className="bg-white rounded-xl p-2 xs:p-3 text-center shadow-sm"><div className="text-2xl xs:text-3xl mb-1">🐷</div><div className="text-xs font-semibold text-gray-700 truncate">Pigs</div></div>
                  </div>
                </div>
                <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-br from-blue-100 to-blue-200 flex flex-col items-center justify-center p-6">
                  <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold mb-4 text-blue-800 text-center max-w-[120px] xs:max-w-[160px] sm:max-w-none truncate">Expert Veterinarians</h3>
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl mb-4 shadow-lg">👨‍⚕️</div>
                  <div className="text-center">
                    <div className="bg-white rounded-xl p-3 shadow-sm mb-3"><div className="text-sm font-bold text-gray-800">Certified Vets</div><div className="text-xs text-gray-600">500+ Doctors</div></div>
                    <div className="bg-white rounded-xl p-3 shadow-sm mb-3"><div className="text-sm font-bold text-gray-800">24/7 Available</div><div className="text-xs text-gray-600">Emergency Care</div></div>
                    <div className="bg-white rounded-xl p-3 shadow-sm"><div className="text-sm font-bold text-gray-800">Live Chat</div><div className="text-xs text-gray-600">Instant Consultation</div></div>
                  </div>
                </div>
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full border-4 border-gray-200 flex items-center justify-center shadow-lg z-10"><div className="text-2xl">🩺</div></div>
              </div>
            </div>
          </div>
        </div>
  <div className="w-full max-w-7xl mx-auto grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-10 sm:mt-16">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow border border-white/20">
              <div className="text-4xl font-extrabold text-blue-600 mb-2">{stat.number}</div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section - Dynamic Horizontal Motion Carousel */}
  <section className="w-full bg-gradient-to-br from-blue-50 to-emerald-50 py-10 sm:py-16 px-2 sm:px-4 md:px-0 flex flex-col items-center">
  <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-10 text-gray-900">What Our Users Say</h2>
        <div className="w-full flex justify-center">
          <TestimonialCarousel testimonials={testimonials} />
        </div>
        <div className="text-gray-500 text-sm mt-4">Feedback is updated live from real users across India. <span className="animate-pulse">✨</span></div>
      </section>

      {/* Features Section */}
  <section className="w-full bg-white py-10 sm:py-16 px-2 sm:px-4 md:px-0 flex flex-col items-center">
  <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-10 text-gray-900">Platform Features</h2>
  <div className="max-w-5xl w-full grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {features.map((feature, i) => (
            <div key={i} className="bg-blue-50 rounded-2xl shadow p-8 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-blue-700">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
  <section className="w-full bg-gradient-to-br from-emerald-50 to-blue-50 py-10 sm:py-16 px-2 sm:px-4 md:px-0 flex flex-col items-center">
  <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-10 text-gray-900">How It Works</h2>
  <div className="max-w-5xl w-full grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
          <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center text-center">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-lg font-bold mb-2 text-emerald-700">1. Register & Book</h3>
            <p className="text-gray-600">Sign up, add your pets, and book appointments with certified vets in seconds.</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center text-center">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-bold mb-2 text-emerald-700">2. Chat with Doctors</h3>
            <p className="text-gray-600">Chat with doctors via live messaging, share photos, and get real-time advice and prescriptions.</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center text-center">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-lg font-bold mb-2 text-emerald-700">3. Download Reports</h3>
            <p className="text-gray-600">Access all your pet's medical records, prescriptions, and reports anytime.</p>
          </div>
        </div>
      </section>

      {/* Core Team Section */}
  <section className="w-full bg-white py-10 sm:py-16 px-2 sm:px-4 md:px-0 flex flex-col items-center">
  <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-10 text-gray-900">About The Developer</h2>
  <div className="max-w-5xl w-full flex justify-center">
          {coreTeam.map((member, i) => (
            <div key={i} className="bg-emerald-50 rounded-2xl shadow p-8 flex flex-col items-center text-center hover:shadow-lg transition-shadow cursor-pointer max-w-md" onClick={() => setSelectedMember(member)}>
              <div className="text-5xl mb-4">{member.avatar}</div>
              <h3 className="text-xl font-bold mb-1 text-emerald-700">{member.name}</h3>
              <div className="text-gray-600 mb-2">{member.role}</div>
              <button className="text-blue-600 underline text-xs mt-2">Read More</button>
            </div>
          ))}
        </div>
        {/* Modal for Team Member Bio */}
        {selectedMember && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative animate-fadeIn">
              <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 text-2xl font-bold" onClick={() => setSelectedMember(null)}>&times;</button>
              <div className="text-5xl mb-4 text-center">{selectedMember.avatar}</div>
              <h3 className="text-2xl font-bold mb-2 text-emerald-700 text-center">{selectedMember.name}</h3>
              <div className="text-gray-600 mb-4 text-center">{selectedMember.role}</div>
              <div className="prose max-w-none mb-4">{selectedMember.bio}</div>
            </div>
          </div>
        )}
        {/* Extended Note */}
        <div className="w-full flex justify-center mt-8 sm:mt-12 px-2">
          <div className="max-w-3xl w-full bg-blue-50 border-l-4 border-blue-400 rounded-2xl shadow p-4 sm:p-8 flex flex-col items-center text-center">
            <div className="text-3xl mb-2">🩺👩‍⚕️👨‍⚕️</div>
            <h3 className="text-2xl font-bold text-blue-700 mb-2">50+ Veterinary Doctors & Growing</h3>
            <p className="text-gray-700 mb-2">This platform is proud to connect with a network of 50+ certified veterinary doctors from top institutions, serving animals and their owners with dedication and compassion.</p>
            <p className="text-gray-700 mb-2">We are always open to passionate veterinary professionals who want to join and make a difference in animal healthcare. <Link to="/career-portal" className="text-blue-600 underline font-semibold">Apply to join</Link> and be part of a trusted, growing community.</p>
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full font-semibold text-sm">Certified & Verified</span>
              <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold text-sm">Pan-India Presence</span>
              <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-semibold text-sm">Open for Collaboration</span>
            </div>
          </div>
        </div>
      </section>
    {/* Call to Action Section */}
    <section className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 py-10 sm:py-16 flex flex-col items-center justify-center">
      <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6 text-center">Ready to Experience Modern Veterinary Care?</h2>
      <div className="flex flex-wrap gap-3 sm:gap-4 mb-3 sm:mb-4 justify-center">
        <button className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold shadow-lg hover:bg-blue-50 transition-all text-base sm:text-lg" onClick={() => navigate('/register')}>Get Started Free</button>
        <button className="bg-white text-emerald-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold shadow-lg hover:bg-emerald-50 transition-all text-base sm:text-lg" onClick={() => navigate('/login')}>Login</button>
      </div>
      <div className="text-white text-base sm:text-lg">Join 10,000+ pet owners using SmartVet</div>
    </section>

    {/* Footer Section */}
    <footer className="w-full bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-gray-300 mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center text-2xl text-white">🩺</div>
              <h3 className="text-2xl font-bold"><span className="text-blue-300">Smart</span><span className="text-emerald-300">Vet</span></h3>
            </div>
            <p className="text-gray-400 leading-relaxed">Smart Veterinary Clinic Management System - A comprehensive platform connecting pet owners with certified veterinary doctors.</p>
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
          <div className="text-sm text-gray-400 mb-4 md:mb-0">&copy; {new Date().getFullYear()} Smart Veterinary Clinic Management System. Final Year Project by Kundan Patil.</div>
          <div className="flex flex-wrap gap-6 text-sm">
            <button onClick={() => setOpenModal('privacy')} className="text-gray-400 hover:text-white transition-colors">Privacy Policy</button>
            <button onClick={() => setOpenModal('terms')} className="text-gray-400 hover:text-white transition-colors">Terms of Service</button>
            <button onClick={() => setOpenModal('cookies')} className="text-gray-400 hover:text-white transition-colors">Cookie Policy</button>
            <button onClick={() => setOpenModal('help')} className="text-gray-400 hover:text-white transition-colors">Help Center</button>
          </div>
        </div>
      </div>
    </footer>
      {/* Policy/Help Modals */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 p-8 relative overflow-y-auto max-h-[90vh]">
            <button className="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors text-2xl" onClick={() => setOpenModal(null)}>✕</button>
            {openModal === 'privacy' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-blue-700">Privacy Policy</h2>
                <p className="text-gray-700 mb-2">We value your privacy. This platform collects only the information necessary to provide our services and never shares your data with third parties without your consent. All data is encrypted and stored securely.</p>
                <ul className="list-disc pl-6 text-gray-600 mb-2">
                  <li>Personal data is used only for account management and service delivery.</li>
                  <li>We do not sell or rent your information.</li>
                  <li>Cookies are used only to enhance your experience.</li>
                </ul>
                <p className="text-gray-500 text-sm">Last updated: March 2026</p>
              </div>
            )}
            {openModal === 'terms' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-blue-700">Terms of Service</h2>
                <p className="text-gray-700 mb-2">By using this platform, you agree to our terms of service. Our platform is intended for genuine animal healthcare needs. Misuse, fraudulent activity, or abuse of our services will result in account suspension.</p>
                <ul className="list-disc pl-6 text-gray-600 mb-2">
                  <li>All consultations are provided by certified veterinary professionals.</li>
                  <li>Emergency care is subject to doctor availability.</li>
                  <li>Payments are non-refundable once a consultation is completed.</li>
                </ul>
                <p className="text-gray-500 text-sm">Last updated: March 2026</p>
              </div>
            )}
            {openModal === 'cookies' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-blue-700">Cookie Policy</h2>
                <p className="text-gray-700 mb-2">This platform uses cookies to improve your experience, remember your preferences, and keep you logged in. We do not use cookies for advertising or third-party tracking.</p>
                <ul className="list-disc pl-6 text-gray-600 mb-2">
                  <li>Session cookies are deleted when you log out or close your browser.</li>
                  <li>You can disable cookies in your browser settings, but some features may not work.</li>
                </ul>
                <p className="text-gray-500 text-sm">Last updated: March 2026</p>
              </div>
            )}
            {openModal === 'help' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-blue-700">Help Center</h2>
                <p className="text-gray-700 mb-2">Need assistance? Our support team is available 24/7 to help you with any issues, from booking appointments to technical troubleshooting.</p>
                <ul className="list-disc pl-6 text-gray-600 mb-2">
                  <li>Contact support through the dashboard</li>
                  <li>Check our FAQ for common questions.</li>
                </ul>
                <p className="text-gray-500 text-sm">We are here to help you and your animals, always.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Landing;
