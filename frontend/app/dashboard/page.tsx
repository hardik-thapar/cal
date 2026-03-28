'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Activity,
  BarChart3,
  PieChart,
  Filter,
  Search,
  Bell,
  Settings,
  Plus,
  MoreVertical,
  ChevronDown,
  Download,
  Mail,
  Phone,
  Video,
  MapPin,
  Star,
  ArrowUp,
  ArrowDown,
  User,
  CreditCard,
  Target,
  Zap,
  Loader
} from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Spinner } from '@/components/ui'
import { useTheme } from '@/contexts/ThemeContext'

export default function Dashboard() {
  const { isDarkMode } = useTheme()
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState(3)
  const [isLoading, setIsLoading] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const stats = [
    {
      id: 'meetings',
      title: "Total Meetings",
      value: "2,847",
      change: "+12.5%",
      trend: "up",
      icon: Calendar,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10"
    },
    {
      id: 'users',
      title: "Active Users",
      value: "1,429",
      change: "+8.2%",
      trend: "up", 
      icon: Users,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10"
    },
    {
      id: 'revenue',
      title: "Revenue",
      value: "$48,291",
      change: "+23.1%",
      trend: "up",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10"
    },
    {
      id: 'duration',
      title: "Avg. Duration",
      value: "45m",
      change: "-5.3%",
      trend: "down",
      icon: Clock,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-500/10"
    }
  ]

  const upcomingMeetings = [
    {
      id: 1,
      title: "Product Strategy Review",
      time: "9:00 AM - 10:00 AM",
      attendees: ["Sarah Chen", "Mike Johnson", "Lisa Wang"],
      type: "video",
      status: "confirmed"
    },
    {
      id: 2,
      title: "Client Onboarding Call",
      time: "11:00 AM - 11:30 AM", 
      attendees: ["John Davis", "Emma Wilson"],
      type: "phone",
      status: "confirmed"
    },
    {
      id: 3,
      title: "Design Team Standup",
      time: "2:00 PM - 2:30 PM",
      attendees: ["Alex Turner", "Sophie Brown", "Ryan Lee"],
      type: "in-person",
      status: "tentative"
    },
    {
      id: 4,
      title: "Sales Pipeline Review",
      time: "4:00 PM - 5:00 PM",
      attendees: ["David Kim", "Rachel Green"],
      type: "video",
      status: "confirmed"
    }
  ]

  const recentActivity = [
    {
      id: 1,
      user: "Sarah Chen",
      action: "scheduled a meeting",
      target: "Q4 Planning Session",
      time: "2 minutes ago",
      avatar: "SC"
    },
    {
      id: 2,
      user: "Mike Johnson", 
      action: "updated availability",
      target: "Tomorrow 2-4 PM",
      time: "15 minutes ago",
      avatar: "MJ"
    },
    {
      id: 3,
      user: "Lisa Wang",
      action: "cancelled meeting",
      target: "Weekly Sync",
      time: "1 hour ago",
      avatar: "LW"
    },
    {
      id: 4,
      user: "John Davis",
      action: "joined team",
      target: "Engineering",
      time: "3 hours ago",
      avatar: "JD"
    }
  ]

  const performanceData = [
    { day: "Mon", meetings: 24, users: 142 },
    { day: "Tue", meetings: 32, users: 168 },
    { day: "Wed", meetings: 28, users: 155 },
    { day: "Thu", meetings: 35, users: 189 },
    { day: "Fri", meetings: 30, users: 171 },
    { day: "Sat", meetings: 12, users: 89 },
    { day: "Sun", meetings: 8, users: 67 }
  ]

  const topPerformers = [
    { name: "Sarah Chen", meetings: 47, rating: 4.9, avatar: "SC" },
    { name: "Mike Johnson", meetings: 42, rating: 4.8, avatar: "MJ" },
    { name: "Lisa Wang", meetings: 38, rating: 4.7, avatar: "LW" },
    { name: "David Kim", meetings: 35, rating: 4.6, avatar: "DK" }
  ]

  const handleRefresh = async () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${isDarkMode ? 'bg-gray-900/80 backdrop-blur-lg border-gray-800' : 'bg-white/80 backdrop-blur-lg border-gray-200'} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">SchedulePro</span>
              </div>
              
              <div className="hidden md:flex items-center space-x-1">
                <button className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium">
                  Dashboard
                </button>
                <button className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium">
                  Calendar
                </button>
                <button className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium">
                  Teams
                </button>
                <button className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium">
                  Analytics
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 pr-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64`}
                />
              </div>
              
              <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
              
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                JD
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
            <p className="text-gray-400">Welcome back! Here's what's happening with your scheduling.</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            
            <Button onClick={handleRefresh} loading={isLoading} className="flex items-center">
              {isLoading ? 'Refreshing...' : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  New Meeting
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card
              key={stat.id}
              className={`transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer ${
                hoveredCard === stat.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onMouseEnter={() => setHoveredCard(stat.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                  </div>
                  <div className={`flex items-center text-sm ${
                    stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stat.trend === 'up' ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                    {stat.change}
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.title}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Performance Chart */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Performance Overview</CardTitle>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-7 gap-4">
                    {performanceData.map((day, index) => (
                      <div key={index} className="text-center">
                        <div className="text-xs text-gray-400 mb-2">{day.day}</div>
                        <div className="relative h-32 flex items-end justify-center">
                          <div className="w-full flex flex-col items-center space-y-1">
                            <div 
                              className="w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t transition-all duration-300 hover:opacity-80"
                              style={{ height: `${(day.meetings / 35) * 100}%` }}
                            ></div>
                            <div 
                              className="w-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-t transition-all duration-300 hover:opacity-80"
                              style={{ height: `${(day.users / 189) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{day.meetings}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-center space-x-6 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded mr-2"></div>
                      <span className="text-gray-400">Meetings</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded mr-2"></div>
                      <span className="text-gray-400">Active Users</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Meetings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Upcoming Meetings</CardTitle>
                <button className="text-sm text-blue-500 hover:text-blue-400 transition-colors">
                  View All
                </button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingMeetings.map((meeting) => (
                    <div 
                      key={meeting.id} 
                      className={`p-4 rounded-lg border transition-all duration-300 hover:shadow-md cursor-pointer ${
                        isDarkMode ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{meeting.title}</h3>
                          <div className="flex items-center text-sm text-gray-400 mb-2">
                            <Clock className="w-4 h-4 mr-1" />
                            {meeting.time}
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex -space-x-2">
                              {meeting.attendees.slice(0, 3).map((attendee, index) => (
                                <div key={index} className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full border-2 border-gray-900 flex items-center justify-center text-white text-xs font-semibold">
                                  {attendee.split(' ').map(n => n[0]).join('')}
                                </div>
                              ))}
                              {meeting.attendees.length > 3 && (
                                <div className="w-6 h-6 bg-gray-700 rounded-full border-2 border-gray-900 flex items-center justify-center text-white text-xs">
                                  +{meeting.attendees.length - 3}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center text-sm">
                              {meeting.type === 'video' && <Video className="w-4 h-4 mr-1 text-blue-500" />}
                              {meeting.type === 'phone' && <Phone className="w-4 h-4 mr-1 text-green-500" />}
                              {meeting.type === 'in-person' && <MapPin className="w-4 h-4 mr-1 text-orange-500" />}
                            </div>
                            
                            <Badge variant={meeting.status === 'confirmed' ? 'success' : 'warning'}>
                              {meeting.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Top Performers */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Top Performers</CardTitle>
                <Target className="w-5 h-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((performer, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {performer.avatar}
                          </div>
                          {index === 0 && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                              <Star className="w-2 h-2 text-white fill-current" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{performer.name}</div>
                          <div className="text-xs text-gray-400">{performer.meetings} meetings</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center text-sm">
                          <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                          {performer.rating}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Recent Activity</CardTitle>
                <Activity className="w-5 h-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                        {activity.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm">
                          <span className="font-semibold">{activity.user}</span>
                          <span className="text-gray-400"> {activity.action} </span>
                          <span className="font-medium">{activity.target}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Quick Actions</CardTitle>
                <Zap className="w-5 h-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="p-3 h-auto flex-col">
                    <Calendar className="w-4 h-4 mx-auto mb-1" />
                    Schedule
                  </Button>
                  <Button variant="outline" className="p-3 h-auto flex-col">
                    <Users className="w-4 h-4 mx-auto mb-1" />
                    Invite
                  </Button>
                  <Button variant="outline" className="p-3 h-auto flex-col">
                    <BarChart3 className="w-4 h-4 mx-auto mb-1" />
                    Reports
                  </Button>
                  <Button variant="outline" className="p-3 h-auto flex-col">
                    <Settings className="w-4 h-4 mx-auto mb-1" />
                    Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
