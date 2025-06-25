"use client";

import { useEffect, useMemo, useState } from "react";
import { hc } from "hono/client";
import type { AppType } from "@/app/api/[...route]/route";
import TrackView from "../../send/[id]/track-view";

import dayjs from "dayjs";
import "dayjs/locale/ja";
import relativeTime from "dayjs/plugin/relativeTime";
import { AlertTriangleIcon, CheckCircleIcon } from "lucide-react";
import Loading from "@/components/Loading";

dayjs.extend(relativeTime);
dayjs.locale("ja");

const client = hc<AppType>("/");

export default function HomePage() {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [tracks, setTracks] = useState<
    | {
        id: number;
        spotifyId: string;
        spotifyUrl: string;
        name: string;
        artistName: string;
        image: string | null;
        fromUserId: string;
        toUserId: string;
        toUserName: string | null | undefined;
        toUserImage: string | null | undefined;
        addedToPlaylist: boolean;
        createdAt: string;
      }[]
    | undefined
  >(undefined);

  useEffect(() => {
    const fetchUserData = async () => {
      const res = await client.api.me.$get();
      if (res.ok) {
        const userData = await res.json();
        setUserId(userData.id);
      } else {
        console.error("Failed to fetch user data");
      }
    };

    const fetchTracksData = async () => {
      const res = await client.api.me["sent-tracks"].$get();
      if (res.ok) {
        const tracks = await res.json();
        setTracks(tracks);
      }
    };

    fetchUserData();
    fetchTracksData();
  }, []);

  if (!userId || !tracks) {
    return <Loading />;
  }

  return (
    <div>
      <h2 className="text-lg mb-4">あなたが送った曲（最新20件）</h2>
      {tracks.length === 0 ? (
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
          送信履歴がありません
        </div>
      ) : (
        tracks.map((track) => (
          <div key={track.id} className="mb-8">
            <div className="flex items-center">
              <img
                src={track.toUserImage || ""}
                alt="Receiver user icon"
                className="rounded-full w-8 h-8"
              />
              <span className="ml-2">{track.toUserName}</span>
              <span className="ml-2 text-gray-500">さんへ</span>
              <span className="text-sm text-gray-500">
                ・{dayjs(track.createdAt).fromNow()}
              </span>
              <span className="ml-2 flex items-center">
                {track.addedToPlaylist ? (
                  <span className="tooltip" data-tip="プレイリストに追加済み">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  </span>
                ) : (
                  <span className="tooltip" data-tip="プレイリストに未追加">
                    <AlertTriangleIcon className="w-4 h-4 text-yellow-600" />
                  </span>
                )}
              </span>
            </div>
            <div className="ml-4">
              <TrackView track={track} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
