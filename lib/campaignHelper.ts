// 定义接口
interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}
  
interface Campaign {
    _id: string;
    name: string;
    type: 'buy_x_get_y' | 'tiered_discount' | 'free_shipping';
    scope: 'all' | 'specific';
    targetProducts: string[];
    rules: {
        buyQuantity?: number;
        getQuantity?: number;
        minSpend?: number;
        discountAmount?: number;
        freeShippingThreshold?: number;
    };
}

interface CalculationResult {
    id: string; // 方案唯一ID (用于前端选择)
    type: 'buy_x_get_y' | 'tiered_discount' | 'none'; // 方案类型
    label: string; // 方案显示名称
    finalTotal: number;
    subtotal: number;
    discountAmount: number;
    shippingCost: number;
    freeShippingApplied: boolean;
    appliedCampaignName?: string; 
    giftItems: CartItem[];
    totalSavings: number; // 用于比价：总节省价值 (折扣+赠品+运费减免)
}
  
/**
 * 计算所有可能的营销活动方案 (互斥)
 * 返回一个列表，包含：买赠方案(如果有)、满减方案(如果有)、无优惠方案
 */
export function evaluateAllCampaigns(items: CartItem[], campaigns: Campaign[], baseShippingCost: number): CalculationResult[] {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const uniqueItemCount = items.length; // 不同产品的数量
    
    const results: CalculationResult[] = [];

    // --- 0. 准备包邮规则 (辅助函数) ---
    const shippingCampaign = campaigns.find(c => c.type === 'free_shipping');
    
    const applyShippingLogic = (currentResult: CalculationResult) => {
        // 先重置为基础运费
        currentResult.shippingCost = baseShippingCost;
        currentResult.freeShippingApplied = false;

        if (shippingCampaign) {
            const threshold = shippingCampaign.rules.freeShippingThreshold || 999999;
            // 规则：按优惠后的金额 (finalTotal) 计算是否包邮
            // 注意：此时传入的 currentResult.finalTotal 应该是不含运费的纯商品总价
            if (currentResult.finalTotal >= threshold) {
                currentResult.shippingCost = 0;
                currentResult.freeShippingApplied = true;
                // 累加运费节省到总价值
                currentResult.totalSavings += baseShippingCost;
                
                // 更新显示名称 (Append Free Shipping) - 仅在 appliedCampaignName 存在时追加，保持整洁
                if (shippingCampaign.name && currentResult.appliedCampaignName) {
                     if (!currentResult.appliedCampaignName.includes(shippingCampaign.name)) {
                         // 不再在这里追加文字，让前端去显示 "+ Free Ship" 标签，保持 label 干净
                         // currentResult.appliedCampaignName += ` + ${shippingCampaign.name}`;
                     }
                }
            }
        }
        // 更新最终含运费总价
        currentResult.finalTotal += currentResult.shippingCost;
    };

    // --- 策略 1: "每满 X 赠 Y" (Buy X Get Y) ---
    const buyXCampaigns = campaigns.filter(c => c.type === 'buy_x_get_y');
    if (buyXCampaigns.length > 0) {
        const resultBuyX: CalculationResult = {
            id: 'campaign_buy_x',
            type: 'buy_x_get_y',
            label: '',
            finalTotal: subtotal, // 初始不含运费
            subtotal: subtotal,
            discountAmount: 0,
            shippingCost: baseShippingCost,
            freeShippingApplied: false,
            giftItems: [],
            appliedCampaignName: '',
            totalSavings: 0
        };

        buyXCampaigns.forEach(camp => {
            items.forEach(item => {
                if (camp.scope === 'specific' && !camp.targetProducts.includes(String(item.id))) return;
                
                const buyQty = camp.rules.buyQuantity || 9999;
                const getQty = camp.rules.getQuantity || 0;

                if (item.quantity >= buyQty) {
                    const multiplier = Math.floor(item.quantity / buyQty);
                    const giftCount = multiplier * getQty;

                    if (giftCount > 0) {
                        resultBuyX.giftItems.push({
                            ...item,
                            id: item.id, 
                            name: `${item.name} (Gift)`,
                            price: 0,
                            quantity: giftCount
                        });
                        resultBuyX.totalSavings += giftCount * item.price;
                        
                        if (!resultBuyX.appliedCampaignName) resultBuyX.appliedCampaignName = camp.name;
                        else if (!resultBuyX.appliedCampaignName.includes(camp.name)) {
                            resultBuyX.appliedCampaignName += `, ${camp.name}`;
                        }
                    }
                }
            });
        });

        if (resultBuyX.giftItems.length > 0) {
            applyShippingLogic(resultBuyX);
            const giftSummary = resultBuyX.giftItems.map(g => `${g.quantity}x ${g.name.replace(' (Gift)', '')}`).join(', ');
            resultBuyX.label = `${resultBuyX.appliedCampaignName} (Get ${giftSummary} Free)`;
            results.push(resultBuyX);
        }
    }

    // --- 策略 2: "每满额减免" (Tiered Discount) ---
    const discountCampaigns = campaigns.filter(c => c.type === 'tiered_discount');
    if (discountCampaigns.length > 0 && uniqueItemCount >= 2) { 
        let maxDiscount = 0;
        let bestName = '';

        discountCampaigns.forEach(camp => {
            let eligibleAmount = 0;
            if (camp.scope === 'all') {
                eligibleAmount = subtotal;
            } else {
                eligibleAmount = items
                    .filter(item => camp.targetProducts.includes(String(item.id)))
                    .reduce((sum, item) => sum + item.price * item.quantity, 0);
            }

            const minSpend = camp.rules.minSpend || 999999;
            const unitDiscount = camp.rules.discountAmount || 0;

            if (eligibleAmount >= minSpend) {
                const multiplier = Math.floor(eligibleAmount / minSpend);
                const currentTotalDiscount = multiplier * unitDiscount;

                if (currentTotalDiscount > maxDiscount) {
                    maxDiscount = currentTotalDiscount;
                    bestName = camp.name;
                }
            }
        });

        if (maxDiscount > 0) {
            const resultDiscount: CalculationResult = {
                id: 'campaign_discount',
                type: 'tiered_discount',
                label: '',
                finalTotal: Math.max(0, subtotal - maxDiscount), // 初始不含运费
                subtotal: subtotal,
                discountAmount: maxDiscount,
                shippingCost: baseShippingCost,
                freeShippingApplied: false,
                giftItems: [],
                appliedCampaignName: bestName,
                totalSavings: maxDiscount
            };
            
            applyShippingLogic(resultDiscount);
            resultDiscount.label = `${bestName} (-$${maxDiscount.toFixed(2)})`;
            results.push(resultDiscount);
        }
    }

    // --- 策略 3: 无活动 (基准方案) ---
    const resultNone: CalculationResult = {
        id: 'none',
        type: 'none',
        label: 'No Promotion', // 默认叫 No Promotion
        finalTotal: subtotal,
        subtotal: subtotal,
        discountAmount: 0,
        shippingCost: baseShippingCost,
        freeShippingApplied: false,
        giftItems: [],
        appliedCampaignName: '',
        totalSavings: 0
    };
    applyShippingLogic(resultNone);
    
    // 逻辑修正：
    // 1. 如果没有任何优惠方案 (results为空)，必须把 "No Promotion" 加进去。
    // 2. 如果已经有了优惠方案，我们通常就不需要 "No Promotion" 这个选项了，除非用户非要不选优惠。
    //    但为了逻辑完整，我们还是加上它，作为最后一个选项 "Do not use offers"。
    
    // 如果 resultNone 触发了包邮，它的 label 可能会变成 "Free Shipping Only"，这正是您想去掉的。
    // 所以我们统一叫它 "No Promotion"，然后如果触发包邮，前端会在 summary 里显示 "Free Shipping Applied"。
    
    // 将无活动方案始终加入，但排在最后，作为兜底
    resultNone.label = "Standard (No Offer)";
    results.push(resultNone);

    return results;
}

/**
 * 获取最优方案
 */
export function calculateCampaigns(items: CartItem[], campaigns: Campaign[], baseShippingCost: number): CalculationResult {
    const options = evaluateAllCampaigns(items, campaigns, baseShippingCost);
    
    // 排序：按 Total Savings 降序排列 (省钱最多的排前面)
    options.sort((a, b) => b.totalSavings - a.totalSavings);

    // 返回第一个最优解
    return options[0];
}