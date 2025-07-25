import nodemailer from "nodemailer";

export const sendEmail = (options) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    let mailOptions = {
      to: options.email,
      from: process.env.GMAIL_USER,
      subject: options.subject,
      text: options.message,
    };

    transporter.sendMail(mailOptions, (err, res) => {
      if (err) console.error("Error occured ", err);
    });
  } catch (error) {
    console.error("Error while sending email ", error);
  }
};
