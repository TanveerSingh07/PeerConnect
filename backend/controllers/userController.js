import User from "../models/User.js";
import Connection from "../models/Connection.js";
import Post from "../models/Post.js";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import Notification from "../models/Notification.js";

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
      message: "Image upload endpoint ready. Please use profile picture URL field instead.",
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

// @desc    Get skill-based recommendations with multiple factors
// @route   GET /api/users/recommendations
// @access  Private
export const getRecommendations = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);

    // Get user's connections
    const connections = await Connection.find({
      $or: [
        { from: req.user._id, status: "accepted" },
        { to: req.user._id, status: "accepted" },
      ],
    });

    const connectedUserIds = connections.map((conn) =>
      conn.from.toString() === req.user._id.toString() ? conn.to : conn.from,
    );

    // Get pending connection requests
    const pendingConnections = await Connection.find({
      $or: [
        { from: req.user._id, status: "pending" },
        { to: req.user._id, status: "pending" },
      ],
    });

    const pendingUserIds = pendingConnections.map((conn) =>
      conn.from.toString() === req.user._id.toString() ? conn.to : conn.from,
    );

    // Exclude: self, connected users, and pending requests
    const excludeIds = [req.user._id, ...connectedUserIds, ...pendingUserIds];

    // Find all potential users
    const allUsers = await User.find({
      _id: { $nin: excludeIds },
    })
      .select("-password")
      .limit(50);

    // ✅ ENHANCED: Calculate weighted score for each user
    const recommendations = await Promise.all(
      allUsers.map(async (user) => {
        let score = 0;
        let reasons = [];

        // 1️⃣ SKILL MATCH (40 points max)
        if (currentUser.skills && user.skills) {
          const userSkills = currentUser.skills
            .split(",")
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);

          const otherSkills = user.skills
            .split(",")
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);

          const matchingSkills = userSkills.filter((userSkill) =>
            otherSkills.some(
              (otherSkill) =>
                otherSkill.includes(userSkill) || userSkill.includes(otherSkill),
            ),
          );

          if (matchingSkills.length > 0) {
            const skillScore = Math.round(
              (matchingSkills.length / Math.max(userSkills.length, otherSkills.length)) * 40
            );
            score += skillScore;
            reasons.push(`${matchingSkills.length} matching skills`);
          }
        }

        // 2️⃣ SAME DEPARTMENT (25 points)
        if (currentUser.department && user.department && 
            currentUser.department.toLowerCase() === user.department.toLowerCase()) {
          score += 25;
          reasons.push("Same department");
        }

        // 3️⃣ SAME YEAR (15 points)
        if (currentUser.year && user.year && currentUser.year === user.year) {
          score += 15;
          reasons.push("Same year");
        }

        // 4️⃣ ACTIVITY SCORE (20 points max)
        const userPostCount = await Post.countDocuments({ author: user._id });
        const userConnectionCount = await Connection.countDocuments({
          $or: [
            { from: user._id, status: "accepted" },
            { to: user._id, status: "accepted" },
          ],
        });

        const activityScore = Math.min(
          Math.round((userPostCount * 2) + (userConnectionCount * 0.5)),
          20
        );
        score += activityScore;

        if (activityScore > 10) {
          reasons.push("Active user");
        }

        // 5️⃣ PROFILE COMPLETENESS BONUS (5 points)
        const profileFields = [user.bio, user.skills, user.interests, user.profilePic, user.github, user.linkedin];
        const filledFields = profileFields.filter(field => field && field.toString().trim() !== '').length;
        if (filledFields >= 4) {
          score += 5;
          reasons.push("Complete profile");
        }

        return {
          ...user.toObject(),
          recommendationScore: score,
          recommendationReasons: reasons,
        };
      })
    );

    // Filter out users with score 0 and sort by score
    const sortedRecommendations = recommendations
      .filter((rec) => rec.recommendationScore > 0)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 4);

    res.json(sortedRecommendations);
  } catch (error) {
    console.error("Get recommendations error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete user account permanently
// @route   DELETE /api/users/account
// @access  Private
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete user's posts
    await Post.deleteMany({ author: userId });

    // Delete user's connections (both directions)
    await Connection.deleteMany({
      $or: [{ from: userId }, { to: userId }]
    });

    // Delete user's messages
    await Message.deleteMany({ sender: userId });

    // Delete conversations where user is participant
    const conversations = await Conversation.find({ participants: userId });
    for (const conv of conversations) {
      // If conversation has only this user, delete it
      if (conv.participants.length === 1) {
        await Conversation.findByIdAndDelete(conv._id);
        await Message.deleteMany({ conversation: conv._id });
      } else {
        // Remove user from participants
        await Conversation.findByIdAndUpdate(conv._id, {
          $pull: { participants: userId }
        });
      }
    }

    // Delete user's notifications (both sent and received)
    await Notification.deleteMany({
      $or: [{ user: userId }, { from: userId }]
    });

    // Finally, delete the user account
    await User.findByIdAndDelete(userId);

    res.json({ 
      message: 'Account deleted successfully. All your data has been removed.' 
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ message: "Failed to delete account" });
  }
};