import nodemailer from 'nodemailer';
import Settings from '@/lib/models/Settings';
import dbConnect from '@/lib/dbConnect';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  try {
    await dbConnect();
    // 1. 从数据库获取最新的 SMTP 配置
    const settings = await Settings.findOne({ key: 'global_settings' });

    if (!settings || !settings.smtpHost || !settings.smtpUser || !settings.smtpPassword) {
      console.warn("⚠️ Email warning: SMTP settings are missing in Admin > Settings.");
      return false;
    }

    // 2. 创建传输器
    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort || 465,
      secure: settings.smtpPort === 465, // 如果端口是 465 则使用 SSL
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPassword,
      },
    });

    // 3. 发送邮件
    await transporter.sendMail({
      from: settings.smtpFrom || `"My Cigs Australia" <${settings.smtpUser}>`, // 优先使用配置的发送名
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent successfully to ${to}`);
    return true;

  } catch (error) {
    console.error("❌ Failed to send email:", error);
    return false;
  }
}