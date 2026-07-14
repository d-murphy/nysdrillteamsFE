export type HomepageAdvert = {
    filename: string;
    url?: string;
    alt?: string;
};

/** Banner ads shown in the homepage carousel. Add `url` to make the image a sponsor link. */
export const homepageAdverts: HomepageAdvert[] = [
    { filename: "ATT banner.jpg", alt: "FirstNet Built with AT&T", url: "https://www.firstnet.com/" },
    { filename: "Adept Automation - trackside.jpg", alt: "Adept Automation", url: "https://adeptautomationgroup.com/" },
    { filename: "Adept Tech - trackside.jpg", alt: "Adept Tech", url: "https://www.adept-techconsulting.com/" },
    { filename: "Bulovas Banner.jpg", alt: "Bulovas Restorations", url: "https://www.bulovasrestorations.com/" },
    { filename: "Elite Towers banner.jpg", alt: "Elite Towers", url: "https://elite-towers.com/" },
    { filename: "FRS Banner.jpg", alt: "FRS", url: "https://firerescuesystems.com/" },
    { filename: "Hi Tech track banner.jpg", alt: "Hi Tech", url: "https://www.hitechfireny.com/" },
    { filename: "banner-8x2-2022_proliner-3.jpg", alt: "Proliner", url: "https://www.prolinerrescue.com/" },
    { filename: "merkel.jpg", alt: "Merkel", url: "https://merkelracing.com/" },
    { filename: "print 3 - sdi_banner1_2x8-1.jpg", alt: "SDI", url: "https://www.systemsdefinition.com/" },
];
