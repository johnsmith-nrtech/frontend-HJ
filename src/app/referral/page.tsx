


"use client";

import React, { useEffect, useState } from "react";
import { ApiService } from "@/lib/api-service";
import { useAuth } from "@/lib/providers/auth-provider";
import { toast } from "sonner";
import { Copy, Users, Wallet, Gift, Check } from "lucide-react";

interface ReferralHistoryItem {
  id: string;
  usedByEmail: string;
  usedByName: string;
  orderId: string;
  rewardGiven: number;
  discountGiven: number;
  date: string;
}

interface ReferralData {
  balance: number;
  total_earned: number;
  total_referrals: number;
  referral_code: string;
  history: ReferralHistoryItem[];
}

export default function ReferralPage() {
  const { user } = useAuth();
  const [data, setData] = useState<ReferralData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch both in parallel for better performance
        const [codeRes, historyRes] = await Promise.all([
          ApiService.fetchWithAuth("/coupons/user/referral-code"),
          ApiService.fetchWithAuth("/coupons/user/referral-history")
        ]);
        
        const codeData = await codeRes.json();
        const historyData = await historyRes.json();
        
        // Merge the data - assuming history endpoint returns most data
        // and code endpoint returns the referral code
        setData({
          ...historyData,
          referral_code: codeData.referral_code || historyData.referral_code
        });
      } catch (err) {
        console.error("Failed to fetch referral data:", err);
        toast.error("Failed to load referral data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleCopy = () => {
    if (!data?.referral_code) return;
    navigator.clipboard.writeText(data.referral_code);
    setCopied(true);
    toast.success("Referral code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">Please login to view your referral details.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-500">Loading your referral details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-[#222222] sm:text-5xl">
          Refer &amp; Earn Wallet Credit
        </h1>
        <p className="text-base text-[#999999]">
          Invite friends — they get 10% off, you earn £500 wallet credit
        </p>
      </div>

      {/* All Cards - Equal Widths */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Referral Card */}
        <div className="lg:col-span-1">
          <div className="flex h-full min-h-[280px] flex-col rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-full bg-blue-100 p-2">
                <Gift size={20} className="text-blue-600" />
              </div>
              <p className="text-sm font-semibold uppercase text-[#666666]">
                Your Code
              </p>
            </div>
            
            <div className="mt-auto flex flex-col gap-3">
              <div className="rounded-xl border-2 border-dashed border-blue-400 bg-white px-4 py-4 text-center">
                <span className="text-2xl font-bold tracking-widest text-blue-700">
                  {data?.referral_code || "--------"}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                {copied ? <><Check size={18} /> Copied</> : <><Copy size={18} /> Copy</>}
              </button>
            </div>
          </div>
        </div>

        {/* Total Referrals Card */}
        <div className="lg:col-span-1">
          <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 shadow-sm text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
              <Users size={28} className="text-blue-600" />
            </div>
            <p className="text-4xl font-bold text-[#222222]">{data?.total_referrals ?? 0}</p>
            <p className="mt-2 text-sm text-[#999999]">Total Referrals</p>
          </div>
        </div>

        {/* Wallet Balance Card */}
        <div className="lg:col-span-1">
          <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 shadow-sm text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <Wallet size={28} className="text-green-600" />
            </div>
            <p className="text-4xl font-bold text-[#222222]">
              £{(data?.balance ?? 0).toFixed(2)}
            </p>
            <p className="mt-2 text-sm text-[#999999]">Wallet Balance</p>
            <p className="mt-1 text-xs text-green-600">Available</p>
          </div>
        </div>

        {/* Total Earned Card */}
        <div className="lg:col-span-1">
          <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 shadow-sm text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100">
              <Gift size={28} className="text-yellow-600" />
            </div>
            <p className="text-4xl font-bold text-[#222222]">
              £{(data?.total_earned ?? 0).toFixed(2)}
            </p>
            <p className="mt-2 text-sm text-[#999999]">Total Earned</p>
            <p className="mt-1 text-xs text-yellow-600">Lifetime</p>
          </div>
        </div>

      </div>

      {/* Referral History Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-[#222222]">Referral History</h2>
          <p className="text-sm text-[#999999]">People who used your referral code</p>
        </div>

        {!data?.history || data.history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Users size={32} className="text-gray-400" />
            </div>
            <p className="text-base font-medium text-[#222222]">No referrals yet</p>
            <p className="mt-1 text-sm text-[#999999]">
              Share your referral code with friends to start earning!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 text-left font-semibold text-[#999999]">#</th>
                  <th className="px-6 py-3 text-left font-semibold text-[#999999]">Name</th>
                  <th className="px-6 py-3 text-left font-semibold text-[#999999]">Email</th>
                  <th className="px-6 py-3 text-left font-semibold text-[#999999]">Order ID</th>
                  <th className="px-6 py-3 text-left font-semibold text-[#999999]">Discount Given</th>
                  <th className="px-6 py-3 text-left font-semibold text-[#999999]">You Earned</th>
                  <th className="px-6 py-3 text-left font-semibold text-[#999999]">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.history.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-50 transition hover:bg-gray-50">
                    <td className="px-6 py-4 text-[#999999]">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-[#222222]">
                      {item.usedByName || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-[#666666]">
                      {item.usedByEmail || "Unknown"}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[#666666]">
                      #{item.orderId?.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-red-500">
                      -£{Number(item.discountGiven || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        +£{Number(item.rewardGiven || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#999999]">
                      {new Date(item.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}