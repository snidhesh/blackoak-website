import Image from 'next/image';

interface TeamMember {
  id: string;
  name: string;
  title: string;
  image: string;
}

interface TeamGridProps {
  members: TeamMember[];
  title?: string;
  columns?: 2 | 4;
  centered?: boolean;
}

export default function TeamGrid({ members, title, columns = 4, centered }: TeamGridProps) {
  return (
    <div>
      {title && (
        <h2 className="text-[28px] md:text-[32px] font-normal leading-[48px] text-black text-center mb-16">
          {title}
        </h2>
      )}
      <div
        className={`grid gap-x-7 gap-y-20 ${
          columns === 2
            ? 'grid-cols-1 sm:grid-cols-2 max-w-[668px] mx-auto'
            : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
        } ${centered ? 'justify-items-center' : ''}`}
      >
        {members.map((member) => (
          <div key={member.id} className="flex flex-col items-center gap-3.5 w-full max-w-[325px]">
            <div className="relative w-full aspect-[325/406] overflow-hidden rounded-[8px]">
              <Image
                src={member.image}
                alt={member.name}
                fill
                className="object-cover object-top grayscale hover:grayscale-0 transition-all duration-500"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
            <div className="text-center">
              <p className="text-[20px] text-black tracking-[0.2px] leading-7">
                {member.name}
              </p>
              <p className="text-[15px] text-gray-500 tracking-[0.15px] leading-7">
                {member.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
