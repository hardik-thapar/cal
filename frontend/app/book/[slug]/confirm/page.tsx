'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { CheckCircle, Calendar, Clock, User, Mail, ArrowLeft } from 'lucide-react';

export default function ConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  
  const date = searchParams.get('date');
  const time = searchParams.get('time');
  const name = searchParams.get('name');
  const email = searchParams.get('email');

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[#0f0f10]">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[#2d2d30]">
        <div className="flex items-center gap-4">
          <Link href={`/book/${slug}`}>
            <button className="p-2 hover:bg-[#252527] rounded-lg transition-colors">
              <ArrowLeft size={20} className="text-[#a1a1aa]" />
            </button>
          </Link>
          <h1 className="text-lg font-semibold text-white">Cal.com</h1>
        </div>
        <button className="text-sm text-[#a1a1aa] hover:text-white">
          Need help?
        </button>
      </div>

      {/* Confirmation Content */}
      <div className="max-w-md mx-auto p-6">
        <div className="bg-[#1a1a1b] border border-[#2d2d30] rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h1>
            <p className="text-[#a1a1aa]">
              Your meeting has been successfully scheduled.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {date && (
              <div className="flex items-start gap-3 p-4 bg-[#252527] rounded-xl">
                <Calendar className="w-5 h-5 text-[#3b82f6] mt-0.5" />
                <div>
                  <p className="text-xs text-[#a1a1aa] font-medium mb-1">DATE</p>
                  <p className="text-white font-semibold">{formatDate(date)}</p>
                </div>
              </div>
            )}
            
            {time && (
              <div className="flex items-start gap-3 p-4 bg-[#252527] rounded-xl">
                <Clock className="w-5 h-5 text-[#3b82f6] mt-0.5" />
                <div>
                  <p className="text-xs text-[#a1a1aa] font-medium mb-1">TIME</p>
                  <p className="text-white font-semibold">{time}</p>
                </div>
              </div>
            )}

            {name && (
              <div className="flex items-start gap-3 p-4 bg-[#252527] rounded-xl">
                <User className="w-5 h-5 text-[#3b82f6] mt-0.5" />
                <div>
                  <p className="text-xs text-[#a1a1aa] font-medium mb-1">NAME</p>
                  <p className="text-white font-semibold">{name}</p>
                </div>
              </div>
            )}

            {email && (
              <div className="flex items-start gap-3 p-4 bg-[#252527] rounded-xl">
                <Mail className="w-5 h-5 text-[#3b82f6] mt-0.5" />
                <div>
                  <p className="text-xs text-[#a1a1aa] font-medium mb-1">EMAIL</p>
                  <p className="text-white font-semibold">{email}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Link
              href={`/book/${slug}`}
              className="block w-full px-6 py-3 bg-[#3b82f6] text-white rounded-xl font-semibold hover:bg-[#2563eb] transition text-center"
            >
              Book Another Time
            </Link>
            <Link
              href="/"
              className="block w-full px-6 py-3 bg-[#252527] border border-[#2d2d30] text-white rounded-xl font-semibold hover:bg-[#2d2d30] transition text-center"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8">
        <p className="text-sm text-[#71717a]">Cal.com</p>
      </div>
    </div>
  );
}