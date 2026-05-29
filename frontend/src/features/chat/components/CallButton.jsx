import { VideoIcon } from "lucide-react";

function CallButton({ handleVideoCall }) {
  return (
    <div className="absolute top-4 right-20 z-50">
      <button 
        onClick={handleVideoCall} 
        className="btn btn-circle btn-success btn-sm text-white shadow-md"
        title="Start Video Call"
      >
        <VideoIcon className="size-4" />
      </button>
    </div>
  );
}

export default CallButton;
