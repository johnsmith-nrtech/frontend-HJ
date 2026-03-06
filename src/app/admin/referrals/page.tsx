"use client";

import React, { useEffect, useState } from "react";
import { ApiService } from "@/lib/api-service";
import { toast } from "sonner";
import { Settings, Gift, TrendingUp, Users, DollarSign, X, Save, Search } from "lucide-react";

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

interface ReferralSettings {
  referrerReward: number;
  receiverDiscount: number;
  receiverDiscountType: 'percentage' | 'fixed';
  minOrderAmount: number;
  maxDiscountAmount: number | null;
}

export default function AdminReferralsPage() {
  const [data, setData] = useState<ReferralStats | null>(null);
  const [settings, setSettings] = useState<ReferralSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
    fetchSettings();
  }, []);

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

  const fetchSettings = async () => {
    try {
      const res = await ApiService.fetchWithAuth("/coupons/admin/settings");
      const json = await res.json();
      setSettings(json);
      setDiscountType(json.receiverDiscountType || 'percentage');
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
    const formData = new FormData(e.currentTarget);
    const updatedSettings = {
      referrerReward: Number(formData.get('referrerReward')),
      receiverDiscount: Number(formData.get('receiverDiscount')),
      receiverDiscountType: discountType,
      minOrderAmount: Number(formData.get('minOrderAmount')) || 0,
      maxDiscountAmount: formData.get('maxDiscountAmount') ? Number(formData.get('maxDiscountAmount')) : null,
    };

    try {
      const res = await ApiService.fetchWithAuth("/coupons/admin/settings", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSettings),
      });
      
      if (res.ok) {
        const response = await res.json();
        setSettings(response.settings);
        toast.success("Referral settings updated successfully");
        setIsSettingsOpen(false);
        fetchData();
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (err) {
      toast.error("Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  // Filter data based on search term
  const filteredHistory = data?.history?.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.referrerName?.toLowerCase().includes(searchLower) ||
      item.referrerEmail?.toLowerCase().includes(searchLower) ||
      item.receiverName?.toLowerCase().includes(searchLower) ||
      item.receiverEmail?.toLowerCase().includes(searchLower) ||
      item.orderId?.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Pagination calculations
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHistory = filteredHistory.slice(startIndex, startIndex + itemsPerPage);

  // Handle page change
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Configure Referral Program</h2>
              <button 
                onClick={() => setIsSettingsOpen(false)} 
                className="rounded-lg cursor-pointer p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveSettings}>
              <div className="space-y-5">
                {/* Referrer Reward - Pounds */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Referrer Reward <span className="text-xs text-gray-500">(£)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                    <input
                      type="number"
                      name="referrerReward"
                      defaultValue={settings?.referrerReward || 500}
                      step="0.01"
                      min="0"
                      max="10000"
                      className="w-full rounded-lg border border-gray-300 py-2 pr-3 pl-8 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Amount referrer gets in wallet (in pounds)
                  </p>
                </div>
                

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Receiver Discount
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                      className="rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">£</option>
                    </select>
                    <div className="relative flex-1">
                      {discountType === 'fixed' && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                      )}
                      <input
                        type="number"
                        name="receiverDiscount"
                        defaultValue={settings?.receiverDiscount || 10}
                        step="0.01"
                        min="0"
                        max={discountType === 'percentage' ? 100 : 10000}
                        className={`w-full rounded-lg border border-gray-300 py-2 focus:border-blue-500 focus:outline-none ${discountType === 'fixed' ? 'pl-8 pr-3' : 'px-3 pr-8'}`}
                        required
                      />
                      {discountType === 'percentage' && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {discountType === 'percentage' ? 'Percentage discount for new customer' : 'Fixed £ discount for new customer'}
                  </p>
                </div>

                {/* Optional: Minimum Order Amount */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Minimum Order Amount <span className="text-xs text-gray-500">(optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                    <input
                      type="number"
                      name="minOrderAmount"
                      defaultValue={settings?.minOrderAmount || 0}
                      step="0.01"
                      min="0"
                      className="w-full rounded-lg border border-gray-300 py-2 pr-3 pl-8 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Minimum order amount to apply discount (0 = no minimum)
                  </p>
                </div>

                {/* Optional: Max Discount Amount */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Max Discount Amount <span className="text-xs text-gray-500">(optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                    <input
                      type="number"
                      name="maxDiscountAmount"
                      defaultValue={settings?.maxDiscountAmount || ''}
                      step="0.01"
                      min="0"
                      className="w-full rounded-lg border border-gray-300 py-2 pr-3 pl-8 focus:border-blue-500 focus:outline-none"
                      placeholder="No limit"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Maximum discount amount (leave empty for no limit)
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex flex-1 items-center justify-center cursor-pointer gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Settings
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex-1 rounded-lg cursor-pointer border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Referrals History</h1>
          <p className="mt-2 text-sm text-gray-500">
            Track referral activity and rewards
          </p>
        </div>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-2 cursor-pointer rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
        >
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
          <p className="mt-1 text-xs text-gray-400">
            Referrer gets: £{settings?.referrerReward || 500} each
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
          <p className="mt-1 text-xs text-gray-400">
            Receiver gets: {settings?.receiverDiscount}{settings?.receiverDiscountType === 'fixed' ? '£' : '%'} off
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
          <p className="mt-1 text-xs text-gray-400">
            Paid out to referrers
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or order ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Referral History</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              <p className="text-gray-500">Loading referrals...</p>
            </div>
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
          <>
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
                  {paginatedHistory.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-50 transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-4 text-gray-400">{startIndex + index + 1}</td>
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
                      <td className="px-5 py-4 font-medium text-red-500">
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredHistory.length)} of {filteredHistory.length} results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`rounded-lg px-3 py-1 text-sm transition ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}