'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { CheckCircle, Calendar, Clock, User, Mail } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">
            Your meeting has been successfully scheduled.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {date && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">DATE</p>
                <p className="text-gray-900 font-semibold">{formatDate(date)}</p>
              </div>
            </div>
          )}
          
          {time && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">TIME</p>
                <p className="text-gray-900 font-semibold">{time}</p>
              </div>
            </div>
          )}

          {name && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <User className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">NAME</p>
                <p className="text-gray-900 font-semibold">{name}</p>
              </div>
            </div>
          )}

          {email && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">EMAIL</p>
                <p className="text-gray-900 font-semibold">{email}</p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-6 space-y-3">
          <Link
            href={`/book/${slug}`}
            className="block w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition text-center"
          >
            Book Another Time
          </Link>
          <Link
            href="/"
            className="block w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition text-center"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}