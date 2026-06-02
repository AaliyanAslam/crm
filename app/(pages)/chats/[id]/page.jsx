import ChatRoomView from "./ChatRoomView";

export default async function ChatsRoomPage({ params }) {
    const { id } = await params;
    return <ChatRoomView roomId={id} />;
}
