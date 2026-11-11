import type { MetadataRoute } from 'next';
import {siteUrl,storeReady} from '@/lib/store';
export default function robots():MetadataRoute.Robots{return {rules:storeReady()?{userAgent:'*',allow:'/',disallow:['/admin','/api/','/comanda/']}:{userAgent:'*',disallow:'/'},sitemap:`${siteUrl}/sitemap.xml`};}
