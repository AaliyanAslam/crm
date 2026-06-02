import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export function useUser() {
    const { data, mutate, error, isLoading } = useSWR('/api/auth/me', fetcher, {
        revalidateOnFocus: false, // Window focus par baar baar fetch na kare
        dedupingInterval: 1000 * 60 * 60, // 1 ghante tak cache fresh maane
    });

    const user = data?.user;
    const finished = !isLoading;
    const isAuthenticated = !!user;

    return {
        user,
        isLoading,
        isAuthenticated,
        mutate, // User info update karne ke liye (e.g. Profile pic change)
    };
}