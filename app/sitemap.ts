import type { MetadataRoute } from 'next';
import {siteUrl,storeReady} from '@/lib/store';
export default function sitemap():MetadataRoute.Sitemap{return storeReady()?[{url:siteUrl,changeFrequency:'weekly',priority:1}]:[];}
