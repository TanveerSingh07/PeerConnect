import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    collegeId: {
      type: String,
      required: [true, "College ID is required"],
      unique: true,
      trim: true,
    },
    year: { type: String, default: "" },
    department: { type: String, default: "" },
    location: { type: String, default: "" },
    bio: { type: String, maxlength: 500, default: "" },
    profilePic: { type: String, default: "" },
    skills: { type: String, default: "" },
    interests: { type: String, default: "" },
    experienceLevel: { type: String, default: "" },   
    lookingFor: { type: String, default: "" },
    github: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);