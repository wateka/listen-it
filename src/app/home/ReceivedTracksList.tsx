import dayjs from "dayjs";
import { AlertTriangleIcon, CheckCircleIcon } from "lucide-react";
import TrackView from "@/components/track-view";

export type ReceivedTrack = {
  id: number;
  spotifyId: string;
  spotifyUrl: string;
  name: string;
  artistName: string;
  image: string | null;
  fromUserId: string;
  fromUserName: string | null | undefined;
  fromUserImage: string | null | undefined;
  addedToPlaylist: boolean;
  createdAt: string;
};

function ReceivedTrackItem({ track }: { track: ReceivedTrack }) {
  return (
    <div className="mb-8">
      <div className="flex items-center">
        <img
          src={track.fromUserImage || ""}
          alt="Sender user icon"
          className="rounded-full w-8 h-8"
        />
        <span className="ml-2">{track.fromUserName}</span>
        <span className="ml-2 text-gray-500">さんから</span>
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
  );
}

export default function ReceivedTracksList({ tracks }: { tracks: ReceivedTrack[] }) {
  return (
    <div>
      {tracks.length === 0 ? (
        <div className="text-gray-500">まだ曲が届いていません。</div>
      ) : (
        tracks.map((track) => <ReceivedTrackItem key={track.id} track={track} />)
      )}
    </div>
  );
}
