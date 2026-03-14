require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_TO,
  subject: 'Test from backend',
  text: 'If you see this, email works!'
}, (err, info) => {
  if (err) {
    console.error('❌ Error:', err);
  } else {
    console.log('✅ Success:', info.response);
  }
});