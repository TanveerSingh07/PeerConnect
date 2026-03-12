import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { email, password, name, collegeId } = req.body;

    // Validation
    if (!email || !password || !name || !collegeId) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { collegeId }] 
    });

    if (userExists) {
      return res.status(400).json({ 
        message: userExists.email === email 
          ? 'Email already registered' 
          : 'College ID already registered'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      collegeId
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        collegeId: user.collegeId,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Return user data and token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      collegeId: user.collegeId,
      year: user.year,
      department: user.department,
      location: user.location,
      bio: user.bio,
      profilePic: user.profilePic,
      skills: user.skills,
      interests: user.interests,
      experienceLevel: user.experienceLevel,
      lookingFor: user.lookingFor,
      github: user.github,
      linkedin: user.linkedin,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};