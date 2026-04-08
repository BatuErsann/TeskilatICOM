import React from 'react';
import useDocumentMeta from '../hooks/useDocumentMeta';

const Privacy = () => {
  useDocumentMeta({
    title: 'Privacy Policy | Teskilat ICOM',
    description: 'Clarification Text on Personal Data of Employee Candidates',
    canonicalPath: '/privacy'
  });

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="glass-panel p-8 md:p-12 rounded-xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-display font-bold mb-4 text-white">
              CLARIFICATION TEXT ON PERSONAL DATA OF EMPLOYEE CANDIDATES
            </h1>
            <div className="w-24 h-1 bg-accent mx-auto mt-4"></div>
          </div>

          <div className="prose prose-invert max-w-none text-gray-300">
            <p>
              As TEŞKİLAT İLETİŞİM HİZMETLERİ A.Ş. (“Our Company” or “TEŞKİLAT”), located at Kozyatağı Mah. Kaya Sultan Sok. A No: 83/1 İç Kapı No:2 Kadıköy, Istanbul, we attach the utmost importance to the protection and processing of your personal data in accordance with the law. In this regard, we will process the personal data belonging to employee candidates (“you”) who apply to TEŞKİLAT in accordance with the Personal Data Protection Law No. 6698 (“the Law”) and the relevant legislation, as described below.
            </p>

            <h3 className="text-xl font-bold text-white mt-8 mb-4">• Personal Data We Process</h3>
            <p>Our Company may process your following personal data during the evaluation process of job applications;</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Name, surname, gender, Turkish Identity Number, marital status, date of birth, nationality, residential address, phone number, e-mail address,</li>
              <li>Names, surnames and phone numbers of your family members,</li>
              <li>Your educational background, seminars attended, certificate information, foreign language skills, IT skills, driving license details, work experience information, military service status,</li>
              <li>Disability status, existing chronic diseases and past medical operations,</li>
              <li>Your membership information in associations and foundations,</li>
              <li>Hobbies, cultural and social activities participated in,</li>
              <li>Your salary received at previous workplace and/or your expected salary information.</li>
            </ul>

            <h3 className="text-xl font-bold text-white mt-8 mb-4">• Our Purposes of Processing your Personal Data</h3>
            <p className="mb-4">
              Our Company, as the data controller, is obliged to process your personal data in accordance with the Law on the Protection of Personal Data and the relevant legislation. Your personal data shall be processed only for specified, explicit and legitimate purposes and in accordance with the law and the principles of good faith. Moreover, our Company shall take care of processing your personal data in a manner that is relevant, limited and proportionate to the purposes for which they are processed, and ensuring that the data processed are accurate and up to date.
            </p>
            <p>
              Our Company processes your personal data for the purposes of evaluating your job applications and conducting recruitment processes, performing interviews, identifying your working and learning styles, and fulfilling its obligations arising from the applicable legislation.
            </p>

            <h3 className="text-xl font-bold text-white mt-8 mb-4">• Method and Legal Ground for Collecting your Personal Data</h3>
            <p className="mb-4">
              Our Company may collect your personal data verbally, and through physical and electronic means such as physical forms, photocopies, e-mail, telephone, and career platforms including Yenibiris.com and LinkedIn.
            </p>
            <p>
              Your personal data are processed and transferred based on the legal grounds set forth in Articles 5 and 6 of the Law, such as being explicitly provided by law, being necessary for the establishment and performance of a contract, fulfillment of legal obligation, establishing, exercising or protecting the Company’s rights, and being necessary for the legitimate interests of the Company.
            </p>

            <h3 className="text-xl font-bold text-white mt-8 mb-4">• Transfer of Your Personal Data and Purposes of Transfer</h3>
            <p>
              Your personal data may be transferred to our domestic and international service providers, suppliers, and shareholders, and to third-party companies upon your explicit consent, within the scope of the purposes mentioned above, based on the legal grounds set forth in Articles 8 and 9 of the Law.
            </p>

            <h3 className="text-xl font-bold text-white mt-8 mb-4">• Retention of Your Personal Data</h3>
            <p>Our Company shall retain your personal data for,</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>The period stipulated in the relevant legislation,</li>
              <li>The period necessary for the purposes for which they are processed, or</li>
              <li>The period required based on the grounds for establishment, exercise or protection of the right of the Company in case of a potential dispute, as specified in Article 5/2(e) of the Law.</li>
            </ul>
            <p>
              In this context, our Company is entitled to retain your personal data primarily for the period prescribed by the legislation for personal data retention; or if no period is specified, for the period necessary for the other purposes mentioned above. Upon the expiration of such periods and in the absence of any legal ground for the Company to further process your personal data, your personal data shall be immediately erased, destructed, or anonymized. For further information, you may refer to our Personal Data Retention and Destruction Policy.
            </p>

            <h3 className="text-xl font-bold text-white mt-8 mb-4">• Your Rights Concerning Your Personal Data</h3>
            <p>You have the following rights regarding your personal data, as a data subject pursuant to Article 11 of the Law:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>To learn whether your personal data are processed or not,</li>
              <li>To demand for information as to if your personal data have been processed,</li>
              <li>To learn the purpose of the processing of personal data and whether these personal data are used in compliance with the purpose,</li>
              <li>To know the third parties to whom your personal data are transferred in country or abroad,</li>
              <li>To request the rectification of your personal data if they are processed incompletely or inaccurately and to request reporting of the operations carried out in this regard to third parties to whom your personal data have been transferred,</li>
              <li>To request the erasure or destruction of your personal data in the event that the reasons for the processing no longer exist, despite being processed in compliance with the provisions of the Law No. 6698 and other relevant laws, and to request reporting of the operations carried out in this regard to third parties to whom your personal data have been transferred,</li>
              <li>To object to the occurrence of a result against you by means of analyzing the data processed solely through automated systems,</li>
              <li>To claim compensation for the damage arising from the unlawful processing of personal data, if any.</li>
            </ul>
            <p>
              You may submit your requests regarding the above-mentioned rights by filling out the Data Subject Application Form available on our website.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
