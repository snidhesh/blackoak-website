'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';
import TeamGrid from './TeamGrid';

interface TeamMember {
  id: string;
  name: string;
  title: string;
  image: string;
  category: string;
}

interface TeamDirectoryProps {
  partners: TeamMember[];
  realEstateTeam: TeamMember[];
  creativeTeam: TeamMember[];
  creativeTeamTitle: string;
}

function matches(member: TeamMember, needle: string) {
  const hay = `${member.name} ${member.title}`.toLowerCase();
  return needle.split(/\s+/).filter(Boolean).every((term) => hay.includes(term));
}

export default function TeamDirectory({
  partners,
  realEstateTeam,
  creativeTeam,
  creativeTeamTitle,
}: TeamDirectoryProps) {
  const t = useTranslations('pages.about.ourTeam');
  const [query, setQuery] = useState('');

  const needle = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!needle) {
      return { partners, realEstateTeam, creativeTeam };
    }
    return {
      partners: partners.filter((m) => matches(m, needle)),
      realEstateTeam: realEstateTeam.filter((m) => matches(m, needle)),
      creativeTeam: creativeTeam.filter((m) => matches(m, needle)),
    };
  }, [needle, partners, realEstateTeam, creativeTeam]);

  const totalMatches =
    filtered.partners.length + filtered.realEstateTeam.length + filtered.creativeTeam.length;

  return (
    <>
      <section className="pt-4 pb-8">
        <div className="container-wide">
          <div className="max-w-[520px] mx-auto relative">
            <Search
              className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              aria-label={t('searchPlaceholder')}
              className="w-full ps-11 pe-11 py-3 text-sm text-black placeholder:text-gray-400 bg-white border border-gray-200 rounded-full focus:outline-none focus:border-gray-500 transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label={t('searchClearLabel')}
                className="absolute end-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {needle && totalMatches === 0 ? (
        <section className="py-16">
          <div className="container-wide text-center text-gray-500">
            {t('searchNoResults')}
          </div>
        </section>
      ) : (
        <>
          {filtered.partners.length > 0 && (
            <section className="py-10">
              <div className="container-wide">
                <TeamGrid members={filtered.partners} columns={2} centered />
              </div>
            </section>
          )}

          {filtered.realEstateTeam.length > 0 && (
            <section className="py-10">
              <div className="container-wide">
                <TeamGrid members={filtered.realEstateTeam} />
              </div>
            </section>
          )}

          {filtered.creativeTeam.length > 0 && (
            <section className="py-16">
              <div className="container-wide">
                <TeamGrid
                  members={filtered.creativeTeam}
                  title={needle ? undefined : creativeTeamTitle}
                />
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
