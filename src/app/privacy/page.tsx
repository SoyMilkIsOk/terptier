import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
          <p className="text-sm text-blue-800">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to TerpTier, a community-driven cannabis review and ranking platform operated by 
              Terpmetrix, LLC ("we," "us," or "our"). We are committed to protecting your privacy and 
              being transparent about how we collect, use, and protect your personal information.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              This Privacy Policy explains how we handle your information when you use our website 
              located at TerpTier.com (the "Service"). By using TerpTier, you consent to the collection 
              and use of information as described in this policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">Personal Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Email Address:</strong> Required for account creation, authentication, and password recovery</li>
              <li><strong>Age Verification:</strong> We verify that you are 21 or older as required by Colorado state law</li>
              <li><strong>Voting Data:</strong> Your weekly "hearts" (votes) for cannabis producers and brands</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">Information We Collect Automatically</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Analytics Data:</strong> Page views, session duration, referral sources, and general usage patterns via Google Analytics or Vercel Analytics</li>
              <li><strong>Location Data:</strong> Approximate location derived from your IP address for aggregate reporting purposes</li>
              <li><strong>Technical Information:</strong> Browser type, device information, and operating system</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">Cookies and Tracking Technologies</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Session Cookies:</strong> Essential for keeping you logged in and maintaining your session</li>
              <li><strong>Analytics Cookies:</strong> Standard Google Analytics cookies (_ga, _gid, etc.) for understanding site usage</li>
            </ul>
            <p className="text-gray-600 text-sm mt-2">
              You can disable cookies in your browser settings, but some functionality may not work properly.
            </p>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Provide and maintain the TerpTier service</li>
              <li>Authenticate your account and enable secure login</li>
              <li>Process and display your votes for cannabis producers</li>
              <li>Send transactional emails (account recovery, important updates)</li>
              <li>Analyze site usage to improve our service</li>
              <li>Ensure compliance with age restrictions and applicable laws</li>
              <li>Respond to your questions and provide customer support</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. How We Share Your Information</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">Service Providers</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We share minimal necessary information with trusted third-party service providers:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Supabase:</strong> Authentication, database storage, and email delivery</li>
              <li><strong>Vercel:</strong> Website hosting and deployment</li>
              <li><strong>Google Analytics:</strong> Anonymous usage analytics</li>
              <li><strong>SendGrid:</strong> Email delivery service (via Supabase)</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">Legal Requirements</h3>
            <p className="text-gray-700 leading-relaxed">
              We may disclose your information if required by law, such as in response to a subpoena, 
              court order, or other legal process.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">What We Don't Do</h3>
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <ul className="list-disc pl-6 space-y-1 text-green-800">
                <li>We do not sell your personal information</li>
                <li>We do not rent your data to marketers or advertisers</li>
                <li>We do not share your information with advertising partners</li>
                <li>We do not process payments or store credit card information</li>
              </ul>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your personal information only as long as necessary to provide our service 
              and fulfill the purposes outlined in this policy. When you delete your account, we 
              will remove your personal information and voting data from our systems, though some 
              information may remain in backups for a limited time.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Privacy Rights</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">All Users</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Access the personal information we have about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your account and associated data</li>
              <li>Withdraw consent for non-essential data processing</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">GDPR Rights (EU Residents)</h3>
            <p className="text-gray-700 leading-relaxed">
              If you are a resident of the European Union, you have additional rights under GDPR, 
              including data portability and the right to object to processing.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">CCPA Rights (California Residents)</h3>
            <p className="text-gray-700 leading-relaxed">
              California residents have the right to request disclosure of personal information 
              categories collected, sources, and business purposes, as well as the right to deletion.
            </p>

            <p className="text-gray-700 leading-relaxed mt-4">
              To exercise any of these rights, please contact us at{' '}
              <a href="mailto:help@terpmetrix.com" className="text-blue-600 hover:text-blue-800">
                help@terpmetrix.com
              </a>
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction. However, 
              no method of transmission over the internet or electronic storage is 100% secure, and 
              we cannot guarantee absolute security.
            </p>
          </section>

          {/* Age Restrictions */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Age Restrictions</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-yellow-800">
                <strong>21+ Only:</strong> TerpTier is intended for adults 21 years of age or older, 
                in compliance with Colorado state law regarding cannabis. We do not knowingly collect 
                personal information from anyone under 21.
              </p>
            </div>
          </section>

          {/* International Users */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Users</h2>
            <p className="text-gray-700 leading-relaxed">
              TerpTier is operated from Boulder, Colorado, USA. If you are accessing our service 
              from outside the United States, please be aware that your information may be transferred 
              to, stored, and processed in the United States where our servers are located.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. When we do, we will post the 
              updated policy on this page and update the "Last Updated" date. We encourage you to 
              review this policy periodically to stay informed about how we protect your information.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> <a href="mailto:help@terpmetrix.com" className="text-blue-600 hover:text-blue-800">help@terpmetrix.com</a></p>
                <p><strong>Company:</strong> Terpmetrix, LLC</p>
                <p><strong>Location:</strong> Boulder, Colorado, USA</p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            This Privacy Policy is effective as of the date listed above and applies to all users of TerpTier.
          </p>
        </div>
      </div>
    </div>
  );
}