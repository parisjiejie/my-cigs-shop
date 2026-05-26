import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/lib/models/Order';
import { sendEmail } from '@/lib/email'; // ✅ 确保使用 SMTP 工具

// 发送订单发货邮件
async function sendShippingEmail(order: any) {
    // 移除 Resend API Key 检查，因为我们用的是 SMTP
    if (!order.shippingInfo || !order.shippingInfo.email) {
        return;
    }
    
    const itemsHtml = (order.items || []).map((item: any) => 
        `<li style="margin-bottom: 5px;">${item.name} x ${item.quantity}</li>`
    ).join('');

    const emailBody = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
            <h2 style="color: #2563eb;">Your Order has Shipped! 🚀</h2>
            <p>Dear ${order.shippingInfo.fullName},</p>
            <p>Good news! Your order <strong>#${order.orderNumber}</strong> has been dispatched.</p>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top:0; font-size: 16px;">📦 Logistics Information</h3>
                <p style="margin: 5px 0;"><strong>Carrier:</strong> ${order.carrier}</p>
                <p style="margin: 5px 0;"><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
            </div>

            <div style="margin: 20px 0;">
                <h3 style="font-size: 16px;">🛒 Order Items:</h3>
                <ul>${itemsHtml}</ul>
            </div>

            <p style="font-size: 14px; color: #666;">
                Please allow 24 hours for the tracking number to become active on the carrier's website.<br/>
                You can track your package at: <a href="https://auspost.com.au/mypost/track/#/search">Australia Post Tracking</a>
            </p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #888;">Thank you for shopping with Puff And Present Emporium!</p>
        </div>
    `;
    
    // 异步发送，不阻塞响应
    await sendEmail({
        to: order.shippingInfo.email,
        subject: `Shipping Update: Order #${order.orderNumber}`,
        html: emailBody
    });
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    // 接收 action 字段用于区分操作类型 (状态更新 vs 停止提醒)
    const { orderId, status, trackingNumber, carrier, action } = await request.json(); 

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order ID.' }, { status: 400 });
    }
    
    // 1. 处理手动停止提醒 (13-2.3.2)
    if (action === 'stopReminders') {
        await Order.findByIdAndUpdate(orderId, { paymentReminderStopped: true });
        return NextResponse.json({ success: true, message: 'Payment reminders stopped.' });
    }

    // 2. 处理状态更新 (原有逻辑)
    if (!status) {
         return NextResponse.json({ error: 'Missing status.' }, { status: 400 });
    }

    const updateFields: any = { status: status };
    
    // 如果状态是 Shipped (已发货)，更新物流信息和时间
    if (status === 'Shipped') {
        if (!trackingNumber || !carrier) {
             return NextResponse.json({ error: 'Tracking number and carrier are required for shipping.' }, { status: 400 });
        }
        updateFields.trackingNumber = trackingNumber;
        updateFields.carrier = carrier;
        updateFields.shippedAt = new Date();
        
        // 自动停止支付提醒 (13-2.3.1)
        updateFields.paymentReminderStopped = true; 
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateFields, { new: true }).lean();

    if (!updatedOrder) {
        return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }
    
    // 发送邮件 (仅当状态为 Shipped 时)
    if (status === 'Shipped' && updatedOrder.shippingInfo?.email) {
        sendShippingEmail(updatedOrder).catch(err => console.error("Email error:", err)); 
    }

    return NextResponse.json({ success: true, updatedOrder });
  } catch (error) {
    console.error("Update Order API Error:", error);
    return NextResponse.json({ error: 'Failed to update order.' }, { status: 500 });
  }
}