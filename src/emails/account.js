const sgMail = require('@sendgrid/mail');
const sendGridAPIKey = process.env.SG_API_KEY;

sgMail.setApiKey(sendGridAPIKey);


const sendWelcomeMail = (email, name, otp) => {
    sgMail.send({
        to : email,
        from : 'mrvivekkumartak@gmail.com',
        subject : 'Verification',
        text : `Hi ${name}, Your unique OTP is ${otp}, Don't share it with other.`
    });
};
module.exports = {
    sendWelcomeMail
}

