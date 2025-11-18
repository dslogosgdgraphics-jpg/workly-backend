import React, { useState, useEffect } from 'react';
import {
  Download,
  Printer,
  Mail,
  Calendar,
  DollarSign,
  User,
  Building,
  FileText,
  CheckCircle,
  X,
  ArrowLeft,
  TrendingUp,
  Minus,
  Plus
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPayroll } from '../../api/payroll';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';

/**
 * PayslipView Page
 * View and download individual payslip
 */
const PayslipView = ({ payrollId = null }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const finalId = payrollId || id;

  useEffect(() => {
    if (finalId) {
      fetchPayslip();
    }
  }, [finalId]);

  const fetchPayslip = async () => {
    setLoading(true);
    try {
      const response = await getPayroll({ id: finalId });
      setPayslip(response.data);
    } catch (err) {
      console.error('Error fetching payslip:', err);
      setError('Failed to fetch payslip');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // This would typically use a library like jsPDF or html2pdf
    window.print();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" text="Loading payslip..." />
      </div>
    );
  }

  if (error || !payslip) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Alert type="error" message={error || 'Payslip not found'} />
          <button
            onClick={() => navigate('/payroll')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Payroll
          </button>
        </div>
      </div>
    );
  }

  const monthYear = new Date(payslip.month + '-01').toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const earnings = [
    { label: 'Basic Salary', amount: payslip.basicSalary },
    { label: 'Overtime', amount: payslip.overtime },
    { label: 'Bonuses', amount: payslip.bonuses }
  ];

  const deductions = [
    { label: 'Deductions', amount: payslip.deductions }
  ];

  const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Action Buttons - Hide on print */}
        <div className="mb-6 flex items-center justify-between print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              <Printer className="w-5 h-5" />
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg font-semibold"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Payslip */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Building className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">EmplyStack</h1>
                    <p className="text-indigo-100 text-sm">Human Resource Management</p>
                  </div>
                </div>
                <p className="text-indigo-100 text-sm mt-2">
                  123 Business Avenue, Suite 100<br />
                  San Francisco, CA 94102<br />
                  contact@emplystack.com
                </p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold mb-2">PAYSLIP</h2>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <p className="text-sm text-indigo-100">Pay Period</p>
                  <p className="text-lg font-bold">{monthYear}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Information */}
          <div className="p-8 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Employee Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Employee Name</p>
                <p className="font-bold text-gray-900">{payslip.employee?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Employee ID</p>
                <p className="font-bold text-gray-900">EMP-{payslip.employee?._id.slice(-6).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Designation</p>
                <p className="font-bold text-gray-900">{payslip.employee?.designation || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="font-bold text-gray-900 text-sm">{payslip.employee?.email || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="p-8 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Attendance Summary</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-sm text-blue-600 mb-1">Total Days</p>
                <p className="text-3xl font-bold text-blue-900">{payslip.totalDays}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <p className="text-sm text-green-600 mb-1">Days Present</p>
                <p className="text-3xl font-bold text-green-900">{payslip.daysPresent}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <p className="text-sm text-purple-600 mb-1">Attendance %</p>
                <p className="text-3xl font-bold text-purple-900">
                  {((payslip.daysPresent / payslip.totalDays) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Salary Breakdown */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Earnings */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-600" />
                  Earnings
                </h3>
                <div className="space-y-3">
                  {earnings.map((item, index) => (
                    item.amount > 0 && (
                      <div key={index} className="flex items-center justify-between py-2">
                        <span className="text-gray-700">{item.label}</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    )
                  ))}
                  <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                    <span className="font-bold text-gray-900">Total Earnings</span>
                    <span className="font-bold text-green-600 text-lg">
                      {formatCurrency(totalEarnings)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Minus className="w-5 h-5 text-red-600" />
                  Deductions
                </h3>
                <div className="space-y-3">
                  {deductions.map((item, index) => (
                    item.amount > 0 && (
                      <div key={index} className="flex items-center justify-between py-2">
                        <span className="text-gray-700">{item.label}</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    )
                  ))}
                  {totalDeductions === 0 && (
                    <p className="text-gray-500 text-sm italic">No deductions</p>
                  )}
                  <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                    <span className="font-bold text-gray-900">Total Deductions</span>
                    <span className="font-bold text-red-600 text-lg">
                      {formatCurrency(totalDeductions)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Net Salary */}
          <div className="p-8 bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Net Salary (Take Home)</p>
                <p className="text-5xl font-bold text-gray-900">
                  {formatCurrency(payslip.totalSalary)}
                </p>
              </div>
              <div className={`px-6 py-3 rounded-xl font-semibold ${
                payslip.status === 'paid'
                  ? 'bg-green-100 text-green-800'
                  : payslip.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <div className="flex items-center gap-2">
                  {payslip.status === 'paid' && <CheckCircle className="w-5 h-5" />}
                  <span className="text-lg">
                    {payslip.status.charAt(0).toUpperCase() + payslip.status.slice(1)}
                  </span>
                </div>
                {payslip.paidDate && (
                  <p className="text-xs mt-1 opacity-75">
                    Paid on {formatDate(payslip.paidDate)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          {payslip.notes && (
            <div className="p-8 bg-blue-50 border-t border-blue-100">
              <h3 className="text-sm font-bold text-blue-900 mb-2">Notes</h3>
              <p className="text-sm text-blue-800">{payslip.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="p-8 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <p>
                Generated on {formatDate(new Date())}
              </p>
              <p>
                This is a computer-generated document. No signature required.
              </p>
            </div>
          </div>
        </div>

        {/* Print Styles */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print\\:hidden {
              display: none !important;
            }
            .bg-white,
            .bg-white * {
              visibility: visible;
            }
            .bg-white {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            @page {
              size: A4;
              margin: 0;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default PayslipView;