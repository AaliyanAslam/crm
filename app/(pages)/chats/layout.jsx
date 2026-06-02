import ChatsShell from "./ChatsShell";

export default function ChatsLayout({ children }) {
    return (
        <div className="flex min-h-0 min-w-0 max-w-full flex-1 basis-0 flex-col overflow-x-clip overflow-y-hidden">
            <ChatsShell>{children}</ChatsShell>
        </div>
    );
}
