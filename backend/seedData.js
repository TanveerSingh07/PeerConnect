import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Post from './models/Post.js';
import Connection from './models/Connection.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Connection.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create sample users
    const users = await User.create([
      {
        name: 'Alice Johnson',
        email: 'alice@college.edu',
        password: 'password123',
        collegeId: 'COL001',
        year: '3rd',
        department: 'Computer Science',
        location: 'New York, USA',
        bio: 'Passionate about web development and AI. Looking for project partners!',
        skills: 'React, Node.js, Python, Machine Learning',
        interests: 'Web Dev, AI, Hackathons',
        experienceLevel: 'Intermediate',
        lookingFor: 'Projects',
        github: 'https://github.com/alicejohnson',
        linkedin: 'https://linkedin.com/in/alicejohnson',
        profilePic: 'https://i.pravatar.cc/150?img=1'
      },
      {
        name: 'Bob Smith',
        email: 'bob@college.edu',
        password: 'password123',
        collegeId: 'COL002',
        year: '2nd',
        department: 'Electronics',
        location: 'California, USA',
        bio: 'Hardware enthusiast and IoT developer. Love building robots!',
        skills: 'Arduino, C++, IoT, Robotics',
        interests: 'Robotics, IoT, Hardware',
        experienceLevel: 'Beginner',
        lookingFor: 'Learning',
        github: 'https://github.com/bobsmith',
        profilePic: 'https://i.pravatar.cc/150?img=2'
      },
      {
        name: 'Carol Williams',
        email: 'carol@college.edu',
        password: 'password123',
        collegeId: 'COL003',
        year: '4th',
        department: 'Computer Science',
        location: 'Texas, USA',
        bio: 'Full-stack developer | Open source contributor | Hackathon winner',
        skills: 'React, Node.js, MongoDB, Docker, AWS',
        interests: 'Web Dev, DevOps, Open Source',
        experienceLevel: 'Advanced',
        lookingFor: 'Mentorship',
        github: 'https://github.com/carolwilliams',
        linkedin: 'https://linkedin.com/in/carolwilliams',
        profilePic: 'https://i.pravatar.cc/150?img=3'
      },
      {
        name: 'David Brown',
        email: 'david@college.edu',
        password: 'password123',
        collegeId: 'COL004',
        year: '1st',
        department: 'Mechanical',
        location: 'Florida, USA',
        bio: 'First year student interested in CAD and 3D printing',
        skills: 'SolidWorks, AutoCAD',
        interests: 'CAD, 3D Printing, Design',
        experienceLevel: 'Beginner',
        lookingFor: 'Learning',
        profilePic: 'https://i.pravatar.cc/150?img=4'
      },
      {
        name: 'Emma Davis',
        email: 'emma@college.edu',
        password: 'password123',
        collegeId: 'COL005',
        year: '3rd',
        department: 'IT',
        location: 'Washington, USA',
        bio: 'UI/UX designer passionate about creating beautiful interfaces',
        skills: 'Figma, Adobe XD, React, Tailwind CSS',
        interests: 'UI/UX, Design, Frontend',
        experienceLevel: 'Intermediate',
        lookingFor: 'Projects',
        github: 'https://github.com/emmadavis',
        linkedin: 'https://linkedin.com/in/emmadavis',
        profilePic: 'https://i.pravatar.cc/150?img=5'
      }
    ]);

    console.log('✅ Created 5 sample users');

    // Create sample posts
    await Post.create([
      {
        author: users[0]._id,
        content: 'Looking for 2 frontend developers for a MERN stack mini-project. Anyone interested?',
        tags: ['React', 'MERN', 'Collaboration'],
        type: 'post'
      },
      {
        author: users[2]._id,
        content: 'Just published my notes on Machine Learning basics. Check them out!',
        tags: ['AI', 'ML', 'Learning'],
        type: 'post'
      },
      {
        author: users[1]._id,
        content: 'Forming a team for the upcoming hackathon. Need React and Node.js developers!',
        tags: ['Hackathon', 'React', 'Node'],
        type: 'opportunity',
        opportunityDetails: {
          title: 'Hackathon Team Formation',
          requiredSkills: ['React', 'Node.js'],
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      }
    ]);

    console.log('✅ Created 3 sample posts');

    // Create sample connections - FIXED VERSION
    // Using 'from' and 'to' instead of 'requester' and 'recipient'
    await Connection.create([
      {
        from: users[0]._id,
        to: users[1]._id,
        status: 'accepted'
      },
      {
        from: users[0]._id,
        to: users[2]._id,
        status: 'accepted'
      },
      {
        from: users[3]._id,
        to: users[0]._id,
        status: 'pending'
      }
    ]);

    console.log('✅ Created 3 sample connections');
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Sample Credentials:');
    console.log('Email: alice@college.edu | Password: password123');
    console.log('Email: bob@college.edu | Password: password123');
    console.log('Email: carol@college.edu | Password: password123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();