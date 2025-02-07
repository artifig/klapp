interface InfoCardProps {
  title: string;
  description: string;
}

export function InfoCard({ title, description }: InfoCardProps) {
  return (
    <li className="tehnopol-card">
      <h3 className="tehnopol-heading font-medium">{title}</h3>
      <p className="tehnopol-text mt-2">{description}</p>
    </li>
  );
} 