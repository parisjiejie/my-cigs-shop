import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/lib/models/Order';
import { sendEmail } from '@/lib/email';
import Settings from '@/lib/models/Settings';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const { orderId, payerName, paymentAmount, paymentDate, paymentReference } = await request.json();

    if (!orderId || !payerName || !paymentAmount || !paymentDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 查找订单
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 检查订单状态必须是 Pending
    if (order.status !== 'Pending') {
      return NextResponse.json({ error: 'Order is not pending payment' }, { status: 400 });
    }

    // 更新订单 - 状态改为 Paid（已付款待发货）
    order.payerName = payerName;
    order.paymentAmount = paymentAmount;
    order.paymentDate = new Date(paymentDate);
    order.paymentReference = paymentReference;
    order.status = 'Paid';
    order.paidAt = new Date();
    order.paymentReminderStopped = true; // 停止付款提醒

    await order.save();

    // 发送邮件通知管理员
    const settings = await Settings.findOne({ key: 'global_settings' });
    const adminEmail = settings?.adminEmail || 'pap.shop.service@gmail.com';

    const emailBody = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; border: 2px solid #16a34a; border-radius: 8px; padding: 20px;">
        <h2 style="color: #16a34a; margin-top: 0;">💰 New Payment Received</h2>
        <p>A customer has submitted their payment details for Order #${order.orderNumber}.</p>

        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3 style="margin-top: 0; border-bottom: 1px solid #ddd; padding-bottom: 8px;">📋 Order & Payment Details</h3>
          <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p style="margin: 5px 0;"><strong>Total Amount:</strong> <span style="color: #16a34a; font-weight: bold;">$${order.finalTotal.toFixed(2)}</span></p>
          <p style="margin: 5px 0;"><strong>Amount Transferred:</strong> $${parseFloat(paymentAmount).toFixed(2)}</p>
          <p style="margin: 5px 0;"><strong>Payer Name:</strong> ${payerName}</p>
          <p style="margin: 5px 0;"><strong>Transfer Date:</strong> ${new Date(paymentDate).toLocaleDateString('en-AU')}</p>
          <p style="margin: 5px 0;"><strong>Transfer Reference:</strong> ${paymentReference || 'N/A'}</p>
        </div>

        <p style="color: #dc2626; font-size: 14px; font-weight: bold;">
          ⚠️ Please ship this order as soon as possible!
        </p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">
          My Cigs Australia - Auto Notification
        </p>
      </div>
    `;

    await sendEmail({
      to: adminEmail,
      subject: `[Action Required] Payment Received - Order #${order.orderNumber} - $${parseFloat(paymentAmount).toFixed(2)} - Please Ship`,
      html: emailBody
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Payment submitted successfully',
      order: {
        _id: order._id.toString(),
        orderNumber: order.orderNumber,
        status: order.status
      }
    });

  } catch (error) {
    console.error('Payment submission error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
