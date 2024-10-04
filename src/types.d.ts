declare module 'request' {
    export interface OptionsWithUri {
        uri: string;
        // Add other properties as needed
    }
}

declare class CookieJar {}

// More specific declarations
declare module 'api/tiktokMusic' {}
declare module 'constant/index' {}
declare module 'core/Downloader' {}
declare module 'core/TikTok' {}
declare module 'helpers/Bar' {}

declare module 'tiktok-scraper' {
    export interface TikTokScraperOptions {
        // Define your options here
    }

    export interface TikTokVideoMetadata {
        // Define video metadata properties
    }

    // Add other necessary type declarations
}

declare module 'request';
declare module '../utils/protobuf';

// Exported Interfaces
export interface DownloaderConstructor {
    progress: boolean;
    proxy: string | string[];
    noWaterMark: boolean;
    headers: Headers;
    filepath: string;
    bulk: boolean;
    cookieJar: CookieJar;
}

export interface PostCollector {
    id: string;
    secretID: string;
    text: string;
    createTime: number;
    authorMeta: AuthorMeta;
    musicMeta?: MusicMeta;
    covers: Covers;
    webVideoUrl: string;
    videoUrl: string;
    videoUrlNoWaterMark: string;
    videoApiUrlNoWaterMark: string;
    videoMeta: VideoMeta;
    diggCount: number;
    shareCount: number;
    playCount: number;
    commentCount: number;
    downloaded: boolean;
    mentions: string[];
    hashtags: Hashtag[];
    effectStickers: EffectSticker[];
}

export interface DownloadParams {
    zip: boolean;
    folder: string;
    collector: PostCollector[];
    fileName: string;
    asyncDownload: number;
}

export interface Proxy {
    socks: boolean;
    proxy: string | SocksProxyAgent;
}

export interface Headers {
    [key: string]: string;
}

export type ScrapeType = 'user' | 'hashtag' | 'trend' | 'music' | 'video';

export interface Result {
    headers: Headers;
    collector: PostCollector[];
    zip?: string;
    json?: string;
    csv?: string;
    webhook?: {
        good: number;
        bad: number;
    };
}

export interface RequestQuery {
    [key: string]: any;
}

export interface UserMetadata {
    // Define properties based on usage in TikTokScraper
}

export interface HashtagMetadata {
    // Define properties based on usage in TikTokScraper
}

export interface FeedItems {
    // Define properties based on usage in TikTokScraper
}

export interface ItemListData {
    // Define properties based on usage in TikTokScraper
}

export interface TikTokMetadata {
    challengeInfo: HashtagMetadata;
    musicInfo: MusicMetadata;
    statusCode: number;
    // Add other necessary properties
}

export interface WebHtmlUserMetadata {
    props: {
        pageProps: {
            userInfo: UserMetadata;
        };
    };
}

export interface VideoMetadata {
    itemInfo: {
        itemStruct: FeedItems;
    };
}

export interface History {
    [key: string]: HistoryItem;
}

export interface HistoryItem {
    type: ScrapeType;
    input: string;
    downloaded_posts: number;
    last_change: Date;
    file_location: string;
}

export interface MusicMetadata {
    // Define properties based on usage in TikTokScraper
}

// Define other necessary interfaces below...

export interface AuthorMeta {
    id: string;
    secUid: string;
    name: string;
    nickName: string;
    verified: boolean;
    signature: string;
    avatar: string;
    following: number;
    fans: number;
    heart: number;
    video: number;
    digg: number;
}

export interface MusicMeta {
    musicId: string;
    musicName: string;
    musicAuthor: string;
    musicOriginal: boolean;
    coverThumb: string;
    coverMedium: string;
    coverLarge: string;
    duration: number;
}

export interface Covers {
    default: string;
    origin: string;
}

export interface VideoMeta {
    height: number;
    width: number;
    duration: number;
}

export interface Hashtag {
    id: string;
    name: string;
    title: string;
    cover: string;
}

export interface EffectSticker {
    id: string;
    name: string;
}

// ... remove or update the placeholder interface ...

// Remove the placeholder interface if it's no longer needed
// export interface YourType {
//     // ... your type definitions ...
// }