import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { contact, socialProfiles } from "@/lib/site";
import { languageAlternates } from "@/lib/locales";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy of atillabarbarossa.com: what data is processed when you visit, use the contact form or message on Instagram, and your rights under GDPR.",
  robots: { index: false, follow: true },
  alternates: languageAlternates("privacy", "EN"),
};

/**
 * English translation of /datenschutz, section by section. The German text
 * in src/app/(de)/datenschutz/page.tsx is binding: change it first, then
 * this file and the Turkish one the same way.
 */
export default function PrivacyEnglish() {
  return (
    <LegalPage title="Privacy Policy" page="privacy" lang="EN">
      <p>
        <em>
          This is a translation of the German privacy policy
          (Datenschutzerklärung). The German version is binding.
        </em>
      </p>

      <h2>1. Controller</h2>
      <p>The controller within the meaning of the General Data Protection Regulation (GDPR) is:</p>
      <p>
        Atilla Akgül
        <br />
        Neuendorfer Straße 54
        <br />
        13585 Berlin, Germany
        <br />
        Phone: <a href={`tel:${contact.phone}`}>{contact.phoneDisplay}</a>
        <br />
        Email: <a href={`mailto:${contact.email}`}>{contact.email}</a>
      </p>
      <p>
        No data protection officer has been appointed, as the legal
        requirements for one are not met.
      </p>

      <h2>2. Overview</h2>
      <p>
        This website deliberately does without tracking: no cookies, no
        analytics tools, no advertising pixels, no embedded third-party
        content. Personal data is processed only where this is technically
        necessary to deliver the site or where you get in touch yourself. I do
        not sell personal data. The connection is encrypted with TLS (HTTPS).
      </p>
      <p>
        If you ask for a partner link on Instagram using a keyword, you receive
        it automatically; the service Manychat also replies to certain
        keywords (both section 9). I answer all other messages myself. Clicks
        on partner links are counted so that commissions can be attributed
        (section 10). Section 12 covers my profiles on Instagram, TikTok and
        YouTube.
      </p>

      <h2>3. Hosting and server log files</h2>
      <p>
        This website is hosted by Vercel Inc., 440 N Barranca Ave #4133,
        Covina, CA 91723, USA. When you open the site, Vercel processes
        technically necessary connection data in server log files: IP address,
        date and time of access, file requested, amount of data transferred,
        referrer, and browser and operating system identifiers. This data is
        not combined with other data. Vercel deletes this website&apos;s logs
        after one day at the latest; to defend against attacks, Vercel may keep
        connection data for longer under its own privacy policy.
      </p>
      <p>
        The legal basis is Art. 6(1)(f) GDPR; the legitimate interest lies in
        operating the website securely and reliably. A data processing
        agreement under Art. 28 GDPR is in place with Vercel. Data is
        transferred to the USA on the basis of the adequacy decision for the
        EU-US Data Privacy Framework (Art. 45 GDPR), under which Vercel is
        certified, and additionally on the basis of the EU standard
        contractual clauses (Art. 46(2)(c) GDPR).
      </p>
      <p>
        Vercel delivers the pages themselves through a worldwide server
        network. Everything processed on the server (contact form, automatic
        replies on Instagram, partner links) runs in a data centre in
        Frankfurt am Main, Germany.
      </p>

      <h2>4. Storage in your browser</h2>
      <p>
        No cookies are set. After your first visit, the site only stores one
        technical entry in your browser&apos;s local storage (
        <code>atilla_preloader_seen</code>) so that the intro is skipped on
        later visits. The entry contains no personal data, is not transmitted
        to me or to third parties, and can be deleted at any time in your
        browser settings. The legal basis is Section 25(2) no. 2 of the German
        Telecommunications Digital Services Data Protection Act (TDDDG), as the
        entry serves solely to provide the page you requested.
      </p>

      <h2>5. No external resources</h2>
      <p>
        Fonts, videos, images and icons are delivered exclusively from my own
        server or from the storage of my host Vercel (section 3). No Google
        Fonts, no CDN scripts, no embedded maps or videos and no external
        image services are loaded. Simply viewing the site therefore does not
        transmit your IP address to any third party other than the host.
      </p>
      <p>
        The films in the &ldquo;Latest films&rdquo; section come from my
        Instagram account. Every three days my server downloads them from
        Instagram and stores copies in the Vercel Blob storage service. Your
        browser loads the preview images through this website and the videos
        from the address public.blob.vercel-storage.com, both at Vercel.
        Instagram or Meta receives no data from you when you watch them.
      </p>
      <p>
        The links to Instagram, TikTok and YouTube are plain links. Only when
        you click one does your browser connect to the provider concerned;
        from then on, that provider&apos;s privacy policy applies.
      </p>

      <h2>6. Contact form</h2>
      <p>
        When you use the contact form, your name, email address and message
        are processed in order to answer your inquiry. The legal basis is Art.
        6(1)(a) GDPR (your consent via the confirmation box) and Art. 6(1)(b)
        GDPR where the inquiry is aimed at concluding a contract. You can
        withdraw your consent at any time with effect for the future; an
        informal message is enough.
      </p>
      <p>
        The message is delivered to my mailbox by the service Resend (Plus
        Five Five, Inc., 2261 Market Street, San Francisco, CA 94114, USA),
        acting as processor. A data processing agreement under Art. 28 GDPR is
        in place. Data is transferred to the USA on the basis of the adequacy
        decision for the EU-US Data Privacy Framework, under which Resend is
        certified, and additionally on the basis of the EU standard
        contractual clauses.
      </p>
      <p>
        To prevent automated mass submissions, the number of submissions per
        IP address is briefly limited in working memory. This information is
        not stored permanently and not analysed.
      </p>

      <h2>7. Contact by email or phone</h2>
      <p>
        If you email or call me, I process the data you provide (such as
        name, email address, phone number and the content of your inquiry)
        solely to deal with your request. The legal basis is Art. 6(1)(b) GDPR
        where the inquiry relates to a contract, and otherwise Art. 6(1)(f)
        GDPR (legitimate interest in answering inquiries).
      </p>

      <h2>8. Contact via WhatsApp</h2>
      <p>
        The site contains links through which you can reach me on WhatsApp.
        Nothing from WhatsApp is loaded on the site itself; only when you tap
        a link does WhatsApp open with a pre-written message, which you can
        change or discard before sending.
      </p>
      <p>
        If you write to me on WhatsApp, the provider WhatsApp Ireland Limited
        (Merrion Road, Dublin 4, D04 X2K5, Ireland), a Meta group company,
        processes your phone number, your profile name and the message; a
        transfer to the USA cannot be ruled out. Meta Platforms, Inc. is
        certified under the EU-US Data Privacy Framework. The legal basis is
        Art. 6(1)(b) GDPR where your inquiry relates to a contract, and
        otherwise Art. 6(1)(f) GDPR. Using WhatsApp is voluntary; the contact
        form, email and phone are equally available.
      </p>

      <h2 id="instagram">9. Automatic replies on Instagram</h2>
      <p>
        Under some posts I name a keyword, such as &ldquo;GOLDCARD&rdquo;. If
        you ask for the offer with this keyword in a comment, a story reply
        or a direct message, you automatically receive a short description
        and, on request, the link to it (section 10); under a comment, a short
        public note about the message also appears. I answer all other
        comments and messages personally. My server only checks them for the
        keyword and does not store them.
      </p>
      <p>
        For such a request, your Instagram ID (a number Instagram assigns for
        my account), your name and username where available, your comment or
        message, the detected language, my reply and the post under which you
        asked are stored. If an account sends an unusually large number of
        messages in a short time, the automatic reply pauses and I receive a
        notice with the account&apos;s name via WhatsApp. The legal basis is
        Art. 6(1)(f) GDPR; the legitimate interest lies in answering requests
        that you trigger yourself with the keyword immediately and only once,
        and in preventing abuse.
      </p>
      <p>Involved are:</p>
      <ul>
        <li>
          Meta Platforms Ireland Limited, Merrion Road, Dublin 4, D04 X2K5,
          Ireland, as operator of Instagram and WhatsApp. Meta&apos;s privacy
          policy applies to processing on Instagram itself; a transfer to the
          USA cannot be ruled out. Meta Platforms, Inc. is certified under the
          EU-US Data Privacy Framework.
        </li>
        <li>
          Supabase, Inc. as processor for the database, with servers in
          Frankfurt am Main. Name, ID, contact details and messages are stored
          there only in encrypted form (AES-256); Supabase does not hold the
          key. Where Supabase accesses the systems from third countries, this
          is based on the EU standard contractual clauses.
        </li>
        <li>Vercel (see section 3), whose servers the messages pass through.</li>
      </ul>
      <p>
        A data processing agreement under Art. 28 GDPR is in place with
        Supabase. If you do not want an automatic reply, write without the
        keyword and I will answer you personally. You can equally reach me via
        the contact form, email or phone.
      </p>
      <p>
        An automated messaging service also replies to certain keywords in
        comments and messages: Manychat, Inc., 8605 Santa Monica Blvd #64372,
        West Hollywood, CA 90069, USA, acting as processor. Manychat receives
        your Instagram ID, name and username, the comment or message, and
        whether you tap buttons or links in the reply. The legal basis is Art.
        6(1)(f) GDPR; the legitimate interest lies in answering requests that
        you trigger yourself with the keyword immediately.
      </p>
      <p>
        A data processing agreement under Art. 28 GDPR is in place with
        Manychat. Data is transferred to the USA on the basis of the adequacy
        decision for the EU-US Data Privacy Framework, under which Manychat is
        certified, and additionally on the basis of the EU standard
        contractual clauses.
      </p>

      <h2>10. Partner links</h2>
      <p>
        On Instagram you receive, on request, links to partner offers such as
        credit cards, tours or flight searches. They are marked as
        advertising. If a contract is concluded through such a link, I receive
        a commission; nothing changes for you.
      </p>
      <p>
        The links first pass through this website (<code>/go/…</code>). A
        random ID is used to count how often and when the link was first
        opened, and to record which request and which post it came from. This
        ID is passed to the partner programme concerned (such as financeAds,
        GetYourGuide or Skyscanner) so that commissions can be attributed to
        the post; the partner programme does not receive your name or
        Instagram ID. The legal basis is Art. 6(1)(f) GDPR; the legitimate
        interest lies in settling commissions. After the redirect, the privacy
        policy of the provider concerned applies, and it may set its own
        cookies.
      </p>

      <h2>11. Buying the e-book (Tentary)</h2>
      <p>
        The Travel Creator Roadmap and its free excerpt are sold and delivered
        through the Tentary platform: Tentary GmbH, Frankenstraße 152, 90461
        Nuremberg, Germany. The links on <code>/roadmap</code> lead directly to
        Tentary&apos;s checkout; this website itself collects no data in the
        process. At checkout you provide your name, email address, billing
        country and payment details; Tentary and the payment providers it
        uses process them to handle the payment and send you the PDF. I
        receive your name, email address and the order details in order to
        perform the contract and meet my tax obligations.
      </p>
      <p>
        The legal basis is Art. 6(1)(b) GDPR (contract) and (c) (retention
        obligations). The same applies to name and email address for the free
        excerpt. You receive marketing emails only if you expressly consent at
        checkout (Art. 6(1)(a) GDPR); you can withdraw this consent at any
        time. Otherwise, Tentary&apos;s privacy policy applies.
      </p>

      <h2 id="social-media">12. My social media profiles</h2>
      <p>
        I show my work on my own profiles on{" "}
        <a href={socialProfiles.instagram} target="_blank" rel="noopener noreferrer">
          Instagram
        </a>
        ,{" "}
        <a href={socialProfiles.tiktok} target="_blank" rel="noopener noreferrer">
          TikTok
        </a>{" "}
        and{" "}
        <a href={socialProfiles.youtube} target="_blank" rel="noopener noreferrer">
          YouTube
        </a>
        . This policy also applies to these profiles. When you visit one of
        them, the provider processes your data under its own terms, including
        for advertising and analytics and regardless of whether you have an
        account there; I have no influence over this. I myself see only what
        you share with me there (comments, mentions, messages) and aggregated
        statistics on the reach of my posts, which do not identify
        individuals. The legal basis is Art. 6(1)(f) GDPR; the legitimate
        interest lies in showing my work and communicating with my audience,
        prospects and clients.
      </p>
      <ul>
        <li>
          <strong>Instagram:</strong> Meta Platforms Ireland Limited, Merrion
          Road, Dublin 4, D04 X2K5, Ireland. Meta and I are joint controllers
          (Art. 26 GDPR) for the statistics (&ldquo;Insights&rdquo;) Meta
          provides to me about my profile. In an{" "}
          <a
            href="https://www.facebook.com/legal/terms/page_controller_addendum"
            target="_blank"
            rel="noopener noreferrer"
          >
            agreement
          </a>
          , Meta has taken on primary responsibility for this, including for
          fulfilling your rights. Meta Platforms, Inc. is certified under the
          EU-US Data Privacy Framework.{" "}
          <a href="https://privacycenter.instagram.com/policy" target="_blank" rel="noopener noreferrer">
            Privacy policy
          </a>
        </li>
        <li>
          <strong>TikTok:</strong> TikTok Technology Limited, 10 Earlsfort
          Terrace, Dublin, D02 T380, Ireland. Where TikTok provides me with
          statistics (TikTok Analytics), we are joint controllers for them;
          TikTok sets out the details in an{" "}
          <a
            href="https://www.tiktok.com/legal/page/global/tiktok-analytics-joint-controller-addendum/en"
            target="_blank"
            rel="noopener noreferrer"
          >
            agreement
          </a>
          . TikTok also transfers data to countries outside the EU for which no
          adequacy decision exists.{" "}
          <a
            href="https://www.tiktok.com/legal/page/eea/privacy-policy/en"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy policy
          </a>
        </li>
        <li>
          <strong>YouTube:</strong> Google Ireland Limited, Gordon House,
          Barrow Street, Dublin 4, Ireland. Google processes the data under its
          own responsibility; Google LLC is certified under the EU-US Data
          Privacy Framework.{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Privacy policy
          </a>
        </li>
      </ul>
      <p>
        You can exercise your rights (section 15) against me and against the
        provider concerned. It works fastest with the provider itself, as only
        the provider has access to its users&apos; data; I forward requests I
        receive to it.
      </p>

      <h2>13. Retention</h2>
      <p>
        Inquiries and the related correspondence are deleted once they have
        been fully dealt with, unless statutory retention obligations apply.
        If a contract is concluded, the retention periods under German
        commercial and tax law apply (usually six to ten years, Section 257
        HGB, Section 147 AO).
      </p>
      <p>
        Stored requests from Instagram (section 9) are deleted automatically
        24 months after the last message, together with the related details.
        The link between a partner link and the request ends with it; only
        the anonymous click count remains.
      </p>
      <p>
        At Manychat, the data remains stored until I stop using the service;
        it is then deleted there. You can request earlier deletion at any time
        (section 15).
      </p>

      <h2>14. Obligation to provide data, no automated decision-making</h2>
      <p>
        You are under no statutory or contractual obligation to provide
        personal data; without it, however, I cannot answer an inquiry. There
        is no automated decision-making, including profiling, within the
        meaning of Art. 22 GDPR. The automatic reply on Instagram sends only
        the link you asked for.
      </p>

      <h2 id="rights">15. Your rights</h2>
      <p>You have the right at any time to</p>
      <ul>
        <li>access to the data processed about you (Art. 15 GDPR),</li>
        <li>rectification of inaccurate data (Art. 16 GDPR),</li>
        <li>erasure (Art. 17 GDPR),</li>
        <li>restriction of processing (Art. 18 GDPR),</li>
        <li>data portability (Art. 20 GDPR),</li>
        <li>withdraw consent you have given, with effect for the future (Art. 7(3) GDPR).</li>
      </ul>
      <p>
        <strong>Right to object (Art. 21 GDPR):</strong> Where processing is
        based on Art. 6(1)(f) GDPR, you may object to it at any time on
        grounds relating to your particular situation. I will then no longer
        process the data unless I can demonstrate compelling legitimate
        grounds that override your interests, or the processing serves the
        establishment, exercise or defence of legal claims.
      </p>
      <p>
        An informal message to{" "}
        <a href={`mailto:${contact.email}`}>{contact.email}</a> is enough to
        exercise your rights. I reply within one month (Art. 12(3) GDPR).
      </p>

      <h2>16. Right to lodge a complaint</h2>
      <p>
        You have the right to lodge a complaint with a data protection
        supervisory authority, in particular in the member state of your
        habitual residence, place of work or place of the alleged infringement
        (Art. 77 GDPR). The authority responsible for me is:
      </p>
      <p>
        Berliner Beauftragte für Datenschutz und Informationsfreiheit (Berlin
        Commissioner for Data Protection and Freedom of Information)
        <br />
        Alt-Moabit 59–61, 10555 Berlin, Germany
        <br />
        <a href="https://www.datenschutz-berlin.de" target="_blank" rel="noopener noreferrer">
          www.datenschutz-berlin.de
        </a>
      </p>

      <h2>17. Date and language versions</h2>
      <p>
        As of October 2026. This policy describes the technical state of this
        website and is updated as soon as the services used change. It is
        available in German, English and Turkish; the German version is
        binding.
      </p>
    </LegalPage>
  );
}
