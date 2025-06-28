"use client";
import Link from "next/link";
import { useRef } from "react";

export default function MenuDropdown({ userImageUrl, userName }: { userImageUrl: string; userName: string }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const handleClose = () => {
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
  };

  return (
    <details className="dropdown dropdown-end" ref={detailsRef}>
      <summary className="btn btn-ghost flex items-center gap-2">
        <div className="avatar">
          <div className="w-8 h-8 rounded-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={userImageUrl} alt="User Avatar" />
          </div>
        </div>
        <div>{userName}</div>
      </summary>
      <ul className="menu dropdown-content rounded-box bg-white border border-gray-200 z-1 w-52 mt-2 p-2 shadow-sm">
        <li>
          <Link href="/home" onClick={handleClose}>ホーム</Link>
        </li>
        <li>
          <Link href="/home/history" onClick={handleClose}>送った曲の履歴</Link>
        </li>
        <li>
          <Link href="/home/settings" onClick={handleClose}>ユーザ設定</Link>
        </li>
        <li>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="w-full text-red-700" onClick={handleClose}>
              サインアウトする
            </button>
          </form>
        </li>
      </ul>
    </details>
  );
}
