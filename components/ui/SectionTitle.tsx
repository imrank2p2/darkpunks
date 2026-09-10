import ComicBadge from "./ComicBadge";

type Props = {
  badge: string;
  title: string;
  subtitle?: string;
  badgeColor?: "yellow" | "pink" | "blue" | "green";
  align?: "left" | "center";
};

export default function SectionTitle({
  badge,
  title,
  subtitle,
  badgeColor = "pink",
  align = "left",
}: Props) {
  return (
    <div className={align === "center" ? "text-center" : ""}>

      <ComicBadge color={badgeColor}>
        {badge}
      </ComicBadge>

      <h2 className="mt-6 text-4xl font-black uppercase leading-none sm:text-5xl lg:text-6xl">
        {title}
      </h2>

      {subtitle && (
        <p
          className={`mt-6 text-lg leading-8 text-gray-600 ${
            align === "center"
              ? "mx-auto max-w-2xl"
              : "max-w-xl"
          }`}
        >
          {subtitle}
        </p>
      )}

    </div>
  );
}