import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Upload,
  Save,
  X,
  ArrowLeft,
  Loader2,
  DollarSign,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { createExpenseWithReceipt, getExpenseCategories } from '../../api/expenses';
import Alert from '../../components/common/Alert';
import { useNavigate } from 'react-router-dom';

/**
 * SubmitExpense Page
 * Submit new expense claim
 */
const SubmitExpense = () => {
  const navigate = useNavigate();

  // State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    merchantName: '',
    notes: ''
  });

  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getExpenseCategories();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    // File size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Allowed file types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/gif',
      'application/pdf'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Only images (JPG, PNG, GIF) and PDF files are allowed');
      return;
    }

    setReceiptFile(file);
    setError('');

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview('');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const removeReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.description.trim()) {
      setError('Please enter a description');
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!formData.category) {
      setError('Please select a category');
      return;
    }

    if (!formData.date) {
      setError('Please select a date');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await createExpenseWithReceipt(formData, receiptFile);
      setSuccess('Expense submitted successfully!');

      // Reset form
      setFormData({
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        merchantName: '',
        notes: ''
      });
      setReceiptFile(null);
      setReceiptPreview('');

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/expenses');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit expense');
    } finally {
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes) => {
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'credit-card', label: 'Credit Card' },
    { value: 'debit-card', label: 'Debit Card' },
    { value: 'bank-transfer', label: 'Bank Transfer' },
    { value: 'other', label: 'Other' }
  ];

  // Default categories if none loaded
  const defaultCategories = [
    { name: 'Travel', _id: 'travel' },
    { name: 'Meals', _id: 'meals' },
    { name: 'Office Supplies', _id: 'office' },
    { name: 'Equipment', _id: 'equipment' },
    { name: 'Training', _id: 'training' },
    { name: 'Other', _id: 'other' }
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/expenses')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Expenses
          </button>

          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
              <Receipt className="w-7 h-7 text-white" />
            </div>
            Submit Expense
          </h1>
          <p className="text-gray-600 mt-2">Submit a new expense claim for reimbursement</p>
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

        <form onSubmit={handleSubmit}>
          {/* Receipt Upload */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-600" />
              Upload Receipt
            </h2>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                dragActive
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
              }`}
            >
              {receiptFile ? (
                <div className="space-y-4">
                  {receiptPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={receiptPreview}
                        alt="Receipt preview"
                        className="max-h-64 rounded-lg shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={removeReceipt}
                        className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                        <FileText className="w-8 h-8 text-emerald-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">{receiptFile.name}</p>
                        <p className="text-sm text-gray-600">{formatFileSize(receiptFile.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={removeReceipt}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto">
                    <ImageIcon className="w-10 h-10 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      Drop your receipt here, or click to browse
                    </p>
                    <p className="text-sm text-gray-600">
                      Supports: JPG, PNG, GIF, PDF (Max 5MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    id="receipt-upload"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/jpeg,image/png,image/jpg,image/gif,application/pdf"
                  />
                  <label
                    htmlFor="receipt-upload"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg cursor-pointer"
                  >
                    <Upload className="w-5 h-5" />
                    Choose File
                  </label>
                </div>
              )}
            </div>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Receipt Guidelines</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Upload a clear photo or scan of your receipt</li>
                    <li>• Make sure all details are visible and readable</li>
                    <li>• Receipt must show date, amount, and merchant name</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Expense Details */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Expense Details
            </h2>

            <div className="space-y-6">
              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g., Lunch with client, Office supplies"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select category</option>
                    {displayCategories.map(cat => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  >
                    {paymentMethods.map(method => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Merchant Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Merchant/Vendor Name
                  </label>
                  <input
                    type="text"
                    name="merchantName"
                    value={formData.merchantName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., Starbucks, Amazon, Office Depot"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  placeholder="Any additional information about this expense..."
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Expense Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Amount:</span>
                <span className="text-2xl font-bold text-emerald-600">
                  ${formData.amount || '0.00'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Category:</span>
                <span className="font-semibold text-gray-900">{formData.category || 'Not selected'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold text-gray-900">
                  {formData.date ? new Date(formData.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Not selected'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Receipt:</span>
                <span className="font-semibold text-gray-900">
                  {receiptFile ? (
                    <span className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle className="w-4 h-4" />
                      Attached
                    </span>
                  ) : (
                    <span className="text-gray-500">Not attached</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate('/expenses')}
              disabled={submitting}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Submit Expense</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitExpense;