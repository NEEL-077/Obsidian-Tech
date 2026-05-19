import React, { useState, useEffect } from 'react';
import {
  getEmailAnalytics,
  getCampaigns,
  getSubscribers,
  createCampaign,
  sendCampaign,
  getSegments,
} from '../../api/emailApi';
import {
  Mail,
  Users,
  TrendingUp,
  Eye,
  MousePointer,
  ShoppingCart,
  Plus,
  Send,
  BarChart3,
  Calendar,
  Tag,
  Loader2,
} from 'lucide-react';

const EmailDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, campaignsRes, subscribersRes, segmentsRes] = await Promise.all([
        getEmailAnalytics(),
        getCampaigns(),
        getSubscribers({ limit: 10 }),
        getSegments(),
      ]);

      setAnalytics(analyticsRes.data);
      setCampaigns(campaignsRes.data.campaigns);
      setSubscribers(subscribersRes.data.subscribers);
      setSegments(segmentsRes.data);
    } catch (error) {
      console.error('Failed to fetch email data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async (id) => {
    if (!window.confirm('Are you sure you want to send this campaign?')) return;
    
    try {
      await sendCampaign(id);
      fetchData();
    } catch (error) {
      alert('Failed to send campaign');
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          {trend && (
            <p className={`text-sm mt-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend >= 0 ? '+' : ''}{trend}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Marketing</h1>
          <p className="text-gray-500 mt-1">Manage campaigns, subscribers, and analytics</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Campaign
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Subscribers"
          value={analytics?.subscribers?.find(s => s._id === 'active')?.count || 0}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Emails Sent"
          value={analytics?.campaigns?.totalSent?.toLocaleString() || 0}
          icon={Mail}
          color="bg-purple-500"
        />
        <StatCard
          title="Open Rate"
          value={`${analytics?.campaigns?.openRate || 0}%`}
          icon={Eye}
          trend={5.2}
          color="bg-green-500"
        />
        <StatCard
          title="Click Rate"
          value={`${analytics?.campaigns?.clickRate || 0}%`}
          icon={MousePointer}
          trend={-2.1}
          color="bg-orange-500"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {['overview', 'campaigns', 'subscribers', 'segments', 'analytics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Recent Campaigns */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Recent Campaigns</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {campaigns.slice(0, 5).map((campaign) => (
                <div key={campaign._id} className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{campaign.name}</h3>
                    <p className="text-sm text-gray-500">{campaign.subject}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        {campaign.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      campaign.status === 'sent' ? 'bg-green-100 text-green-700' :
                      campaign.status === 'sending' ? 'bg-blue-100 text-blue-700' :
                      campaign.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {campaign.status}
                    </span>
                    {campaign.status === 'draft' && (
                      <button
                        onClick={() => handleSendCampaign(campaign._id)}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Send className="w-4 h-4" />
                        Send
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white">
              <Mail className="w-8 h-8 mb-4" />
              <h3 className="font-semibold text-lg">Newsletter</h3>
              <p className="text-white/80 text-sm mt-1">Send updates to all subscribers</p>
              <button className="mt-4 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                Create Newsletter
              </button>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white">
              <ShoppingCart className="w-8 h-8 mb-4" />
              <h3 className="font-semibold text-lg">Abandoned Cart</h3>
              <p className="text-white/80 text-sm mt-1">Recover lost sales</p>
              <button className="mt-4 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                View Carts
              </button>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-white">
              <TrendingUp className="w-8 h-8 mb-4" />
              <h3 className="font-semibold text-lg">Automations</h3>
              <p className="text-white/80 text-sm mt-1">Set up email workflows</p>
              <button className="mt-4 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                Configure
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold">All Campaigns</h2>
            <div className="flex gap-2">
              <select className="px-3 py-2 border border-gray-200 rounded-lg">
                <option>All Status</option>
                <option>Draft</option>
                <option>Scheduled</option>
                <option>Sent</option>
              </select>
              <select className="px-3 py-2 border border-gray-200 rounded-lg">
                <option>All Types</option>
                <option>Newsletter</option>
                <option>Promotional</option>
                <option>Transactional</option>
              </select>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {campaigns.map((campaign) => (
              <div key={campaign._id} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{campaign.name}</h3>
                    <p className="text-sm text-gray-500">{campaign.subject}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    campaign.status === 'sent' ? 'bg-green-100 text-green-700' :
                    campaign.status === 'sending' ? 'bg-blue-100 text-blue-700' :
                    campaign.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {campaign.status}
                  </span>
                </div>
                {campaign.analytics && (
                  <div className="flex gap-6 mt-4 text-sm">
                    <span className="text-gray-500">
                      Sent: <strong className="text-gray-900">{campaign.analytics.totalSent}</strong>
                    </span>
                    <span className="text-gray-500">
                      Opened: <strong className="text-gray-900">{campaign.analytics.totalOpened}</strong>
                    </span>
                    <span className="text-gray-500">
                      Clicked: <strong className="text-gray-900">{campaign.analytics.totalClicked}</strong>
                    </span>
                    <span className="text-gray-500">
                      Open Rate: <strong className="text-gray-900">{campaign.analytics.openRate}%</strong>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'subscribers' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold">Newsletter Subscribers</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {subscribers.map((subscriber) => (
              <div key={subscriber._id} className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{subscriber.name || subscriber.email}</h3>
                  <p className="text-sm text-gray-500">{subscriber.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Subscribed on {new Date(subscriber.subscribedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  subscriber.status === 'active' ? 'bg-green-100 text-green-700' :
                  subscriber.status === 'unsubscribed' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {subscriber.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'segments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {segments.map((segment) => (
            <div key={segment._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-lg">{segment.name}</h3>
              <p className="text-gray-500 text-sm mt-1">{segment.description}</p>
              <div className="mt-4">
                <span className="text-2xl font-bold">{segment.users?.length || 0}</span>
                <span className="text-gray-500 text-sm ml-2">users</span>
              </div>
              <button className="mt-4 w-full py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                View Users
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4">Campaign Performance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-gray-500 text-sm">Total Campaigns</p>
                <p className="text-3xl font-bold mt-1">{analytics?.campaigns?.totalCampaigns || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-sm">Total Delivered</p>
                <p className="text-3xl font-bold mt-1">{analytics?.campaigns?.totalDelivered?.toLocaleString() || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-sm">Total Opened</p>
                <p className="text-3xl font-bold mt-1">{analytics?.campaigns?.totalOpened?.toLocaleString() || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-sm">Total Clicked</p>
                <p className="text-3xl font-bold mt-1">{analytics?.campaigns?.totalClicked?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4">Subscriber Growth</h2>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <BarChart3 className="w-12 h-12" />
              <span className="ml-2">Chart visualization coming soon</span>
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <CreateCampaignModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchData();
          }}
          segments={segments}
        />
      )}
    </div>
  );
};

// Create Campaign Modal Component
const CreateCampaignModal = ({ onClose, onSuccess, segments }) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    type: 'newsletter',
    template: 'newsletter',
    content: '',
    segment: 'all',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createCampaign(formData);
      onSuccess();
    } catch (error) {
      alert('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold">Create Campaign</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Campaign Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Summer Sale 2024"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Don't miss our biggest sale of the year!"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newsletter">Newsletter</option>
                <option value="promotional">Promotional</option>
                <option value="transactional">Transactional</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Template</label>
              <select
                value={formData.template}
                onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newsletter">Newsletter</option>
                <option value="promotional">Promotional</option>
                <option value="welcome">Welcome</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Target Segment</label>
            <select
              value={formData.segment}
              onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Users</option>
              <option value="newsletter_subscribers">Newsletter Subscribers</option>
              <option value="active">Active Users</option>
              <option value="vip">VIP Customers</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email content here..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailDashboard;
