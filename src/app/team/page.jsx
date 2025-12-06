import TeamContent from "./TeamContent";

export const metadata = {
    title: "Team | CodeRev",
    description: "Meet the student team building the future of coding education.",
};

// Force dynamic rendering if there are cache issues, although unnecessary for purely static content.
// This ensures that fresh deployments are always served fresh if Vercel's data cache is behaving oddly.
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export default function TeamPage() {
    return <TeamContent />;
}
