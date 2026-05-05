const mongoose = require('mongoose');
const Project = require('./models/Project');
const Website = require('./models/Website');
const Achievement = require('./models/Achievement');
const AboutExtra = require('./models/AboutExtra');

async function seedDatabase() {
  try {
    // Check if data already exists
    const projectCount = await Project.countDocuments();
    if (projectCount > 0) {
      console.log('⏭️  Database already has data — skipping seed.');
      return;
    }

    console.log('🌱 Seeding default data into MongoDB...');

    await Project.insertMany([
      {
        title: 'AU Mate',
        desc: 'A campus social networking app built with React, featuring glassmorphism UI and multi-step onboarding.',
        tags: 'React,Node.js,CSS',
        github: 'https://github.com/naveenkarthick/au-mate',
        live: ''
      },
      {
        title: 'Doctor Appointment System',
        desc: 'Full-stack cloud-based appointment system with role-based modules for patients, doctors, and admins.',
        tags: 'Node.js,MySQL,Express,HTML',
        github: 'https://github.com/naveenkarthick/doctor-app',
        live: ''
      },
      {
        title: 'Portfolio Website',
        desc: 'This very portfolio – dynamic, animated, and fully responsive personal showcase.',
        tags: 'HTML,CSS,JavaScript',
        github: '',
        live: '#'
      }
    ]);

    await Website.insertMany([
      {
        title: 'Personal Blog',
        desc: 'A clean blog platform sharing tech articles and tutorials.',
        url: 'https://blog.example.com',
        icon: '📝'
      },
      {
        title: 'Dev Tools Hub',
        desc: 'A collection of handy developer utilities and converters.',
        url: 'https://devtools.example.com',
        icon: '🛠️'
      }
    ]);

    await Achievement.insertMany([
      {
        title: 'Started B.E. in CSE',
        desc: 'Joined Jayaraj Annapackiam CSI College of Engineering.',
        date: '2024'
      },
      {
        title: 'Built First Full-Stack App',
        desc: 'Completed the Doctor Appointment System project with cloud deployment.',
        date: '2025'
      },
      {
        title: 'Campus Social App – AU Mate',
        desc: 'Designed and developed a social networking app for university students.',
        date: '2026'
      }
    ]);

    console.log('✅ Seed data inserted successfully!');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  }
}

module.exports = seedDatabase;
