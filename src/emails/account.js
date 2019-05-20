const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'alexejsaveliev@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get alone with the app.`
    })
}

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'alexejsaveliev@gmail.com',
        subject: 'Sorry',
        text: `Hi, ${name}. We are sorry for that. Please explain your cancellation.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}