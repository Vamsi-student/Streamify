import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserFriends } from "../../../shared/lib/api";
import useAuthUser from "../../auth/hooks/useAuthUser";
import { XIcon, UsersIcon } from "lucide-react";
import toast from "react-hot-toast";

const CreateGroupModal = ({ onClose, client }) => {
  const { authUser } = useAuthUser();
  const [groupName, setGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const toggleFriendSelection = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      return toast.error("Please enter a group name");
    }
    if (selectedFriends.length === 0) {
      return toast.error("Please select at least one friend");
    }

    setIsCreating(true);
    try {
      const channelId = `group-${Date.now()}`;

      const channel = client.channel("messaging", channelId, {
        name: groupName,
        members: [authUser._id, ...selectedFriends],
        created_by_id: authUser._id,
      });

      await channel.create();

      toast.success("Group created successfully!");
      onClose();
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">

        <div className="flex justify-between items-center p-4 border-b border-base-300">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <UsersIcon className="size-5" />
            Create Group Chat
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <XIcon className="size-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text font-medium">Group Name</span>
            </label>
            <input
              type="text"
              placeholder="E.g. Study Group"
              className="input input-bordered w-full"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <label className="label">
            <span className="label-text font-medium">Select Friends</span>
          </label>

          {isLoading ? (
            <div className="flex justify-center p-4">
              <span className="loading loading-spinner"></span>
            </div>
          ) : friends.length === 0 ? (
            <p className="text-sm opacity-70 text-center py-4">No friends found to add.</p>
          ) : (
            <div className="space-y-2">
              {friends.map((friend) => (
                <label
                  key={friend._id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 cursor-pointer border border-transparent hover:border-base-300 transition-colors"
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm"
                    checked={selectedFriends.includes(friend._id)}
                    onChange={() => toggleFriendSelection(friend._id)}
                  />
                  <img
                    src={friend.profilePic}
                    alt={friend.fullName}
                    className="size-8 rounded-full object-cover"
                  />
                  <span className="flex-1 font-medium text-sm">{friend.fullName}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-base-300 flex justify-end gap-2 bg-base-200 rounded-b-lg">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button
            onClick={handleCreateGroup}
            className="btn btn-primary"
            disabled={isCreating || selectedFriends.length === 0 || !groupName.trim()}
          >
            {isCreating ? <span className="loading loading-spinner loading-sm"></span> : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
