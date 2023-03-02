import transporter from '../config/transport.config.js'
import config from '../config/index.js'

const mailHelper = async (options) => {
    let message = {
        from: config.SMTP_MAIL_SENDER,
        to: options.email, 
        subject: options.subject, 
        text: options.text,
    }
    await transporter.sendMail(message)
}
export default mailHelper