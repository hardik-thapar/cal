import Link from 'next/link';
import { Calendar, Clock, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Scheduling Made Simple
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Book meetings, manage availability, and streamline your calendar
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard/events"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <Calendar className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Easy Scheduling</h3>
            <p className="text-gray-600">
              Create event types and let others book time with you seamlessly
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <Clock className="w-12 h-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Manage Availability</h3>
            <p className="text-gray-600">
              Set your working hours and let the system handle the rest
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <Users className="w-12 h-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Track Bookings</h3>
            <p className="text-gray-600">
              View all upcoming and past bookings in one centralized dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
