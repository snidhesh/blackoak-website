import Image from 'next/image';
import type { ProjectAgent } from '@/types/project';

interface AgentCardProps {
  agent: ProjectAgent;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function AgentCard({ agent }: AgentCardProps) {
  // The CRM returns agent profileImages as base64 data URIs which we strip in
  // the snapshot; the transform then resolves them to /images/placeholder.jpg
  // (which doesn't exist). Render an initials avatar instead of a broken image.
  const hasProfileImage =
    agent.profileImage &&
    !agent.profileImage.endsWith('/placeholder.jpg');

  return (
    <div className="bg-white border border-gray-200 p-6 flex flex-col sm:flex-row items-center gap-6">
      {/* Profile Image or initials avatar */}
      <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200 shrink-0 flex items-center justify-center">
        {hasProfileImage ? (
          <Image
            src={agent.profileImage}
            alt={agent.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <span className="text-gray-600 font-medium text-xl select-none">
            {getInitials(agent.name)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 text-center sm:text-start">
        <h3 className="text-lg font-semibold text-black">{agent.name}</h3>
        {agent.position && (
          <p className="text-sm text-gray-500 mt-0.5">{agent.position}</p>
        )}
        {agent.brn && (
          <p className="text-xs text-gray-400 mt-1">BRN: {agent.brn}</p>
        )}
      </div>

    </div>
  );
}
