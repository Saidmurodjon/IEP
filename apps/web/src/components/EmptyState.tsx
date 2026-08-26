import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  title: string;
  hint?: string;
}

/**
 * Ma'lumot hali kiritilmagan bo'limlar uchun. Soxta ma'lumot qo'yishdan
 * ko'ra bo'sh holatni chiroyli ko'rsatish afzal.
 */
export default function EmptyState({ icon: Icon, title, hint }: Props) {
  return (
    <div className="card border-dashed border-2 border-gray-200 bg-gray-50/60 py-16 px-6 text-center">
      <div className="bg-white shadow-sm rounded-full w-16 h-16 mx-auto mb-5 flex items-center justify-center">
        <Icon className="h-7 w-7 text-primary-300" />
      </div>
      <p className="text-gray-700 font-medium">{title}</p>
      {hint && <p className="text-sm text-gray-500 mt-1.5 max-w-md mx-auto">{hint}</p>}
    </div>
  );
}
