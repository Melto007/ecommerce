import transporter from '../config/transporter.config.js'
import config from '../config/index.js'

const mailHelper = async (options) => {
    const message = {
        from: config.SMTP_SENDER_EMAIL,
        to: options.email,
        subject: options.subject, 
        text: options.subject, 
        // html: "<b>Hello world?</b>"
    }

    await transporter.sendMail(message)
}
export default mailHelper