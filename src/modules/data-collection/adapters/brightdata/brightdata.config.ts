import { registerAs } from '@nestjs/config';

export default registerAs('brightdata', () => ({
    token: process.env.BRIGHTDATA_API_TOKEN!,
    datasets: {
        FB_PAGES_POSTS_BY_PROFILE_URL: process.env.FB_PAGES_POSTS_BY_PROFILE_URL!,
        FB_COMMENTS_BY_URL: process.env.FB_COMMENTS_BY_URL!,
    },
}));