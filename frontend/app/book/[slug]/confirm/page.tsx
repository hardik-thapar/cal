'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function ConfirmationPage() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-gray-600 mb-6">
          Your booking has been successfully confirmed. You will receive a confirmation email shortly.
        </p>
        <div className="space-y-3">
          <Link
            href={`/book/${slug}`}
            className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Book Another Time
          </Link>
          <Link
            href="/"
            className="block w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
