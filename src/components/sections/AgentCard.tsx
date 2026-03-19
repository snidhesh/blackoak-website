import Image from 'next/image';
import { Phone, Mail, MessageCircle } from 'lucide-react';
import type { ProjectAgent } from '@/types/project';

interface AgentCardProps {
  agent: ProjectAgent;
}

export default function AgentCard({ agent }: AgentCardProps) {
  return (
    <div className="bg-white border border-gray-200 p-6 flex flex-col sm:flex-row items-center gap-6">
      {/* Profile Image */}
      <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200 shrink-0">
        <Image
          src={agent.profileImage}
          alt={agent.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      {/* Info */}
      <div className="flex-1 text-center sm:text-left">
        <h3 className="text-lg font-semibold text-black">{agent.name}</h3>
        {agent.position && (
          <p className="text-sm text-gray-500 mt-0.5">{agent.position}</p>
        )}
        {agent.brn && (
          <p className="text-xs text-gray-400 mt-1">BRN: {agent.brn}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {agent.phone && (
          <a
            href={`tel:${agent.phone}`}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 text-xs text-gray-600 hover:bg-gray-200 hover:text-black transition-colors"
          >
            <Phone className="w-3.5 h-3.5" /> Call
          </a>
        )}
        {agent.email && (
          <a
            href={`mailto:${agent.email}`}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 text-xs text-gray-600 hover:bg-gray-200 hover:text-black transition-colors"
          >
            <Mail className="w-3.5 h-3.5" /> Email
          </a>
        )}
        {agent.whatsapp && (
          <a
            href={`https://wa.me/${agent.whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 text-xs text-gray-600 hover:bg-gray-200 hover:text-black transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
