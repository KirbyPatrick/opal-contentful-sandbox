import {
  DM_Sans, DM_Serif_Display, IBM_Plex_Sans, Inter, Lato, Libre_Caslon_Text, Manrope,
  Merriweather_Sans, Montserrat, Nunito_Sans, Playfair_Display, Source_Sans_3, Space_Grotesk,
} from "next/font/google";

/**
 * The 12 fonts brands may choose (see the brand content type). They are
 * downloaded at build time and served from this site, so browsers never
 * contact Google. preload is off: each page only fetches the faces it uses.
 * next/font needs literal options in every call, so they are repeated.
 */
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-space-grotesk", weight: ["500", "700"] });
const inter = Inter({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-inter" });
// The two serif fonts set in italic by their brands' designs load real italics, so the browser never fakes them.
const libreCaslon = Libre_Caslon_Text({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-libre-caslon", weight: ["400", "700"], style: ["normal", "italic"] });
const sourceSans = Source_Sans_3({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-source-sans" });
const dmSerif = DM_Serif_Display({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-dm-serif", weight: "400" });
const dmSans = DM_Sans({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-dm-sans" });
const merriweatherSans = Merriweather_Sans({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-merriweather-sans" });
const nunitoSans = Nunito_Sans({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-nunito-sans" });
const manrope = Manrope({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-manrope" });
const ibmPlex = IBM_Plex_Sans({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-ibm-plex-sans", weight: ["400", "500", "600"] });
const playfair = Playfair_Display({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-playfair", style: ["normal", "italic"] });
const montserrat = Montserrat({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-montserrat", weight: ["300", "400", "500", "600", "700", "800"] });
const lato = Lato({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-lato", weight: ["400", "700"] });

export const fontVariables = [
  spaceGrotesk, inter, libreCaslon, sourceSans, dmSerif, dmSans,
  merriweatherSans, nunitoSans, manrope, ibmPlex, playfair, lato, montserrat,
].map((font) => font.variable).join(" ");
