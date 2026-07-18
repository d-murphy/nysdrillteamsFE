import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
    faFacebook,
    faInstagram,
    faTiktok,
    faTwitch,
    faTwitter,
    faYoutube,
} from "@fortawesome/free-brands-svg-icons";

export interface SocialLink {
    name: string;
    handle: string;
    url: string;
    description: string;
    cta: string;
    icon: IconDefinition;
}

export const socialLinks: SocialLink[] = [
    {
        name: "YouTube",
        handle: "@NYSFDRacing",
        url: "https://www.youtube.com/@NYSFDRacing",
        description:
            "Full races, contest highlights, and archived video so you can relive big runs anytime.",
        cta: "Subscribe on YouTube",
        icon: faYoutube,
    },
    {
        name: "Instagram",
        handle: "@NYSFDRacing",
        url: "https://www.instagram.com/nysfdracing/?hl=en",
        description:
            "Photos and moments from tournament days — action on the track, team spirit, and highlights from the season.",
        cta: "Follow on Instagram",
        icon: faInstagram,
    },
    {
        name: "TikTok",
        handle: "@NYSFDRacing",
        url: "https://www.tiktok.com/@NYSFDRacing?lang=en",
        description:
            "Short clips and highlights that capture the speed, intensity, and excitement of New York State drill team racing.",
        cta: "Follow on TikTok",
        icon: faTiktok,
    },
    {
        name: "Facebook",
        handle: "NYS Drill Teams Group",
        url: "https://www.facebook.com/nysfdracing",
        description:
            "Join the community group for event chatter, results discussion, and news shared by fans and teams across the state.",
        cta: "Follow on Facebook",
        icon: faFacebook,
    },
    {
        name: "X (Twitter)",
        handle: "@nysfddrillteams",
        url: "https://twitter.com/nysfddrillteams?lang=en",
        description:
            "Quick updates, announcements, and race-day news as it happens throughout the season.",
        cta: "Follow on X",
        icon: faTwitter,
    },
    {
        name: "Twitch",
        handle: "nysfdracing",
        url: "https://www.twitch.tv/nysfdracing",
        description:
            "Live streams of tournaments so you can follow the action when you can't make it to the track.",
        cta: "Watch on Twitch",
        icon: faTwitch,
    },
];
