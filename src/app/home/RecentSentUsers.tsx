import Link from "next/link";

export type RecentSentUser = {
  id: string;
  name: string;
  image: string | null;
};

export default function RecentSentUsers({ users }: { users: RecentSentUser[] }) {
  return (
    <div className="flex gap-4 mb-8 mx-2 overflow-x-auto">
      {users.map((user) => (
        <Link
          key={user.id}
          href={`/send/${user.id}`}
          className="flex flex-col items-center w-20 focus:outline-none"
        >
          <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-300">
            <img src={user.image || "/images/avatar.png"} alt={user.name} className="w-full h-full object-cover" />
          </div>
          <span className="text-xs mt-1 text-center break-all w-20 line-clamp-2 leading-tight">{user.name}</span>
        </Link>
      ))}
    </div>
  );
}
