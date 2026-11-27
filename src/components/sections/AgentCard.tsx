import Image from 'next/image';
import type { ProjectAgent } from '@/types/project';

interface AgentCardProps {
  agent: Pick<ProjectAgent, 'name' | 'position' | 'brn' | 'profileImage'>;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** The listing agent as a compact row: photo (or initials), name, role and BRN. */
export default function AgentCard({ agent }: AgentCardProps) {
  // The CRM returns agent profileImages as base64 data URIs which we strip in
  // the snapshot; the transform then resolves them to /images/placeholder.jpg
  // (which doesn't exist). Render an initials avatar instead of a broken image.
  const hasProfileImage =
    agent.profileImage &&
    !agent.profileImage.endsWith('/placeholder.jpg');
  const position = agent.position?.trim();

  return (
    <div className="flex items-center gap-4">
      {/* Profile image or initials avatar */}
      <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-200 shrink-0 flex items-center justify-center">
        {hasProfileImage ? (
          <Image
            src={agent.profileImage}
            alt={agent.name}
            fill
            className="object-cover"
            sizes="56px"
          />
        ) : (
          <span className="text-gray-600 font-medium text-base select-none">
            {getInitials(agent.name)}
          </span>
        )}
      </div>

      <div className="min-w-0">
        <p className="text-base font-semibold text-black leading-snug">{agent.name}</p>
        {position && <p className="text-sm text-gray-500 mt-0.5">{position}</p>}
        {agent.brn && <p className="text-xs text-gray-400 mt-0.5">BRN: {agent.brn}</p>}
      </div>
    </div>
  );
}
