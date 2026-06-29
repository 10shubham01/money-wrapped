import { loadFont as loadDisplay } from "@remotion/google-fonts/ArchivoBlack";
import { loadFont as loadSans } from "@remotion/google-fonts/SpaceGrotesk";

// Heavy punchy face for hero numbers & titles
export const display = loadDisplay("normal", { subsets: ["latin"] }).fontFamily;
// Clean modern face for labels / body / UI
export const sans = loadSans("normal", {
  subsets: ["latin"],
  weights: ["400", "500", "600", "700"],
}).fontFamily;
