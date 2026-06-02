import { redirect } from "next/navigation";

export default async function ChatPage({ params }) {
    const { id } = await params;
    redirect(`/chats/${id}`);
}
