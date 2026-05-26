"use client";

import { useCartStore } from '@/lib/store';
import Link from 'next/link';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { FormEvent } from 'react';
// 引入活动计算引擎
import { evaluateAllCampaigns } from '@/lib/campaignHelper';

// --- Interfaces ---

interface Address {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  city: string;
  state: string;
  postcode: string;
  isDefault: boolean;
}

interface ShippingMethod {
  _id: string;
  name: string;
  price: number;
  description: string;
}

interface OfferOption {
  id: string;
  type: 'coupon' | 'campaign' | 'none';
  label: string;
  discountValue: number;
  finalTotal: number;
  gifts: any[];
  shippingCost: number;
  isFreeShipping: boolean;
}

// --- Components ---

// 🛒 购物车数量控制器 (修复：红字库存提示)
const CartItemController = ({ item }: { item: any }) => {
  const { updateQuantity, removeFromCart } = useCartStore();
  // 逻辑：如果 item.stock 存在则使用，否则默认 999 (防止旧数据报错)
  const MAX_STOCK = item.stock !== undefined ? item.stock : 999;
  
  // 新增：错误提示状态
  const [errorMsg, setErrorMsg] = useState('');

  // 错误提示 2 秒后自动消失
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const handleDecrement = () => {
    setErrorMsg(''); // 清除错误
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    } else {
      if (confirm("Remove this item from cart?")) {
        removeFromCart(item.id);
      }
    }
  };

  const handleIncrement = () => {
    if (item.quantity < MAX_STOCK) {
      updateQuantity(item.id, item.quantity + 1);
      setErrorMsg(''); // 成功增加，清除错误
    } else {
      // 修复：不再使用 alert，而是设置错误消息
      // 提示内容为 "No more stock" 
      setErrorMsg('No more stock available');
    }
  };

  return (
    <div className="flex flex-col items-end">
      <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
        <button
          type="button"
          onClick={handleDecrement}
          className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded"
        >
          -
        </button>
        <span className="text-sm font-bold w-6 text-center">
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={handleIncrement}
          disabled={item.quantity >= MAX_STOCK}
          className={`w-6 h-6 flex items-center justify-center rounded ${
            item.quantity >= MAX_STOCK
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          +
        </button>
        <button
          type="button"
          onClick={() => removeFromCart(item.id)}
          className="text-xs text-red-500 hover:text-red-700 ml-1 px-2"
        >
          Rem
        </button>
      </div>
      {/* 修复：显示红字提示 */}
      {errorMsg && (
        <span className="text-[10px] text-red-600 font-bold mt-1 animate-pulse">
          {errorMsg}
        </span>
      )}
    </div>
  );
};

// --- Main Page Component ---

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, totalPrice, clearCart } = useCartStore();

  // States
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [isReviewing, setIsReviewing] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);

  // Data
  const [coupons, setCoupons] = useState<any[]>([]);
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);

  // Selection
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [contactEmail, setContactEmail] = useState('');
  const [selectedShippingId, setSelectedShippingId] = useState<string>('');
  const [confirmedShippingInfo, setConfirmedShippingInfo] = useState<any>(null);

  // Offer Selection
  const [selectedOfferId, setSelectedOfferId] = useState<string>('best'); // 'best' | couponId | campaignId | 'none'

  // Auth & UI States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(true);
  const [wantsGuest, setWantsGuest] = useState(false);

  const itemsTotal = totalPrice();

  // 1. Base Shipping
  const currentShippingMethod = shippingMethods.find(m => m._id === selectedShippingId);
  const baseShippingCost = currentShippingMethod ? currentShippingMethod.price : 0;

  // 2. Identify Free Shipping Campaigns
  const freeShippingCampaigns = activeCampaigns.filter(c => c.type === 'free_shipping');

  // 3. Calculate All Possible Offers (Unified List)
  const allOffers = useMemo(() => {
    const options: OfferOption[] = [];

    // Helper: Calculate Free Shipping logic
    const applyFreeShipping = (currentTotal: number) => {
      let isFree = false;
      for (const camp of freeShippingCampaigns) {
        const threshold = camp.rules.freeShippingThreshold || 999999;
        if (currentTotal >= threshold) isFree = true;
      }
      return isFree;
    };

    // Option B: Store Campaigns (Buy X Get Y / Tiered / None)
    const campaignResults = evaluateAllCampaigns(items, activeCampaigns, baseShippingCost);
    
    campaignResults.forEach(res => {
        options.push({
            id: res.id,
            type: res.type === 'none' ? 'none' : 'campaign',
            label: res.label,
            discountValue: res.discountAmount,
            finalTotal: res.finalTotal,
            gifts: res.giftItems,
            shippingCost: res.shippingCost,
            isFreeShipping: res.freeShippingApplied
        });
    });

    // Option C: Coupons (Member Only)
    if (isLoggedIn) {
      const validCoupons = coupons.filter(c => !c.isUsed && new Date(c.expiresAt) > new Date());
      validCoupons.forEach(coupon => {
        if (itemsTotal >= coupon.minOrderAmount) {
          const discount = coupon.discountAmount;
          const totalAfterCoupon = Math.max(0, itemsTotal - discount);
          const isFree = applyFreeShipping(totalAfterCoupon);
          options.push({
            id: coupon._id,
            type: 'coupon',
            label: `${coupon.code} (-$${discount})`,
            discountValue: discount,
            gifts: [],
            shippingCost: isFree ? 0 : baseShippingCost,
            isFreeShipping: isFree,
            finalTotal: totalAfterCoupon + (isFree ? 0 : baseShippingCost)
          });
        }
      });
    }

    // Sort by Final Total (Lowest first)
    return options.sort((a, b) => a.finalTotal - b.finalTotal);
  }, [items, itemsTotal, baseShippingCost, activeCampaigns, coupons, isLoggedIn, freeShippingCampaigns]);

  // 4. Determine Active Offer
  const activeOffer = useMemo(() => {
    if (allOffers.length === 0) return null;
    if (selectedOfferId === 'best' || !allOffers.find(o => o.id === selectedOfferId)) {
      return allOffers[0]; // Default to best
    }
    return allOffers.find(o => o.id === selectedOfferId)!;
  }, [allOffers, selectedOfferId]);

  // Sync selectedOfferId initial value
  useEffect(() => {
    if ((selectedOfferId === 'best' || selectedOfferId === '') && allOffers.length > 0) {
      setSelectedOfferId(allOffers[0].id);
    }
  }, [allOffers, selectedOfferId]);

  // 5. Initialization
  useEffect(() => {
    const init = async () => {
      setIsAddressLoading(true);
      try {
        // A. Campaigns
        const campRes = await fetch('/api/campaigns/active');
        if (campRes.ok) setActiveCampaigns(await campRes.json());

        // B. Shipping Methods
        const shipRes = await fetch('/api/shipping-methods');
        if (shipRes.ok) {
          const shipData = await shipRes.json();
          setShippingMethods(shipData);
          if (shipData.length > 0) setSelectedShippingId(shipData[0]._id);
        }

        // C. Addresses & Coupons
        const addrRes = await fetch('/api/user/address');
        if (addrRes.status === 401) {
          setIsLoggedIn(false);
        } else if (addrRes.ok) {
          setIsLoggedIn(true);
          setWantsGuest(false);
          const addrData = await addrRes.json();
          setAddresses(addrData);

          const defaultAddr = addrData.find((a: Address) => a.isDefault) || addrData[0];
          if (defaultAddr) setSelectedAddressId(defaultAddr._id);

          const couponRes = await fetch('/api/user/coupons');
          if (couponRes.ok) setCoupons(await couponRes.json());
        }
      } catch (e) {
        console.error("Init error:", e);
      } finally {
        setIsAddressLoading(false);
      }
    };
    init();
  }, [itemsTotal]);

  // Auto-fill email
  useEffect(() => {
    if (session?.user?.email && !contactEmail) {
      setContactEmail(session.user.email);
    }
  }, [session, contactEmail]);

  // Helper
  const getCurrentShippingInfo = (formData: FormData | null) => {
    if (isLoggedIn && selectedAddressId) {
      const addr = addresses.find(a => a._id === selectedAddressId);
      if (addr) return {
        fullName: addr.fullName,
        phone: addr.phone,
        email: contactEmail,
        addressLine1: addr.addressLine1,
        city: addr.city,
        state: addr.state,
        postcode: addr.postcode,
      };
    } else if (formData) {
      return {
        fullName: formData.get('fullName'),
        phone: formData.get('phone'),
        email: contactEmail,
        addressLine1: formData.get('addressLine1'),
        city: formData.get('city'),
        state: formData.get('state'),
        postcode: formData.get('postcode'),
      };
    }
    return null;
  };

  // Handlers
  const handleReviewOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactEmail.includes('@')) {
      alert("Please enter a valid email address for order notifications.");
      return;
    }
    if (!selectedShippingId) {
      alert("Please select a shipping method.");
      return;
    }

    let shippingInfo = null;
    if (isLoggedIn && !wantsGuest) {
      if (!selectedAddressId) {
        alert("Please select a shipping address.");
        return;
      }
      shippingInfo = getCurrentShippingInfo(null);
    } else {
      const form = document.getElementById('checkout-form-guest') as HTMLFormElement;
      if (!form || !form.checkValidity()) {
        form?.reportValidity();
        return;
      }
      const formData = new FormData(form);
      shippingInfo = getCurrentShippingInfo(formData);
    }

    if (!shippingInfo || !shippingInfo.fullName) {
      alert("Please complete all shipping details.");
      return;
    }

    setConfirmedShippingInfo(shippingInfo);
    setIsReviewing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingInfo: confirmedShippingInfo,
          shippingMethod: selectedShippingId,
          // 传递选中的优惠 ID
          selectedOfferId: activeOffer?.id
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setOrderResult(data);
        setStep(2);
        clearCart();
      } else {
        alert(data.error || 'Submission failed.');
      }
    } catch (error) {
      alert('Network connection error.');
    }
    setLoading(false);
  };

  // --- Views ---

  // 1. Cart Empty
  if (items.length === 0 && step === 1) return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
          <Link href="/" className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-200">
            Go Shopping
          </Link>
        </div>
      </div>
  );

  // 2. Success Page
  if (step === 2 && orderResult) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl text-green-600">✅</span>
            </div>
            
            <h1 className="text-3xl font-bold text-green-600 mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-500 mb-8">
              Order ID: <span className="font-mono font-bold text-gray-900">{orderResult.orderNumber}</span>
            </p>

            <div className="bg-[#FFFBEB] border border-[#FCD34D] p-6 rounded-xl mb-8 text-left">
              <h3 className="text-lg font-bold text-[#92400E] mb-3 flex items-center gap-2">
                🏦 Bank Transfer Details
              </h3>
              <p className="text-sm text-[#B45309] mb-4">
                Please transfer <span className="font-bold">${orderResult.finalTotal ? orderResult.finalTotal.toFixed(2) : '0.00'}</span> to the account below within 24 hours.
              </p>
              <div className="space-y-2 text-sm font-mono bg-white/60 p-4 rounded-lg border border-[#FDE68A] text-[#92400E]">
                <div className="flex justify-between"><span>BSB:</span> <span className="font-bold">033161</span></div>
                <div className="flex justify-between"><span>ACC:</span> <span className="font-bold">643665</span></div>
                <div className="flex justify-between"><span>Name:</span> <span className="font-bold">zhen-hong yang</span></div>
                <div className="flex justify-between"><span>Bank:</span> <span className="font-bold">westpac</span></div>
              </div>
            </div>
            
            <Link href="/" className="inline-block w-full bg-[#111827] text-white py-4 rounded-xl font-bold hover:bg-black transition text-center">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Interstitial (Login vs Guest)
  if (!isAddressLoading && !isLoggedIn && !wantsGuest) return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="text-center mb-10">
             <h1 className="text-3xl font-bold text-gray-900">How would you like to checkout?</h1>
             <p className="text-gray-500 mt-2">Choose the option that suits you best</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center text-center hover:border-red-200 transition">
                 <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-3xl mb-4">
                    👤
                 </div>
                 <h2 className="text-xl font-bold text-gray-900 mb-2">Login / Register</h2>
                 <p className="text-gray-500 text-sm mb-6 flex-1">
                    Join us to earn <strong>coupons</strong>, track your orders easily, and manage your shipping addresses.
                 </p>
                 <Link href="/login?callbackUrl=/checkout" className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-100 block text-center">
                    Log In or Sign Up
                 </Link>
             </div>

             <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center text-center hover:border-gray-400 transition">
                 <div className="w-16 h-16 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center text-3xl mb-4">
                    🚀
                 </div>
                 <h2 className="text-xl font-bold text-gray-900 mb-2">Guest Checkout</h2>
                 <p className="text-gray-500 text-sm mb-6 flex-1">
                    No account required. You can still track your order via email updates. Fast and simple.
                 </p>
                 <button onClick={() => setWantsGuest(true)} className="w-full bg-white text-gray-900 border-2 border-gray-200 py-3 rounded-xl font-bold hover:border-gray-900 hover:bg-gray-50 transition mt-4">
                    Continue as Guest
                 </button>
             </div>
          </div>
        </div>
      </div>
  );

  // 4. Main Checkout Form
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        {isReviewing ? (
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold mb-6 border-b pb-4">Review Your Order</h2>
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Shipping To</h3>
                        <div className="text-sm text-gray-800 bg-gray-50 p-4 rounded-lg">
                            <p className="font-bold text-base">{confirmedShippingInfo.fullName}</p>
                            <p>{confirmedShippingInfo.phone}</p>
                            <p>{confirmedShippingInfo.email}</p>
                            <p className="mt-2">{confirmedShippingInfo.addressLine1}</p>
                            <p>{confirmedShippingInfo.city}, {confirmedShippingInfo.state} {confirmedShippingInfo.postcode}</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Method</h3>
                        <div className="text-sm text-gray-800 bg-gray-50 p-4 rounded-lg">
                            <p className="font-bold">{currentShippingMethod?.name}</p>
                            <p className="text-gray-500">{currentShippingMethod?.description}</p>
                            <p className="font-bold mt-1">${baseShippingCost.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Items</h3>
                    <div className="border rounded-lg overflow-hidden">
                        {items.map((item) => (
                            <div key={item.id} className="flex justify-between p-4 border-b last:border-0 bg-white text-sm items-center">
                                <div>
                                    <p className="font-bold text-gray-900">{item.name}</p>
                                    <p className="text-gray-500">Qty: {item.quantity} x ${item.price.toFixed(2)}</p>
                                </div>
                                <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                        {/* 🎁 Gift Preview */}
                        {activeOffer?.gifts?.map((gift: any, idx: number) => (
                             <div key={idx} className="flex justify-between p-4 border-b last:border-0 bg-green-50 text-sm items-center">
                                <div>
                                    <p className="font-bold text-green-700">🎁 {gift.name}</p>
                                    <p className="text-green-600">Qty: {gift.quantity}</p>
                                </div>
                                <span className="font-bold text-green-700">Free</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between items-center bg-gray-50 p-6 rounded-xl mb-8">
                    <div>
                        <p className="text-gray-600 text-sm">Total Amount</p>
                        {activeOffer && activeOffer.discountValue > 0 && <p className="text-green-600 text-xs">Includes ${activeOffer.discountValue.toFixed(2)} discount ({activeOffer.label})</p>}
                        {activeOffer?.isFreeShipping && <p className="text-blue-600 text-xs font-bold">Free Shipping Applied</p>}
                    </div>
                    <p className="text-3xl font-extrabold text-red-600">${(activeOffer?.finalTotal || 0).toFixed(2)}</p>
                </div>

                <div className="flex gap-4">
                    <button onClick={() => setIsReviewing(false)} className="flex-1 py-3 border border-gray-300 rounded-lg font-bold hover:bg-gray-50">← Edit</button>
                    <button onClick={handlePlaceOrder} disabled={loading} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 shadow-lg text-lg">{loading ? 'Processing...' : 'Confirm & Pay'}</button>
                </div>
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Forms */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* 1. Contact Email */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Contact Information</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address for Order Updates</label>
                            <input 
                                type="email" 
                                required 
                                value={contactEmail} 
                                onChange={(e) => setContactEmail(e.target.value)} 
                                className="w-full border p-2.5 rounded-lg outline-none focus:border-red-500 bg-gray-50 focus:bg-white transition"
                                placeholder="your@email.com"
                            />
                            <p className="text-xs text-gray-500 mt-1">We'll send your order confirmation and tracking number here.</p>
                        </div>
                    </div>

                    {/* 2. Shipping Address */}
                    {isLoggedIn && !wantsGuest ? (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-bold">Shipping Address</h2>
                                <Link href="/profile?tab=Addresses" className="text-blue-600 text-sm hover:underline">Manage / Add New</Link>
                            </div>
                            {addresses.length > 0 ? (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {addresses.map(addr => (
                                        <div 
                                            key={addr._id} 
                                            onClick={() => setSelectedAddressId(addr._id)} 
                                            className={`p-4 border rounded-xl cursor-pointer transition ${selectedAddressId === addr._id ? 'border-red-500 bg-red-50 ring-1 ring-red-200' : 'hover:bg-gray-50'}`}
                                        >
                                            <div className="font-bold">{addr.fullName}</div>
                                            <div className="text-xs text-gray-500 mt-1 mb-2">{addr.email}</div>
                                            <div className="text-sm">{addr.addressLine1}, {addr.city}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6">No addresses. <Link href="/profile?tab=Addresses" className="text-red-600 underline">Add one now</Link></div>
                            )}
                        </div>
                    ) : (
                        <form id="checkout-form-guest" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                            <h2 className="font-bold border-b pb-2">Guest Shipping Address</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-gray-500">FULL NAME</label><input name="fullName" className="w-full border p-2 rounded" required /></div>
                                <div><label className="text-xs font-bold text-gray-500">PHONE</label><input name="phone" type="tel" className="w-full border p-2 rounded" required /></div>
                            </div>
                            <div><label className="text-xs font-bold text-gray-500">STREET ADDRESS</label><input name="addressLine1" className="w-full border p-2 rounded" required /></div>
                            <div className="grid grid-cols-3 gap-2">
                                <input name="city" placeholder="City" className="border p-2 rounded" required />
                                <select name="state" className="border p-2 rounded bg-white"><option>NSW</option><option>VIC</option><option>QLD</option><option>WA</option><option>SA</option><option>TAS</option><option>ACT</option><option>NT</option></select>
                                <input name="postcode" placeholder="Postcode" className="border p-2 rounded" required />
                            </div>
                        </form>
                    )}

                    {/* 3. Shipping Method */}
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Shipping Method</h2>
                        <div className="space-y-3">
                            {shippingMethods.length > 0 ? shippingMethods.map(method => (
                                <label key={method._id} className={`flex justify-between p-4 border rounded-xl cursor-pointer transition ${selectedShippingId === method._id ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                                    <div className="flex gap-2">
                                        <input 
                                            type="radio" 
                                            name="shipping" 
                                            checked={selectedShippingId === method._id} 
                                            onChange={() => setSelectedShippingId(method._id)} 
                                            className="text-red-600" 
                                        /> 
                                        <div>
                                            <div className="font-bold">{method.name}</div>
                                            <div className="text-xs text-gray-500">{method.description}</div>
                                        </div>
                                    </div>
                                    <span className="font-bold">${method.price.toFixed(2)}</span>
                                </label>
                            )) : (
                                <div className="text-gray-500 text-sm">Loading options...</div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Column: Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-4">
                        <h2 className="font-bold mb-4">Order Summary</h2>
                        
                        {/* Offer Selection Dropdown */}
                        {allOffers.length > 0 && (
                             <div className="mb-6">
                                <label className="block text-sm font-medium mb-1">Select Offer</label>
                                <select 
                                    value={selectedOfferId} 
                                    onChange={(e) => setSelectedOfferId(e.target.value)} 
                                    className="w-full border p-2 rounded text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500"
                                >
                                    {allOffers.map(offer => (
                                        <option key={offer.id} value={offer.id}>
                                            {offer.label} {offer.discountValue > 0 ? `(-$${offer.discountValue.toFixed(2)})` : ''} 
                                        </option>
                                    ))}
                                </select>
                             </div>
                        )}
                        
                        {/* Current applied promo label */}
                        {activeOffer && activeOffer.type !== 'none' && (
                            <div className="mb-4 p-2 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100 font-bold">
                                🎉 Applied: {activeOffer.label}
                            </div>
                        )}

                        <div className="space-y-4 mb-4 border-b pb-4 max-h-60 overflow-y-auto">
                            {items.map((item) => (
                            <div key={item.id} className="text-sm border-b border-gray-50 last:border-0 pb-2">
                                <div className="flex justify-between font-medium">
                                    <span className="line-clamp-1 w-2/3">{item.name}</span>
                                    <span className="text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-gray-500 text-xs">${item.price.toFixed(2)} each</span>
                                    {/* Quantity Controls */}
                                    <div className="scale-90 origin-right">
                                        <CartItemController item={item} />
                                    </div>
                                </div>
                            </div>
                            ))}
                        </div>

                        {/* Gift Preview */}
                        {activeOffer && activeOffer.gifts && activeOffer.gifts.length > 0 && (
                            <div className="mb-4 border-b pb-4 border-dashed">
                                <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Free Gifts Included</p>
                                {activeOffer.gifts.map((gift: any, idx: number) => (
                                    <div key={idx} className="flex justify-between text-sm text-green-700 bg-green-50 p-2 rounded mb-1">
                                        <span>🎁 {gift.name}</span><span>x {gift.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="pt-2 space-y-2 text-sm border-b pb-4 mb-4">
                            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${itemsTotal.toFixed(2)}</span></div>
                            {activeOffer && activeOffer.discountValue > 0 && (
                                <div className="flex justify-between text-green-600 font-bold">
                                    <span>Discount</span>
                                    <span>-${activeOffer.discountValue.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-600"><span>Shipping</span><span>${(activeOffer?.shippingCost || 0).toFixed(2)}</span></div>
                        </div>

                        <div className="border-t border-gray-200 pt-4 mt-4">
                            <div className="flex justify-between items-center text-xl font-extrabold text-gray-900">
                                <span>Total</span>
                                <span className="text-red-600">${(activeOffer?.finalTotal || 0).toFixed(2)}</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleReviewOrder} 
                            disabled={loading}
                            className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 transition shadow-lg"
                        >
                            {loading ? 'Processing...' : 'Review Order'}
                        </button>
                        
                        <p className="text-center text-xs text-gray-400 mt-4">
                            By placing this order, you agree to our Terms of Service.
                        </p>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}