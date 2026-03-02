"use client";

import React, { useEffect, useState } from "react";
import { ApiService } from "@/lib/api-service";
import { toast } from "sonner";
import { Settings, Gift, TrendingUp, Users, DollarSign } from "lucide-react";

interface ReferralHistoryItem {
  id: string;
  referrerName: string;
  referrerEmail: string;
  receiverName: string;
  receiverEmail: string;
  orderId: string;
  discountGiven: number;
  referrerEarned: number;
  date: string;
}

interface ReferralStats {
  totalReferrals: number;
  totalDiscountGiven: number;
  totalEarned: number;
  history: ReferralHistoryItem[];
}

export default function AdminReferralsPage() {
  const [data, setData] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await ApiService.fetchWithAuth("/coupons/admin/referral-history");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch referral data:", err);
        toast.error("Failed to load referral data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Referrals</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track referral activity and rewards
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700">
          <Settings size={16} />
          Configure
        </button>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <Users size={18} className="text-blue-600" />
            </div>
            <p className="text-sm text-gray-500">Total Referrals</p>
          </div>
          <p className="mt-3 text-3xl font-bold text-gray-900">
            {data?.totalReferrals ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <DollarSign size={18} className="text-red-500" />
            </div>
            <p className="text-sm text-gray-500">Total Discounts Given</p>
          </div>
          <p className="mt-3 text-3xl font-bold text-gray-900">
            £{(data?.totalDiscountGiven ?? 0).toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2">
              <TrendingUp size={18} className="text-green-600" />
            </div>
            <p className="text-sm text-gray-500">Total Rewards Earned</p>
          </div>
          <p className="mt-3 text-3xl font-bold text-gray-900">
            £{(data?.totalEarned ?? 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Referral History</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : !data?.history || data.history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Gift size={32} className="text-gray-400" />
            </div>
            <p className="font-medium text-gray-700">No referral activity yet</p>
            <p className="mt-1 text-sm text-gray-400">
              Referral usage will appear here once customers start sharing codes.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th className="px-5 py-3 font-semibold text-gray-500">#</th>
                  <th className="px-5 py-3 font-semibold text-gray-500">Referrer Name</th>
                  <th className="px-5 py-3 font-semibold text-gray-500">Referrer Email</th>
                  <th className="px-5 py-3 font-semibold text-gray-500">Receiver Name</th>
                  <th className="px-5 py-3 font-semibold text-gray-500">Receiver Email</th>
                  <th className="px-5 py-3 font-semibold text-gray-500">Order ID</th>
                  <th className="px-5 py-3 font-semibold text-gray-500">Discount Given</th>
                  <th className="px-5 py-3 font-semibold text-gray-500">Referrer Earned</th>
                  <th className="px-5 py-3 font-semibold text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.history.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-50 transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 text-gray-400">{index + 1}</td>
                    <td className="px-5 py-4 font-medium text-gray-900">
                      {item.referrerName || "—"}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {item.referrerEmail || "—"}
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-900">
                      {item.receiverName || "—"}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {item.receiverEmail || "—"}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-gray-500">
                      #{item.orderId?.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-5 py-4 text-red-500 font-medium">
                      -£{Number(item.discountGiven || 0).toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        +£{Number(item.referrerEarned || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400">
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