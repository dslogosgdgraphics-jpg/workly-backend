import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Eye,
  Search,
  Filter,
  Calendar,
  User,
  FolderOpen,
  File,
  Image as ImageIcon,
  FileSpreadsheet,
  FileCode,
  AlertCircle,
  CheckCircle,
  Plus,
  X,
  MoreVertical
} from 'lucide-react';
import { getDocuments, deleteDocument, downloadDocument } from '../../api/documents';
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';
import { useNavigate } from 'react-router-dom';

/**
 * DocumentList Page
 * Manage and view company documents
 */
const DocumentList = () => {
  const navigate = useNavigate();
  
  // State
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, categoryFilter, typeFilter]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await getDocuments();
      setDocuments(response.data || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = [...documents];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.uploadedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(doc => doc.category === categoryFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(doc => {
        const ext = doc.fileName?.split('.').pop()?.toLowerCase();
        return ext === typeFilter;
      });
    }

    setFilteredDocuments(filtered);
  };

  const handleDelete = async (documentId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await deleteDocument(documentId);
      setSuccess('Document deleted successfully!');
      fetchDocuments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete document');
    }
  };

  const handleDownload = async (document) => {
    try {
      await downloadDocument(document._id);
      setSuccess(`Downloading ${document.title}...`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to download document');
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    const iconMap = {
      pdf: <FileText className="w-8 h-8" />,
      doc: <FileText className="w-8 h-8" />,
      docx: <FileText className="w-8 h-8" />,
      xls: <FileSpreadsheet className="w-8 h-8" />,
      xlsx: <FileSpreadsheet className="w-8 h-8" />,
      csv: <FileSpreadsheet className="w-8 h-8" />,
      jpg: <ImageIcon className="w-8 h-8" />,
      jpeg: <ImageIcon className="w-8 h-8" />,
      png: <ImageIcon className="w-8 h-8" />,
      gif: <ImageIcon className="w-8 h-8" />,
      txt: <File className="w-8 h-8" />,
      json: <FileCode className="w-8 h-8" />,
      xml: <FileCode className="w-8 h-8" />
    };
    return iconMap[ext] || <File className="w-8 h-8" />;
  };

  const getFileColor = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    const colorMap = {
      pdf: 'from-red-500 to-red-600',
      doc: 'from-blue-500 to-blue-600',
      docx: 'from-blue-500 to-blue-600',
      xls: 'from-green-500 to-green-600',
      xlsx: 'from-green-500 to-green-600',
      csv: 'from-green-500 to-green-600',
      jpg: 'from-purple-500 to-purple-600',
      jpeg: 'from-purple-500 to-purple-600',
      png: 'from-purple-500 to-purple-600',
      gif: 'from-purple-500 to-purple-600',
      txt: 'from-gray-500 to-gray-600',
      json: 'from-yellow-500 to-yellow-600',
      xml: 'from-orange-500 to-orange-600'
    };
    return colorMap[ext] || 'from-indigo-500 to-indigo-600';
  };

  const getCategoryBadge = (category) => {
    const badges = {
      policy: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Policy' },
      contract: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Contract' },
      report: { bg: 'bg-green-100', text: 'text-green-800', label: 'Report' },
      certificate: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Certificate' },
      other: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Other' }
    };
    const badge = badges[category] || badges.other;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate statistics
  const stats = {
    total: documents.length,
    policies: documents.filter(d => d.category === 'policy').length,
    contracts: documents.filter(d => d.category === 'contract').length,
    reports: documents.filter(d => d.category === 'report').length
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'policy', label: 'Policies' },
    { value: 'contract', label: 'Contracts' },
    { value: 'report', label: 'Reports' },
    { value: 'certificate', label: 'Certificates' },
    { value: 'other', label: 'Other' }
  ];

  const fileTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'pdf', label: 'PDF' },
    { value: 'doc', label: 'Word' },
    { value: 'docx', label: 'Word' },
    { value: 'xls', label: 'Excel' },
    { value: 'xlsx', label: 'Excel' },
    { value: 'jpg', label: 'Images' },
    { value: 'png', label: 'Images' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <FolderOpen className="w-7 h-7 text-white" />
                </div>
                Documents
              </h1>
              <p className="text-gray-600 mt-2">Manage and access company documents</p>
            </div>

            <button
              onClick={() => navigate('/documents/upload')}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Upload Document
            </button>
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
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.total}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Total Documents</h3>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.policies}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Policies</h3>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.contracts}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Contracts</h3>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.reports}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Reports</h3>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="relative">
              <File className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                {fileTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredDocuments.length}</span> of{' '}
              <span className="font-semibold text-gray-900">{documents.length}</span> documents
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Documents Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" text="Loading documents..." />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16">
            <div className="flex flex-col items-center justify-center text-gray-500">
              <FolderOpen className="w-20 h-20 mb-4 text-gray-300" />
              <p className="text-lg font-medium">No documents found</p>
              <p className="text-sm mt-1">
                {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Upload your first document to get started'}
              </p>
              {!searchTerm && categoryFilter === 'all' && typeFilter === 'all' && (
                <button
                  onClick={() => navigate('/documents/upload')}
                  className="mt-6 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Upload Document
                </button>
              )}
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((document) => (
              <DocumentCard
                key={document._id}
                document={document}
                onDelete={() => handleDelete(document._id, document.title)}
                onDownload={() => handleDownload(document)}
                getFileIcon={getFileIcon}
                getFileColor={getFileColor}
                getCategoryBadge={getCategoryBadge}
                formatFileSize={formatFileSize}
                formatDate={formatDate}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredDocuments.map((document) => (
                <DocumentListItem
                  key={document._id}
                  document={document}
                  onDelete={() => handleDelete(document._id, document.title)}
                  onDownload={() => handleDownload(document)}
                  getFileIcon={getFileIcon}
                  getCategoryBadge={getCategoryBadge}
                  formatFileSize={formatFileSize}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * DocumentCard Component
 * Grid view card for document
 */
const DocumentCard = ({ document, onDelete, onDownload, getFileIcon, getFileColor, getCategoryBadge, formatFileSize, formatDate }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* File Icon Header */}
      <div className={`h-32 bg-gradient-to-r ${getFileColor(document.fileName)} flex items-center justify-center relative`}>
        <div className="text-white">
          {getFileIcon(document.fileName)}
        </div>
        <div className="absolute top-3 right-3">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-white" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                  <button
                    onClick={() => {
                      onDownload();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
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
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1">{document.title}</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
          {document.description || 'No description'}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Category</span>
            {getCategoryBadge(document.category)}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Size</span>
            <span className="font-semibold text-gray-900">{formatFileSize(document.fileSize)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Uploaded</span>
            <span className="font-semibold text-gray-900">{formatDate(document.uploadedAt)}</span>
          </div>
        </div>

        {document.uploadedBy && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <User className="w-4 h-4" />
            <span>{document.uploadedBy.name}</span>
          </div>
        )}

        <button
          onClick={onDownload}
          className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>
    </div>
  );
};

/**
 * DocumentListItem Component
 * List view item for document
 */
const DocumentListItem = ({ document, onDelete, onDownload, getFileIcon, getCategoryBadge, formatFileSize, formatDate }) => {
  return (
    <div className="p-5 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center text-blue-600">
            {getFileIcon(document.fileName)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">{document.title}</h3>
            <p className="text-sm text-gray-600 truncate">{document.description || 'No description'}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-xs text-gray-600">Category</p>
            {getCategoryBadge(document.category)}
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600">Size</p>
            <p className="font-semibold text-gray-900">{formatFileSize(document.fileSize)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600">Uploaded</p>
            <p className="font-semibold text-gray-900">{formatDate(document.uploadedAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDownload}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentList;