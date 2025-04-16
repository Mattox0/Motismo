// this way is recommanded by nextjs
// https://nextjs.org/docs/app/building-your-application/optimizing/fonts
import { Poppins } from 'next/font/google';

export const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});
