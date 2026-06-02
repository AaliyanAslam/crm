import { Inter , Urbanist  , Hachi_Maru_Pop } from 'next/font/google'

export const inter = Inter({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-inter',
})
export const urbanist = Urbanist({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-urbanist',
})


export const hachiMaruPop = Hachi_Maru_Pop({
    subsets: ['latin'],
    weight: ['400'],
    variable: '--font-hachi-maru-pop',
})