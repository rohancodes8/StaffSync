const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

// Apply for leave (Admin/HR/Manager for now)
const applyLeave = async (req, res) => {
  try {
    const {
      employee,
      leaveType,
      startDate,
      endDate,
      reason,
    } = req.body;

    if (!employee || !leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        message: 'All fields are required',
      });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        message: 'End date cannot be before start date',
      });
    }

    const employeeExists = await Employee.findById(employee);

    if (!employeeExists) {
      return res.status(404).json({
        message: 'Employee not found',
      });
    }

    const leave = await Leave.create({
      employee,
      leaveType,
      startDate,
      endDate,
      reason,
    });

    res.status(201).json({
      message: 'Leave request submitted successfully',
      leave,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all leave requests
const getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('employee', 'firstName lastName employeeId')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve or reject leave
const updateLeaveStatus = async (req, res) => {
  try {
    const { status, reviewRemarks } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        message: 'Status must be Approved or Rejected',
      });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        message: 'Leave request not found',
      });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        message: 'This leave request has already been reviewed',
      });
    }

    leave.status = status;
    leave.reviewRemarks = reviewRemarks || '';
    leave.reviewedBy = req.user._id;

    await leave.save();

    res.json({
      message: `Leave ${status.toLowerCase()} successfully`,
      leave,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyLeave,
  getLeaves,
  updateLeaveStatus,
};