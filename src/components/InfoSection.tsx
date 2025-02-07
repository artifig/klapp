import { InfoCard } from './InfoCard';

interface InfoItem {
  id: string;
  title: string;
  description: string;
}

interface InfoSectionProps {
  title: string;
  items: InfoItem[];
  emptyMessage?: string;
}

export function InfoSection({ title, items, emptyMessage = "Tulemusi ei leitud." }: InfoSectionProps) {
  return (
    <section className="mb-8">
      <h2 className="tehnopol-heading text-2xl mb-4">{title}</h2>
      {items.length > 0 ? (
        <ul className="space-y-4">
          {items.map(item => (
            <InfoCard
              key={item.id}
              title={item.title}
              description={item.description}
            />
          ))}
        </ul>
      ) : (
        <p className="tehnopol-text">{emptyMessage}</p>
      )}
    </section>
  );
} 