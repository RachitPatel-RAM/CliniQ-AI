import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const mono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
    display: 'swap',
});

export const metadata = {
    title: 'CliniQ AI',
    description: 'AI-powered multilingual patient intake system. Speak naturally in Gujarati, Hindi, or English. Powered by Gemma AI for structured clinical reports.',
    keywords: ['clinical intake', 'AI healthcare', 'multilingual', 'Gujarati', 'Hindi', 'patient intake'],
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${inter.variable} ${mono.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
            <body className="font-sans bg-surface text-text-primary antialiased min-h-screen" suppressHydrationWarning>
                {children}
            </body>
        </html>
    );
}
