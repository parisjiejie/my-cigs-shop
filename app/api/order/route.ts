import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import Coupon from '@/lib/models/Coupon';
import Campaign from '@/lib/models/Campaign';
import ShippingMethod from '@/lib/models/ShippingMethod'; 
import { sendEmail } from '@/lib/email';
import { evaluateAllCampaigns } from '@/lib/campaignHelper';

// 1. 生成订单号 (ORD + 年月日 + 4位自动递增)
async function generateOrderNumber() {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const dd = now.getDate().toString().padStart(2, '0');
  const prefix = `ORD${yy}${mm}${dd}`; // e.g., ORD251209
  
  // 查找当天最新的订单号
  const latestOrder = await Order.findOne({ 
    orderNumber: { $regex: `^${prefix}` } 
  }).sort({ orderNumber: -1 }).select('orderNumber').lean();

  let sequence = 1;
  if (latestOrder && latestOrder.orderNumber) {
    const lastSeqStr = latestOrder.orderNumber.slice(-4);
    const lastSeq = parseInt(lastSeqStr, 10);
    if (!isNaN(lastSeq)) {
      sequence = lastSeq + 1;
    }
  }

  return `${prefix}${sequence.toString().padStart(4, '0')}`;
}

// 2. 发送邮件通知 (包含详细 HTML)
async function sendOrderConfirmationEmails(order: any) {
    const adminEmail = "pap.shop.service@gmail.com";
    const customerEmail = order.shippingInfo.email;
    
    // 商品列表 HTML
    const itemsHtml = order.items.map((item: any) => 
        `<li style="margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 8px; display: flex; justify-content: space-between;">
            <span>
                <strong>${item.name}</strong> 
                <span style="color: #666;">x ${item.quantity}</span>
                ${item.price === 0 ? '<span style="color: green; font-size: 12px; margin-left: 5px;">(GIFT)</span>' : ''}
            </span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
         </li>`
    ).join('');

    // 费用明细数据
    const subtotal = order.itemsTotal.toFixed(2);
    const shipping = order.shippingCost.toFixed(2);
    const discount = order.discountAmount > 0 ? `-$${order.discountAmount.toFixed(2)}` : '$0.00';
    const total = order.finalTotal.toFixed(2);

    // 通用邮件正文模板
    const commonBody = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; line-height: 1.6; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; background-color: #ffffff;">
            
            <h2 style="color: #2563eb; text-align: center; margin-bottom: 5px;">Order Confirmed</h2>
            <p style="text-align: center; color: #666; font-size: 14px; margin-top: 0;">Order #${order.orderNumber}</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h3 style="margin-top: 0; font-size: 16px; color: #444; border-bottom: 1px solid #ddd; padding-bottom: 8px;">📦 Shipping Information</h3>
                <p style="margin: 5px 0;"><strong>Name:</strong> ${order.shippingInfo.fullName}</p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> ${order.shippingInfo.phone}</p>
                <p style="margin: 5px 0;"><strong>Address:</strong> ${order.shippingInfo.addressLine1}, ${order.shippingInfo.city}, ${order.shippingInfo.state} ${order.shippingInfo.postcode}</p>
            </div>
            
            <div style="margin: 20px 0;">
                <h3 style="font-size: 16px; color: #444; border-bottom: 1px solid #ddd; padding-bottom: 8px;">🛒 Order Details</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">${itemsHtml}</ul>
                
                <div style="margin-top: 15px; padding-top: 10px; background-color: #fafafa; padding: 15px; border-radius: 6px;">
                    <p style="display: flex; justify-content: space-between; margin: 5px 0;">
                        <span style="color: #666;">Subtotal:</span>
                        <span>$${subtotal}</span>
                    </p>
                    <p style="display: flex; justify-content: space-between; margin: 5px 0;">
                        <span style="color: #666;">Shipping (${order.carrier || 'Standard'}):</span>
                        <span>$${shipping}</span>
                    </p>
                    ${order.discountAmount > 0 ? `
                    <p style="display: flex; justify-content: space-between; margin: 5px 0; color: #16a34a;">
                        <span>Discount:</span>
                        <span>${discount}</span>
                    </p>` : ''}
                    <p style="display: flex; justify-content: space-between; margin: 10px 0 0 0; font-weight: bold; font-size: 1.2em; border-top: 2px solid #eee; padding-top: 10px;">
                        <span>Total:</span>
                        <span style="color: #d32f2f;">$${total}</span>
                    </p>
                </div>
            </div>

            <div style="background-color: #fffbeb; border: 1px solid #fcd34d; padding: 15px; border-radius: 6px; color: #92400e;">
                <h3 style="margin-top: 0; font-size: 16px;">🏦 Bank Transfer Details</h3>
                <p style="margin: 5px 0; font-size: 14px;">Please transfer the <strong>Total Amount</strong> within 24 hours.</p>
                <ul style="list-style: none; padding: 0; margin: 10px 0 0 0; font-family: monospace; font-size: 14px;">
                    <li>Bank: Commonwealth Bank</li>
                    <li>Name: My Cigs Trading PTY LTD</li>
                    <li>BSB: 062-000</li>
                    <li>ACC: 1234 5678</li>
                    <li>Ref: <strong>${order.orderNumber}</strong></li>
                </ul>
            </div>
            
            <p style="margin-top: 25px; font-size: 14px; text-align: center; color: #555;">
               If you have any questions, please contact us at <a href="mailto:pap.shop.service@gmail.com" style="color: #2563eb; text-decoration: none;">pap.shop.service@gmail.com</a>.
            </p>

            <p style="text-align: center; margin-top: 10px; font-size: 12px; color: #999;">
                Thank you for choosing Puff And Present Emporium!
            </p>
        </div>
    `;

    // 发送给客户
    if (customerEmail) {
        await sendEmail({
            to: customerEmail,
            subject: `Order Confirmation: #${order.orderNumber}`,
            html: commonBody
        });
    }

    // 发送给管理员
    await sendEmail({
        to: adminEmail,
        subject: `[New Order] #${order.orderNumber} ($${order.finalTotal.toFixed(2)})`,
        html: `<p style="color:red; font-weight:bold; font-size:16px;">🔔 New Order Notification</p>${commonBody}`
    });
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    await dbConnect();
    
    const body = await request.json();
    const { items, shippingInfo, shippingMethod, selectedOfferId } = body; 

    // 基础验证
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
    }
    
    if (!shippingInfo || !shippingInfo.fullName || !shippingInfo.addressLine1 || !shippingInfo.email) {
        return NextResponse.json({ error: 'Missing required shipping information (Email is required).' }, { status: 400 });
    }

    let itemsTotal = 0;
    const finalItems = [];
    const calculationItems = [];

    // 1. 验证库存和计算商品总价
    for (const item of items) {
      const product = await Product.findById(item.id);
      if (!product) {
        throw new Error(`Stock error: Product ${item.name} not found.`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Stock error: Product ${product.name} is out of stock. Only ${product.stock} available.`);
      }

      // 扣减主商品库存
      product.stock -= item.quantity;
      product.salesCount = (product.salesCount || 0) + item.quantity;
      await product.save();

      itemsTotal += product.price * item.quantity;
      
      finalItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image || product.images?.[0],
      });
      
      calculationItems.push({
          id: product._id.toString(),
          name: product.name,
          price: product.price,
          quantity: item.quantity
      });
    }

    // 2. 运费计算
    let shippingCost = 15;
    let shippingName = 'Standard';

    if (shippingMethod) {
        try {
            if (shippingMethod.match(/^[0-9a-fA-F]{24}$/)) {
                const method = await ShippingMethod.findById(shippingMethod);
                if (method) {
                    shippingCost = method.price;
                    shippingName = method.name;
                }
            } else {
                if (shippingMethod === 'express') {
                    shippingCost = 25;
                    shippingName = 'Express Shipping';
                }
            }
        } catch (e) {
            console.warn("Shipping method lookup failed, using default.");
        }
    }

    // 3. 优惠计算 (根据 selectedOfferId 重算)
    let discountAmount = 0;
    let finalShippingCost = shippingCost;
    let appliedPromo = '';

    // A. 尝试作为 Coupon 处理 (selectedOfferId 是 MongoDB ObjectId 格式)
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(selectedOfferId);
    let couponApplied = false;

    if (selectedOfferId && isMongoId && session?.user) {
        const coupon = await Coupon.findById(selectedOfferId);
        const currentUserId = (session.user as any).id;
        
        if (coupon && !coupon.isUsed && new Date(coupon.expiresAt) > new Date() && coupon.userId.toString() === currentUserId) {
            if (itemsTotal >= coupon.minOrderAmount) {
                discountAmount = coupon.discountAmount;
                appliedPromo = `Coupon: ${coupon.code}`;
                // 标记已使用
                await Coupon.findByIdAndUpdate(selectedOfferId, { isUsed: true, usedAt: new Date() });
                couponApplied = true;

                // 检查是否满足包邮活动的门槛 (叠加)
                const freeShipCamp = await Campaign.findOne({ type: 'free_shipping', isActive: true });
                if (freeShipCamp) {
                    const threshold = freeShipCamp.rules.freeShippingThreshold || 999999;
                    if ((itemsTotal - discountAmount) >= threshold) {
                        finalShippingCost = 0;
                    }
                }
            }
        }
    } 
    
    // B. 尝试作为 Campaign 处理 (如果没用优惠券)
    if (!couponApplied) {
        const now = new Date();
        const activeCampaigns = await Campaign.find({
            isActive: true,
            $or: [{ startDate: { $exists: false } }, { startDate: { $lte: now } }],
            $and: [{ $or: [{ endDate: { $exists: false } }, { endDate: { $gte: now } }] }]
        }).lean();

        const formattedCampaigns = activeCampaigns.map((c: any) => ({
            ...c, _id: c._id.toString(), targetProducts: c.targetProducts?.map((id: any) => id.toString()) || []
        }));
        
        // 调用引擎获取所有方案
        const allResults = evaluateAllCampaigns(calculationItems, formattedCampaigns as any, shippingCost);
        
        // 找到用户选的那个方案 (或者默认取最优)
        // selectedOfferId 可能是 'campaign_buy_x' 或 'campaign_discount' 或 'none'
        // 如果 selectedOfferId 是 'best' 或找不到，我们在后端自动取第一个（最优）作为默认
        let chosenResult = allResults.find(r => r.id === selectedOfferId);
        
        // 如果没传 ID 或者 ID 无效，回退到最优解 (防止前端只显示了最优但没传 ID)
        if (!chosenResult) {
             // 排序：按 Total Savings 降序排列
             allResults.sort((a, b) => b.totalSavings - a.totalSavings);
             chosenResult = allResults[0];
        }

        if (chosenResult && chosenResult.type !== 'none') {
            discountAmount = chosenResult.discountAmount;
            finalShippingCost = chosenResult.shippingCost;
            appliedPromo = chosenResult.appliedCampaignName || '';

            // D. 处理赠品 (Gift Items) - 扣减赠品库存
            if (chosenResult.giftItems && chosenResult.giftItems.length > 0) {
                for (const gift of chosenResult.giftItems) {
                    const product = await Product.findById(gift.id);
                    if (product) {
                        if (product.stock >= gift.quantity) {
                            product.stock -= gift.quantity;
                            await product.save();

                            finalItems.push({
                                productId: product._id,
                                name: `${product.name} (Gift)`,
                                price: 0, 
                                quantity: gift.quantity,
                                image: product.image
                            });
                        } else {
                            // 赠品库存不足，暂时忽略或标记
                            console.warn(`Gift ${product.name} out of stock.`);
                        }
                    }
                }
            }
        } else if (chosenResult && chosenResult.type === 'none') {
             // 如果选了 "No Promotion"，但可能还是满足了包邮 (freeShippingApplied)
             finalShippingCost = chosenResult.shippingCost;
        }
    }

    const finalTotal = Math.max(0, itemsTotal - discountAmount + finalShippingCost); 
    const orderNumber = await generateOrderNumber();

    // 6. 创建订单
    const newOrder = await Order.create({
      userId: session?.user ? (session.user as any).id : null,
      isGuest: !session?.user, 
      orderNumber, 
      shippingInfo, 
      items: finalItems,
      itemsTotal: itemsTotal,
      shippingCost: finalShippingCost,
      discountAmount: discountAmount,
      finalTotal: finalTotal,
      status: 'Pending',
      carrier: shippingName, 
    });
    
    // 7. 发送邮件 (异步)
    sendOrderConfirmationEmails(newOrder).catch(err => console.error("Email send error:", err));

    return NextResponse.json({ 
      success: true, 
      orderId: newOrder._id,
      orderNumber: newOrder.orderNumber,
      finalTotal: finalTotal 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Order submission failed:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}