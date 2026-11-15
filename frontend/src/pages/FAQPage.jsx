import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { updatePageMeta } from '../utils/seo';

export default function FAQPage() {
  const { faqs } = useStore();
  const [openId, setOpenId] = useState(() => faqs?.[0]?._id || faqs?.[0]?.question || null);

  useEffect(() => {
    updatePageMeta({
      title: 'Frequently Asked Questions — Materials, Care & Visits | AARANYA',
      description:
        'Answers about AARANYA BIS 916 hallmarking, Kundan & Polki care, showroom visits, bespoke customisation, and exchange policies.',
    });
  }, []);

  useEffect(() => {
    if (!openId && faqs?.length > 0) {
      setOpenId(faqs[0]._id || faqs[0].question);
    }
  }, [faqs]);

  const groupedFaqs = useMemo(() => {
    if (!Array.isArray(faqs) || faqs.length === 0) return [];
    const groups = new Map();
    faqs.forEach((faq) => {
      const cat = faq.category || 'General';
      if (!groups.has(cat)) {
        groups.set(cat, []);
      }
      groups.get(cat).push(faq);
    });
    return Array.from(groups.entries()).map(([category, items]) => ({
      category,
      items,
    }));
  }, [faqs]);

  const toggleFaq = (key) => {
    setOpenId((prev) => (prev === key ? null : key));
  };

  return (
    <div className="pb-12">
      <section className="bg-[#F2E9DC] border-b border-[#E6DBC9] py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3">
          <p className="text-xs text-[#8C6239] font-medium">Client Guidance</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#34241D]">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-[#695B4E] max-w-2xl mx-auto">
            Clear answers regarding BIS 916 hallmarking, showroom pricing, care of heritage Kundan and Polki jewellery, and private appointments.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {groupedFaqs.length > 0 ? (
          groupedFaqs.map((group) => (
            <div key={group.category} className="space-y-3">
              <h2 className="font-serif text-2xl font-semibold text-[#34241D] border-b border-[#E6DBC9] pb-2">
                {group.category}
              </h2>

              <div className="divide-y divide-[#E6DBC9] border border-[#E6DBC9] rounded-xl bg-[#FBF7F0] overflow-hidden">
                {group.items.map((faq, idx) => {
                  const itemKey = faq._id || `${group.category}-${idx}`;
                  const panelId = `faq-panel-${String(itemKey).replace(/[^a-zA-Z0-9_-]/g, '-')}`;
                  const isOpen = openId === itemKey;

                  return (
                    <div key={itemKey} className="transition-colors">
                      <h3>
                        <button
                          type="button"
                          onClick={() => toggleFaq(itemKey)}
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          className={`w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-[#F2E9DC]/60 transition-colors ${
                            isOpen ? 'bg-[#F2E9DC]/40' : ''
                          }`}
                        >
                          <span className="font-serif text-xl font-medium text-[#34241D] leading-snug">
                            {faq.question}
                          </span>
                          <ChevronDown
                            className={`w-5 h-5 text-[#8C6239] shrink-0 transition-transform duration-200 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      </h3>

                      {isOpen && (
                        <div
                          id={panelId}
                          role="region"
                          className="px-5 pb-5 pt-1 text-sm text-[#695B4E] leading-relaxed bg-[#FAF8F4]"
                        >
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-[#FBF7F0] border border-[#E6DBC9] rounded-xl p-10 text-center space-y-3">
            <h2 className="font-serif text-2xl text-[#34241D]">
              No FAQ Entries Available
            </h2>
            <p className="text-sm text-[#695B4E]">
              Have a question about a specific piece or showroom visit? Reach out to our concierge directly.
            </p>
            <Link
              to="/contact"
              className="inline-block px-5 py-2.5 rounded-lg bg-[#34241D] text-[#FAF8F4] text-xs font-medium"
            >
              Contact Showroom
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
