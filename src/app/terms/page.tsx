import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to TerpTier, a cannabis review and ranking platform operated by Terpmetrix, LLC 
              ("we," "us," or "our"). These Terms of Service ("Terms") govern your use of our website 
              located at TerpTier.com and all related services (collectively, the "Service").
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              By accessing or using TerpTier, you agree to be bound by these Terms and our Privacy Policy. 
              If you do not agree to these Terms, please do not use our Service.
            </p>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Eligibility</h2>
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <p className="text-red-800">
                <strong>Age Requirement:</strong> You must be 21 years of age or older to use TerpTier.
                This requirement reflects applicable U.S. federal and state laws regarding cannabis-related content.
              </p>
            </div>
            <p className="text-gray-700 leading-relaxed">
              By using our Service, you represent and warrant that you meet this age requirement and 
              have the legal capacity to enter into these Terms. We reserve the right to verify your 
              age at any time and may suspend or terminate accounts that do not meet this requirement.
            </p>
          </section>

          {/* Account Registration */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Account Registration</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To use certain features of TerpTier, including voting for cannabis producers, you must 
              create an account. When creating an account, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your account information</li>
              <li>Keep your account credentials secure and confidential</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              You may not create multiple accounts or share your account with others. Each person 
              is limited to one account.
            </p>
          </section>

          {/* Description of Service */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Description of Service</h2>
            <h3 className="text-xl font-medium text-gray-800 mb-3">What TerpTier Provides</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              TerpTier is a community-driven platform that allows users to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Vote for their favorite cannabis producers and brands in eligible U.S. jurisdictions</li>
              <li>View rankings and community preferences</li>
              <li>Access information about cannabis producers</li>
              <li>Participate in weekly voting cycles</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">What TerpTier Is Not</h3>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <ul className="list-disc pl-6 space-y-1 text-yellow-800">
                <li>TerpTier is not a marketplace or e-commerce platform</li>
                <li>We do not sell cannabis products or facilitate transactions</li>
                <li>We do not provide medical or legal advice</li>
                <li>We are not affiliated with any cannabis producers or dispensaries</li>
              </ul>
            </div>
          </section>

          {/* User Conduct */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Conduct</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree to use TerpTier responsibly and in accordance with all applicable laws. 
              You must not:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Create fake accounts or manipulate voting results</li>
              <li>Use automated tools, bots, or scripts to interact with the Service</li>
              <li>Attempt to circumvent age verification or other security measures</li>
              <li>Engage in harassment, threats, or abusive behavior</li>
              <li>Post or transmit any unlawful, harmful, or inappropriate content</li>
              <li>Violate any local, state, or federal laws</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Use the Service for any commercial purpose without our permission</li>
            </ul>
          </section>

          {/* Voting and Content */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Voting and User Content</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">Voting System</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              TerpTier operates on a weekly voting cycle where users can cast "hearts" for their 
              favorite cannabis producers. By participating in voting, you agree that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Your votes reflect your genuine preferences</li>
              <li>You will not attempt to manipulate voting results</li>
              <li>Voting is limited to the designated timeframe and frequency</li>
              <li>We may reset or adjust voting data to maintain system integrity</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">Content Ownership</h3>
            <p className="text-gray-700 leading-relaxed">
              When you submit votes or other content to TerpTier, you grant us a non-exclusive, 
              worldwide, royalty-free license to use, display, and distribute that content in 
              connection with our Service. We may aggregate and analyze voting data to provide 
              rankings and insights to the community.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The TerpTier platform, including its design, features, and underlying technology, 
              is owned by Terpmetrix, LLC and is protected by copyright, trademark, and other 
              intellectual property laws.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You may not copy, modify, distribute, or create derivative works based on our 
              Service without our express written permission. All trademarks, logos, and brand 
              names displayed on TerpTier are the property of their respective owners.
            </p>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Disclaimers</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">Informational Purposes Only</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <p className="text-gray-700">
                <strong>All content on TerpTier is provided for informational purposes only.</strong> 
                Our rankings, reviews, and producer information do not constitute medical advice, 
                legal advice, or professional recommendations.
              </p>
            </div>

            <h3 className="text-xl font-medium text-gray-800 mb-3">No Warranties</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              TerpTier is provided "as is" and "as available" without warranties of any kind, 
              either express or implied. We do not warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>The Service will be uninterrupted or error-free</li>
              <li>Information on the platform is accurate or complete</li>
              <li>Any defects will be corrected</li>
              <li>The Service meets your specific requirements</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">Cannabis Law Compliance</h3>
            <p className="text-gray-700 leading-relaxed">
              You are responsible for ensuring that your use of TerpTier complies with all 
              applicable cannabis laws in your jurisdiction. Cannabis laws vary by state and 
              locality, and it is your responsibility to understand and follow these laws.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To the fullest extent permitted by law, Terpmetrix, LLC and its officers, directors, 
              employees, and agents shall not be liable for any indirect, incidental, special, 
              consequential, or punitive damages arising out of or relating to your use of TerpTier.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our total liability for any claims arising out of or relating to these Terms or 
              your use of TerpTier shall not exceed $100 or the amount you paid us in the 
              preceding 12 months, whichever is less.
            </p>
          </section>

          {/* Account Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Account Termination</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">By You</h3>
            <p className="text-gray-700 leading-relaxed">
              You may terminate your account at any time by contacting us at{' '}
              <a href="mailto:help@terpmetrix.com" className="text-blue-600 hover:text-blue-800">
                help@terpmetrix.com
              </a>. 
              Upon termination, we will delete your account and associated data as described 
              in our Privacy Policy.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">By Us</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may suspend or terminate your account if you:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Violate these Terms or our Privacy Policy</li>
              <li>Engage in prohibited conduct</li>
              <li>Fail to meet age requirements</li>
              <li>Use the Service in a way that could harm us or other users</li>
              <li>Are inactive for an extended period</li>
            </ul>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law and Disputes</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              These Terms are governed by the laws of the United States and the laws of the state in
              which Terpmetrix, LLC maintains its principal place of business, without regard to
              conflict of law principles. Any disputes arising out of or relating to these Terms or
              your use of TerpTier shall be resolved in the state or federal courts located in that
              jurisdiction.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You agree to submit to the personal jurisdiction of these courts for the purpose of
              litigating any such disputes.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We reserve the right to modify these Terms at any time. When we make changes, 
              we will post the updated Terms on this page and update the "Last Updated" date.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Your continued use of TerpTier after any changes constitute your acceptance of 
              the new Terms. If you do not agree to the modified Terms, you must stop using 
              our Service.
            </p>
          </section>

          {/* Severability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Severability</h2>
            <p className="text-gray-700 leading-relaxed">
              If any provision of these Terms is found to be unenforceable or invalid, that 
              provision shall be limited or eliminated to the minimum extent necessary so that 
              the remaining provisions shall remain in full force and effect.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions about these Terms or need to report a violation, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> <a href="mailto:help@terpmetrix.com" className="text-blue-600 hover:text-blue-800">help@terpmetrix.com</a></p>
                <p><strong>Company:</strong> Terpmetrix, LLC</p>
                <p><strong>Location:</strong> United States</p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            By using TerpTier, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}