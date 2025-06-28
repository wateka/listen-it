import TrackView from "@/components/track-view";
import dayjs from "dayjs";
import "dayjs/locale/ja";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("ja");

export type SentTrack = {
  id: number;
  spotifyId: string;
  spotifyUrl: string;
  name: string;
  artistName: string;
  image: string | null;
  toUserId: string;
  toUserName: string | null | undefined;
  toUserImage: string | null | undefined;
  createdAt: string;
};

function SentTrackItem({ track }: { track: SentTrack }) {
  return (
    <div className="mb-8">
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
      </div>
      <div className="ml-4">
        <TrackView track={track} />
      </div>
    </div>
  );
}

export default function SentTracksList({ tracks }: { tracks: SentTrack[] }) {
  return (
    <div>
      {tracks.length === 0 ? (
        <div className="text-gray-500">まだ送った曲がありません。</div>
      ) : (
        tracks.map((track) => <SentTrackItem key={track.id} track={track} />)
      )}
    </div>
  );
}
