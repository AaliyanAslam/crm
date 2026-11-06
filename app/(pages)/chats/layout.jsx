import ChatsShell from "./ChatsShell";

export default function ChatsLayout({ children }) {
    return (
        <div className="flex h-full min-h-0 min-w-0 w-full max-w-full flex-1 basis-0 flex-col overflow-hidden">
            <ChatsShell>{children}</ChatsShell>
        </div>
    );
}
