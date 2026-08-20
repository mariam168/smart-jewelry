import User from "../../auth/models/User.js";

const adminMiddleware = async (req, res, next) => {
  try {
    console.log("REQ.USER FROM PROTECT:", req.user);

    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in authentication token.",
      });
    }

    const user = await User.findById(req.user.userId).populate("role");

    console.log("FOUND USER:", user);

    console.log("USER ROLE:", user?.role);

    console.log("ROLE NAME:", user?.role?.name);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role?.name !== "admin") {
      return res.status(403).json({
        success: false,

        message: "Admin access required.",

        actualRole: user.role?.name || null,
      });
    }

    req.admin = user;

    next();
  } catch (error) {
    console.error("Admin Middleware Error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to verify admin access.",
    });
  }
};

export default adminMiddleware;
