import User from "../models/User.js";
import Connection from "../models/Connection.js";

// @desc    Get all users (for Browse page)
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res) => {
  try {
    const { search, year, department, lookingFor } = req.query;

    let query = { _id: { $ne: req.user._id } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { skills: { $regex: search, $options: "i" } },
        { interests: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
      ];
    }

    if (year) query.year = year;
    if (department) query.department = department;
    if (lookingFor) query.lookingFor = lookingFor;

    const users = await User.find(query).select("-password").limit(50);

    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.collegeId = req.body.collegeId || user.collegeId;
    user.year = req.body.year || user.year;
    user.department = req.body.department || user.department;
    user.location = req.body.location || user.location;
    user.bio = req.body.bio || user.bio;
    user.skills = req.body.skills || user.skills;
    user.interests = req.body.interests || user.interests;
    user.experienceLevel = req.body.experienceLevel || user.experienceLevel;
    user.lookingFor = req.body.lookingFor || user.lookingFor;
    user.github = req.body.github || user.github;
    user.linkedin = req.body.linkedin || user.linkedin;

    if (req.body.profilePic) {
      user.profilePic = req.body.profilePic;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      collegeId: updatedUser.collegeId,
      year: updatedUser.year,
      department: updatedUser.department,
      location: updatedUser.location,
      bio: updatedUser.bio,
      profilePic: updatedUser.profilePic,
      skills: updatedUser.skills,
      interests: updatedUser.interests,
      experienceLevel: updatedUser.experienceLevel,
      lookingFor: updatedUser.lookingFor,
      github: updatedUser.github,
      linkedin: updatedUser.linkedin,
      profileCompletion: updatedUser.profileCompletion,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Upload profile picture
// @route   POST /api/users/upload
// @access  Private
export const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    res.status(200).json({
      message:
        "Image upload endpoint ready. Please use profile picture URL field instead.",
      note: "Direct file upload requires Cloudinary configuration",
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user stats for dashboard
// @route   GET /api/users/stats
// @access  Private
export const getUserStats = async (req, res) => {
  try {
    const connectionsCount = await Connection.countDocuments({
      $or: [
        { from: req.user._id, status: "accepted" },
        { to: req.user._id, status: "accepted" },
      ],
    });

    const pendingRequestsCount = await Connection.countDocuments({
      to: req.user._id,
      status: "pending",
    });

    const sentRequestsCount = await Connection.countDocuments({
      from: req.user._id,
      status: "pending",
    });

    console.log('📊 Dashboard Stats:', {
      user: req.user._id,
      connections: connectionsCount,
      pending: pendingRequestsCount,
      sent: sentRequestsCount
    });

    res.json({
      connections: connectionsCount,
      pendingRequests: pendingRequestsCount,
      sentRequests: sentRequestsCount,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};