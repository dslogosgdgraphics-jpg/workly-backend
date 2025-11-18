import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Pin,
  Heart,
  ThumbsUp,
  Smile,
  MessageCircle,
  Edit,
  Trash2,
  X,
  Save,
  Loader2,
  Calendar,
  User,
  Eye,
  AlertCircle,
  CheckCircle,
  Bell,
  Send,
  MoreVertical,
  TrendingUp,
  Users,
  Star
} from 'lucide-react';
import {
  getAnnouncements,
  getActiveAnnouncements,
  getPinnedAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  pinAnnouncement,
  unpinAnnouncement,
  markAsRead,
  addComment,
  deleteComment,
  addReaction,
  removeReaction,
  getUnreadCount
} from '../../api/announcements';
import { getEmployees } from '../../api/employees';
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';
import Tabs from '../../components/common/Tabs';

/**
 * AnnouncementFeed Page
 * Company-wide announcements and updates
 */
const AnnouncementFeed = () => {
  // State
  const [announcements, setAnnouncements] = useState([]);
  const [pinnedAnnouncements, setPinnedAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  // User role (should come from auth context)
  const [userRole] = useState('admin'); // 'admin' or 'employee'

  // Filter state
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    targetAudience: 'all',
    isPinned: false,
    expiryDate: ''
  });

  // Comment state
  const [commentTexts, setCommentTexts] = useState({});
  const [expandedComments, setExpandedComments] = useState({});

  useEffect(() => {
    fetchAnnouncements();
    fetchPinnedAnnouncements();
    fetchUnreadCount();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await getAnnouncements();
      setAnnouncements(response.data || []);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const fetchPinnedAnnouncements = async () => {
    try {
      const response = await getPinnedAnnouncements();
      setPinnedAnnouncements(response.data || []);
    } catch (err) {
      console.error('Error fetching pinned announcements:', err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.data?.count || 0);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      priority: 'normal',
      targetAudience: 'all',
      isPinned: false,
      expiryDate: ''
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await createAnnouncement(formData);
      setSuccess('Announcement created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchAnnouncements();
      fetchPinnedAnnouncements();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create announcement');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await updateAnnouncement(selectedAnnouncement._id, formData);
      setSuccess('Announcement updated successfully!');
      setShowEditModal(false);
      setSelectedAnnouncement(null);
      resetForm();
      fetchAnnouncements();
      fetchPinnedAnnouncements();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update announcement');
    }
  };

  const handleDelete = async (announcementId) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      await deleteAnnouncement(announcementId);
      setSuccess('Announcement deleted successfully!');
      fetchAnnouncements();
      fetchPinnedAnnouncements();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete announcement');
    }
  };

  const handlePin = async (announcementId, isPinned) => {
    try {
      if (isPinned) {
        await unpinAnnouncement(announcementId);
      } else {
        await pinAnnouncement(announcementId);
      }
      fetchAnnouncements();
      fetchPinnedAnnouncements();
    } catch (err) {
      setError('Failed to update pin status');
    }
  };

  const handleMarkAsRead = async (announcementId) => {
    try {
      await markAsRead(announcementId);
      fetchAnnouncements();
      fetchUnreadCount();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleAddComment = async (announcementId) => {
    const commentText = commentTexts[announcementId];
    if (!commentText?.trim()) return;

    try {
      await addComment(announcementId, { text: commentText });
      setCommentTexts(prev => ({ ...prev, [announcementId]: '' }));
      fetchAnnouncements();
    } catch (err) {
      setError('Failed to add comment');
    }
  };

  const handleDeleteComment = async (announcementId, commentId) => {
    try {
      await deleteComment(announcementId, commentId);
      fetchAnnouncements();
    } catch (err) {
      setError('Failed to delete comment');
    }
  };

  const handleReaction = async (announcementId, emoji, hasReacted) => {
    try {
      if (hasReacted) {
        await removeReaction(announcementId, emoji);
      } else {
        await addReaction(announcementId, emoji);
      }
      fetchAnnouncements();
    } catch (err) {
      setError('Failed to add reaction');
    }
  };

  const handleEditClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title || '',
      content: announcement.content || '',
      priority: announcement.priority || 'normal',
      targetAudience: announcement.targetAudience || 'all',
      isPinned: announcement.isPinned || false,
      expiryDate: announcement.expiryDate ? new Date(announcement.expiryDate).toISOString().split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: { bg: 'bg-red-100', text: 'text-red-800', label: 'Urgent' },
      high: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'High' },
      normal: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Normal' },
      low: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Low' }
    };
    const badge = badges[priority] || badges.normal;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (date) => {
    const now = new Date();
    const announcementDate = new Date(date);
    const diffInSeconds = Math.floor((now - announcementDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return announcementDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: announcementDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Filter announcements
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || announcement.priority === priorityFilter;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'unread' && !announcement.read) ||
                      (activeTab === 'pinned' && announcement.isPinned);
    return matchesSearch && matchesPriority && matchesTab;
  });

  // Calculate statistics
  const stats = {
    total: announcements.length,
    unread: unreadCount,
    pinned: pinnedAnnouncements.length,
    urgent: announcements.filter(a => a.priority === 'urgent').length
  };

  const tabs = [
    { id: 'all', label: 'All', count: stats.total, icon: <Megaphone className="w-4 h-4" /> },
    { id: 'unread', label: 'Unread', count: stats.unread, icon: <Bell className="w-4 h-4" /> },
    { id: 'pinned', label: 'Pinned', count: stats.pinned, icon: <Pin className="w-4 h-4" /> }
  ];

  const reactions = [
    { emoji: '👍', label: 'Like' },
    { emoji: '❤️', label: 'Love' },
    { emoji: '🎉', label: 'Celebrate' },
    { emoji: '👏', label: 'Applause' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Megaphone className="w-7 h-7 text-white" />
                </div>
                Announcements
              </h1>
              <p className="text-gray-600 mt-2">Stay updated with company news and updates</p>
            </div>

            {userRole === 'admin' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Announcement
              </button>
            )}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={() => setError('')} />
          </div>
        )}

        {success && (
          <div className="mb-6">
            <Alert type="success" message={success} dismissible onClose={() => setSuccess('')} />
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6 border border-violet-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
                <Megaphone className="w-6 h-6 text-violet-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.total}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Total</h3>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.unread}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Unread</h3>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Pin className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.pinned}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Pinned</h3>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.urgent}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Urgent</h3>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6">
          <div className="border-b border-gray-200">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="underline" />
          </div>

          <div className="p-6 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search announcements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Announcements Feed */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" text="Loading announcements..." />
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16">
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Megaphone className="w-20 h-20 mb-4 text-gray-300" />
              <p className="text-lg font-medium">No announcements found</p>
              <p className="text-sm mt-1">Check back later for updates</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement._id}
                announcement={announcement}
                userRole={userRole}
                onEdit={() => handleEditClick(announcement)}
                onDelete={() => handleDelete(announcement._id)}
                onPin={() => handlePin(announcement._id, announcement.isPinned)}
                onMarkAsRead={() => handleMarkAsRead(announcement._id)}
                onAddComment={() => handleAddComment(announcement._id)}
                onDeleteComment={(commentId) => handleDeleteComment(announcement._id, commentId)}
                onReaction={(emoji, hasReacted) => handleReaction(announcement._id, emoji, hasReacted)}
                commentText={commentTexts[announcement._id] || ''}
                setCommentText={(text) => setCommentTexts(prev => ({ ...prev, [announcement._id]: text }))}
                isCommentsExpanded={expandedComments[announcement._id] || false}
                toggleComments={() => setExpandedComments(prev => ({ ...prev, [announcement._id]: !prev[announcement._id] }))}
                getPriorityBadge={getPriorityBadge}
                formatDate={formatDate}
                reactions={reactions}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <AnnouncementModal
          title="Create Announcement"
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleCreate}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <AnnouncementModal
          title="Edit Announcement"
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleUpdate}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAnnouncement(null);
            resetForm();
          }}
          isEdit
        />
      )}
    </div>
  );
};

/**
 * AnnouncementCard Component
 */
const AnnouncementCard = ({
  announcement,
  userRole,
  onEdit,
  onDelete,
  onPin,
  onMarkAsRead,
  onAddComment,
  onDeleteComment,
  onReaction,
  commentText,
  setCommentText,
  isCommentsExpanded,
  toggleComments,
  getPriorityBadge,
  formatDate,
  reactions
}) => {
  const [showMenu, setShowMenu] = useState(false);

  // Mock current user ID (should come from auth context)
  const currentUserId = 'current-user-id';

  return (
    <div 
      className={`bg-white rounded-xl border-2 overflow-hidden hover:shadow-lg transition-all duration-300 ${
        !announcement.read ? 'border-violet-200 bg-violet-50/30' : 'border-gray-200'
      }`}
      onClick={() => !announcement.read && onMarkAsRead()}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              {announcement.author?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-gray-900">{announcement.title}</h3>
                {announcement.isPinned && (
                  <Pin className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">{announcement.author?.name || 'Admin'}</span>
                <span>•</span>
                <span>{formatDate(announcement.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getPriorityBadge(announcement.priority)}
            {!announcement.read && (
              <span className="w-3 h-3 bg-violet-600 rounded-full" title="Unread" />
            )}
            {userRole === 'admin' && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                      <button
                        onClick={() => {
                          onPin();
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Pin className="w-4 h-4" />
                        {announcement.isPinned ? 'Unpin' : 'Pin'}
                      </button>
                      <button
                        onClick={() => {
                          onEdit();
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          onDelete();
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
        </div>
      </div>

      {/* Reactions */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {reactions.map((reaction) => {
              const reactionCount = announcement.reactions?.filter(r => r.emoji === reaction.emoji).length || 0;
              const hasReacted = announcement.reactions?.some(r => r.emoji === reaction.emoji && r.user === currentUserId);
              
              if (reactionCount === 0 && !hasReacted) return null;

              return (
                <button
                  key={reaction.emoji}
                  onClick={() => onReaction(reaction.emoji, hasReacted)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all ${
                    hasReacted
                      ? 'bg-violet-100 border-2 border-violet-600 text-violet-900'
                      : 'bg-white border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <span>{reaction.emoji}</span>
                  <span className="font-semibold">{reactionCount}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <button
              onClick={toggleComments}
              className="flex items-center gap-1 hover:text-violet-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{announcement.comments?.length || 0} comments</span>
            </button>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{announcement.views || 0} views</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reaction Buttons */}
      <div className="px-6 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          {reactions.map((reaction) => {
            const hasReacted = announcement.reactions?.some(r => r.emoji === reaction.emoji && r.user === currentUserId);
            return (
              <button
                key={reaction.emoji}
                onClick={() => onReaction(reaction.emoji, hasReacted)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  hasReacted
                    ? 'bg-violet-100 text-violet-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={reaction.label}
              >
                <span>{reaction.emoji}</span>
                <span>{reaction.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comments Section */}
      {isCommentsExpanded && (
        <div className="px-6 py-4 bg-gray-50">
          {/* Comment Input */}
          <div className="mb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                U
              </div>
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                />
                <button
                  onClick={onAddComment}
                  disabled={!commentText?.trim()}
                  className="mt-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Comment
                </button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          {announcement.comments && announcement.comments.length > 0 && (
            <div className="space-y-3">
              {announcement.comments.map((comment) => (
                <div key={comment._id} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {comment.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900">{comment.user?.name || 'User'}</span>
                        <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.text}</p>
                    </div>
                    {(userRole === 'admin' || comment.user?._id === currentUserId) && (
                      <button
                        onClick={() => onDeleteComment(comment._id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * AnnouncementModal Component
 */
const AnnouncementModal = ({ title, formData, onInputChange, onSubmit, onClose, isEdit = false }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-violet-50 to-purple-50">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={onInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="Enter announcement title"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={onInputChange}
                rows="6"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                placeholder="Enter announcement content..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={onInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Target Audience
                </label>
                <select
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={onInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="all">All Employees</option>
                  <option value="managers">Managers Only</option>
                  <option value="employees">Employees Only</option>
                </select>
              </div>
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={onInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* Pin */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPinned"
                name="isPinned"
                checked={formData.isPinned}
                onChange={onInputChange}
                className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
              />
              <label htmlFor="isPinned" className="text-sm font-semibold text-gray-700">
                Pin this announcement
              </label>
            </div>
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {isEdit ? 'Update' : 'Create'} Announcement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementFeed;