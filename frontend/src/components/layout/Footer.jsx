import React from 'react';
import { 
  Heart, 
  Mail, 
  Phone, 
  MapPin, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Instagram,
  Github,
  ExternalLink,
  Shield,
  FileText,
  HelpCircle,
  BookOpen,
  Users,
  Building,
  Briefcase,
  TrendingUp
} from 'lucide-react';

/**
 * Footer Component
 * Application footer with navigation, links, and company information
 * 
 * @param {Object} props
 * @param {string} props.variant - Footer variant: 'default' | 'minimal' | 'detailed'
 * @param {boolean} props.showSocial - Show social media links
 * @param {boolean} props.showNewsletter - Show newsletter subscription
 * @param {Object} props.companyInfo - Company information override
 */
const Footer = ({ 
  variant = 'default',
  showSocial = true,
  showNewsletter = false,
  companyInfo = null
}) => {
  const currentYear = new Date().getFullYear();

  const defaultCompanyInfo = {
    name: 'EmplyStack',
    tagline: 'Modern HR & Payroll Management',
    description: 'Streamline your workforce management with our comprehensive employee management, attendance tracking, and payroll solution.',
    email: 'hello@emplystack.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business Ave, Suite 100, San Francisco, CA 94102'
  };

  const company = companyInfo || defaultCompanyInfo;

  const productLinks = [
    { label: 'Employee Management', href: '/features/employees', icon: <Users className="w-4 h-4" /> },
    { label: 'Time & Attendance', href: '/features/attendance', icon: <Briefcase className="w-4 h-4" /> },
    { label: 'Payroll', href: '/features/payroll', icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Performance', href: '/features/performance', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  const companyLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ];

  const supportLinks = [
    { label: 'Help Center', href: '/support', icon: <HelpCircle className="w-4 h-4" /> },
    { label: 'Documentation', href: '/docs', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'API Reference', href: '/api-docs', icon: <FileText className="w-4 h-4" /> },
    { label: 'System Status', href: '/status', icon: <Shield className="w-4 h-4" /> },
  ];

  const legalLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Security', href: '/security' },
  ];

  const socialLinks = [
    { name: 'Twitter', icon: <Twitter className="w-5 h-5" />, href: 'https://twitter.com/emplystack', color: 'hover:text-blue-400' },
    { name: 'LinkedIn', icon: <Linkedin className="w-5 h-5" />, href: 'https://linkedin.com/company/emplystack', color: 'hover:text-blue-600' },
    { name: 'Facebook', icon: <Facebook className="w-5 h-5" />, href: 'https://facebook.com/emplystack', color: 'hover:text-blue-500' },
    { name: 'Instagram', icon: <Instagram className="w-5 h-5" />, href: 'https://instagram.com/emplystack', color: 'hover:text-pink-500' },
    { name: 'GitHub', icon: <Github className="w-5 h-5" />, href: 'https://github.com/emplystack', color: 'hover:text-gray-900' },
  ];

  // Minimal Footer Variant
  if (variant === 'minimal') {
    return (
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-600 text-sm">
                © {currentYear} <span className="font-semibold text-gray-900">{company.name}</span>. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-6">
              {legalLinks.slice(0, 2).map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Default & Detailed Footer Variant
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Newsletter Section */}
      {showNewsletter && (
        <div className="border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
                <p className="text-gray-400">Get the latest updates, tips, and insights delivered to your inbox.</p>
              </div>
              <form className="flex gap-2 w-full md:w-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 md:w-64 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-500"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{company.name}</h2>
                <p className="text-sm text-gray-400">{company.tagline}</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              {company.description}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a 
                href={`mailto:${company.email}`}
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
              >
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-sm">{company.email}</span>
              </a>
              
              <a 
                href={`tel:${company.phone}`}
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
              >
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-sm">{company.phone}</span>
              </a>
              
              <div className="flex items-start gap-3 text-gray-400">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-sm">{company.address}</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Product</h3>
            <ul className="space-y-3">
              {productLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                  >
                    {link.icon && (
                      <span className="text-gray-500 group-hover:text-indigo-500 transition-colors">
                        {link.icon}
                      </span>
                    )}
                    <span className="text-sm">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                  >
                    {link.icon && (
                      <span className="text-gray-500 group-hover:text-indigo-500 transition-colors">
                        {link.icon}
                      </span>
                    )}
                    <span className="text-sm">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>© {currentYear} {company.name}.</span>
              <span className="hidden md:inline">Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse hidden md:inline" />
              <span className="hidden md:inline">All rights reserved.</span>
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-6">
              {legalLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Social Links */}
            {showSocial && (
              <div className="flex items-center gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 transition-all hover:scale-110 ${social.color}`}
                    aria-label={social.name}
                    title={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trust Badges (Optional - for detailed variant) */}
      {variant === 'detailed' && (
        <div className="border-t border-gray-800 bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-wrap items-center justify-center gap-8">
              <div className="flex items-center gap-2 text-gray-400">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="text-sm">SSL Secured</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Shield className="w-5 h-5 text-blue-500" />
                <span className="text-sm">GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Shield className="w-5 h-5 text-purple-500" />
                <span className="text-sm">SOC 2 Certified</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Shield className="w-5 h-5 text-indigo-500" />
                <span className="text-sm">99.9% Uptime</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

/**
 * SimpleFooter Component
 * Ultra-minimal footer for authentication pages
 */
export const SimpleFooter = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-6 text-center">
      <p className="text-sm text-gray-600">
        © {currentYear} EmplyStack. All rights reserved.
      </p>
    </footer>
  );
};

/**
 * DashboardFooter Component
 * Compact footer for dashboard/internal pages
 */
export const DashboardFooter = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-4 text-gray-600">
            <span>© {currentYear} EmplyStack</span>
            <span className="hidden sm:inline">•</span>
            <a href="/terms" className="hover:text-indigo-600 transition-colors">
              Terms
            </a>
            <span>•</span>
            <a href="/privacy" className="hover:text-indigo-600 transition-colors">
              Privacy
            </a>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <span>Version 2.0.0</span>
            <span>•</span>
            <a 
              href="/docs" 
              className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Documentation</span>
            </a>
            <span>•</span>
            <a 
              href="/support" 
              className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Support</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;