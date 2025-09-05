const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'hotmail', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: `"Splitwise Clone" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
