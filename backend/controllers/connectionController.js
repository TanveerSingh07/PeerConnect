import Connection from "../models/Connection.js";
import User from "../models/User.js";
import { createNotification } from "./notificationController.js";

// @desc    Send connection request
// @route   POST /api/connections/send/:recipientId
// @access  Private
export const sendConnectionRequest = async (req, res) => {
  try {
    const { recipientId } = req.params;

    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot connect to yourself" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingConnection = await Connection.findOne({
      $or: [
        { from: req.user._id, to: recipientId },
        { from: recipientId, to: req.user._id },
      ],
    });

    if (existingConnection) {
      return res.status(400).json({
        message: "Connection request already exists",
        status: existingConnection.status,
      });
    }

    const connection = await Connection.create({
      from: req.user._id,
      to: recipientId,
      status: "pending",
    });

    res.status(201).json({
      message: "Connection request sent",
      connection,
    });

    await createNotification(recipientId, "connection_request", req.user._id, {
      message: "sent you a connection request",
      link: "/connections",
    });
  } catch (error) {
    console.error("Send connection error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Accept connection request
// @route   PUT /api/connections/accept/:connectionId
// @access  Private
export const acceptConnectionRequest = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.connectionId);

    if (!connection) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    if (connection.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    connection.status = "accepted";
    await connection.save();

    res.json({
      message: "Connection accepted",
      connection,
    });

    await createNotification(
      connection.from,
      "connection_accepted",
      req.user._id,
      {
        message: "accepted your connection request",
        link: "/connections",
      },
    );
  } catch (error) {
    console.error("Accept connection error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Reject connection request
// @route   PUT /api/connections/reject/:connectionId
// @access  Private
export const rejectConnectionRequest = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.connectionId);

    if (!connection) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    if (connection.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Connection.findByIdAndDelete(req.params.connectionId);

    res.json({
      message: "Connection rejected and removed",
      _id: req.params.connectionId,
    });
  } catch (error) {
    console.error("Reject connection error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Withdraw connection request
// @route   DELETE /api/connections/withdraw/:recipientId
// @access  Private
export const withdrawConnectionRequest = async (req, res) => {
  try {
    const connection = await Connection.findOneAndDelete({
      from: req.user._id,
      to: req.params.recipientId,
      status: "pending",
    });

    if (!connection) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    res.json({ message: "Connection request withdrawn" });
  } catch (error) {
    console.error("Withdraw connection error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get my connections
// @route   GET /api/connections
// @access  Private
export const getMyConnections = async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [
        { from: req.user._id, status: "accepted" },
        { to: req.user._id, status: "accepted" },
      ],
    })
      .populate("from", "-password")
      .populate("to", "-password");

    const connectionList = connections.map((conn) => {
      return conn.from._id.toString() === req.user._id.toString()
        ? conn.to
        : conn.from;
    });

    res.json(connectionList);
  } catch (error) {
    console.error("Get connections error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get pending requests (received)
// @route   GET /api/connections/pending
// @access  Private
export const getPendingRequests = async (req, res) => {
  try {
    const requests = await Connection.find({
      to: req.user._id,
      status: "pending",
    }).populate("from", "-password");

    res.json(requests);
  } catch (error) {
    console.error("Get pending requests error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get sent requests
// @route   GET /api/connections/sent
// @access  Private
export const getSentRequests = async (req, res) => {
  try {
    const requests = await Connection.find({
      from: req.user._id,
      status: "pending",
    }).populate("to", "-password");

    res.json(requests);
  } catch (error) {
    console.error("Get sent requests error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get connection status with a user
// @route   GET /api/connections/status/:userId
// @access  Private
export const getConnectionStatus = async (req, res) => {
  try {
    const connection = await Connection.findOne({
      $or: [
        { from: req.user._id, to: req.params.userId },
        { from: req.params.userId, to: req.user._id },
      ],
    });

    if (!connection) {
      return res.json({ status: "none" });
    }

    const isRequester = connection.from.toString() === req.user._id.toString();

    res.json({
      status: connection.status,
      isRequester,
      connectionId: connection._id,
    });
  } catch (error) {
    console.error("Get connection status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Remove/unfriend a connection
// @route   DELETE /api/connections/remove/:userId
// @access  Private
export const removeConnection = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find and delete the accepted connection
    const connection = await Connection.findOneAndDelete({
      $or: [
        { from: req.user._id, to: userId, status: 'accepted' },
        { from: userId, to: req.user._id, status: 'accepted' }
      ]
    });

    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    res.json({ 
      message: 'Connection removed successfully',
      removedUserId: userId
    });
  } catch (error) {
    console.error('Remove connection error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};