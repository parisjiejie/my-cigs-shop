import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/lib/models/Order';
import { sendEmail } from '@/lib/email';

// 这个接口将由 Vercel Cron 每天自动调用
// 您也可以手动访问: /api/cron/payment-reminders?test=true 来强制测试
export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // 获取 URL 参数
    const { searchParams } = new URL(request.url);
    const isTestMode = searchParams.get('test') === 'true'; // 是否开启测试模式

    const now = new Date();
    // 1周前的时间 (超过这个时间的订单不再提醒)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    // 24小时前的时间
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    console.log(`[Cron] Starting Payment Reminder Check at ${now.toISOString()}`);
    if (isTestMode) console.log("⚠️ [Cron] Running in TEST MODE (Ignoring 24h wait time)");

    // 构建查询条件
    const query: any = {
      status: 'Pending', // 必须是未支付
      paymentReminderStopped: { $ne: true }, // 没有被停止提醒
      createdAt: { $gte: oneWeekAgo } // 必须是最近一周的订单
    };

    // 如果不是测试模式，必须是下单超过24小时的
    if (!isTestMode) {
        query.createdAt.$lt = twentyFourHoursAgo;
    }

    const orders = await Order.find(query);
    console.log(`[Cron] Found ${orders.length} potential orders for reminder.`);

    let sentCount = 0;
    let skipCount = 0;

    for (const order of orders) {
      // 检查上次发送时间，确保每 24 小时只发一次
      // 如果是测试模式，也忽略上次发送时间限制
      if (!isTestMode && order.lastPaymentReminderDate) {
          const lastReminded = new Date(order.lastPaymentReminderDate);
          if (lastReminded > twentyFourHoursAgo) {
            console.log(`[Cron] Skipping Order #${order.orderNumber}: Already reminded in last 24h.`);
            skipCount++;
            continue;
          }
      }

      if (!order.shippingInfo?.email) {
          console.log(`[Cron] Skipping Order #${order.orderNumber}: No email found.`);
          continue;
      }

      // 构建邮件内容 (Australian English)
      const emailBody = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; line-height: 1.6; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
            <h2 style="color: #d32f2f; margin-top: 0;">Payment Reminder: Order #${order.orderNumber}</h2>
            <p>Dear ${order.shippingInfo.fullName},</p>
            <p>We noticed that your order <strong>#${order.orderNumber}</strong> (placed on ${new Date(order.createdAt).toLocaleDateString('en-AU')}) is still pending payment.</p>
            
            <p style="font-size: 1.1em;"><strong>Total Amount Due: <span style="color: #d32f2f;">$${order.finalTotal.toFixed(2)}</span></strong></p>
            
            <p>To ensure your items are shipped promptly, please complete the bank transfer. If you have already made the payment, please disregard this notice.</p>
            
            <div style="background-color: #fffbeb; border: 1px solid #fcd34d; padding: 15px; border-radius: 6px; color: #92400e; margin: 20px 0;">
                <h3 style="margin-top: 0; font-size: 16px;">🏦 Bank Transfer Details</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    <li style="margin-bottom: 5px;"><strong>Bank:</strong> Commonwealth Bank</li>
                    <li style="margin-bottom: 5px;"><strong>Account Name:</strong> My Cigs Trading PTY LTD</li>
                    <li style="margin-bottom: 5px;"><strong>BSB:</strong> 062-000</li>
                    <li style="margin-bottom: 5px;"><strong>ACC:</strong> 1234 5678</li>
                    <li style="margin-top: 10px; color: #d32f2f; font-weight: bold;">Ref / Description: ${order.orderNumber}</li>
                </ul>
                <p style="margin: 10px 0 0 0; font-size: 13px;">* Please include the Order Number as the reference so we can track your payment.</p>
            </div>
            
            <p style="font-size: 14px; color: #555;">
               Need help? Contact us at <a href="mailto:pap.shop.service@gmail.com" style="color: #2563eb; text-decoration: none;">pap.shop.service@gmail.com</a>
            </p>
            
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">
                Puff And Present Emporium
            </p>
        </div>
      `;

      // 发送邮件
      console.log(`[Cron] Sending email to ${order.shippingInfo.email} for Order #${order.orderNumber}...`);
      const success = await sendEmail({
        to: order.shippingInfo.email,
        subject: `Reminder: Payment pending for Order #${order.orderNumber}`,
        html: emailBody
      });

      if (success) {
        // 更新数据库：记录发送时间
        order.lastPaymentReminderDate = now;
        await order.save();
        sentCount++;
        console.log(`[Cron] ✅ Success.`);
      } else {
        console.error(`[Cron] ❌ Failed to send email.`);
      }
    }

    return NextResponse.json({ 
        success: true, 
        processed: orders.length,
        sent: sentCount, 
        skipped: skipCount,
        mode: isTestMode ? 'TEST (Immediate)' : 'PRODUCTION (24h wait)'
    });

  } catch (error: any) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}