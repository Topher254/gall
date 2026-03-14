const Response = require('../models/Response');
const sendEmail = require('../utils/emailService');

// @desc    Handle initial response (yes/convince)
// @route   POST /api/response
exports.handleResponse = async (req, res) => {
  try {
    const { choice } = req.body; // 'yes' or 'convince'
    if (!choice || !['yes', 'convince'].includes(choice)) {
      return res.status(400).json({ error: 'Valid choice is required' });
    }

    const labels = {
      yes: 'YES — She said yes! 🎉',
      convince: 'CONVINCE ME — She wants you to try harder 😏'
    };
    const responseText = labels[choice];

    // Store in database
    await Response.create({ type: 'response', choice });

    // Send email
    await sendEmail('New Response from Sagina', responseText);

    res.status(200).json({ message: 'Response recorded and email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Handle expectations form submission
// @route   POST /api/expectations
exports.handleExpectations = async (req, res) => {
  try {
    const { expectations, result } = req.body; // result is 'yes' or 'convince'

    if (!expectations) {
      return res.status(400).json({ error: 'Expectations are required' });
    }

    // Store in database
    await Response.create({
      type: 'expectations',
      choice: result || null,
      expectations
    });

    const emailSubject = 'Expectations from Sagina';
    const emailText = `Result context: ${result || 'Not provided'}\n\nHer expectations:\n${expectations}`;

    await sendEmail(emailSubject, emailText);

    res.status(200).json({ message: 'Expectations recorded and email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};