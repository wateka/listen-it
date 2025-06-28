import { useState } from "react";
import { CheckCircleIcon } from "lucide-react";

export default function ShareCard({ userPagePath }: { userPagePath: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="card border border-gray-300 shadow-sm p-4 mb-8">
      <h2 className="text-lg mb-2">友達に曲を送ってもらおう！</h2>
      <p className="text-gray-500 text-sm mb-4">
        以下のURLを友達に共有すると、そこから曲を送ってもらえます。
      </p>
      <div className="join rounded-box rounded-md">
        <input
          type="text"
          disabled
          className="join-item input w-full"
          value={userPagePath}
        />
        <button
          type="button"
          className="join-item btn"
          onClick={async () => {
            await navigator.clipboard.writeText(userPagePath);
            setCopied(true);
          }}
        >
          {copied ? (
            <span className="flex items-center gap-2 text-green-700">
              <CheckCircleIcon className="w-4 h-4" />
              コピー
            </span>
          ) : (
            <span>コピー</span>
          )}
        </button>
      </div>
    </div>
  );
}
