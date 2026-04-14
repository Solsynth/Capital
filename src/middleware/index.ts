import { defineMiddleware } from 'astro:middleware';
import { languages } from '~/i18n/utils';

const VALID_LANGS = Object.keys(languages);

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const pathSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];

  // Check if the first segment is a valid language code
  const hasValidLang = firstSegment && VALID_LANGS.includes(firstSegment);

  if (!hasValidLang) {
    // Detect user's preferred language
    const acceptLang = context.request.headers.get('accept-language');
    const preferredLang = acceptLang?.split(',')[0]?.split('-')[0];
    const targetLang = preferredLang === 'zh' ? 'zh' : 'en';

    // Build the redirect URL with the detected language
    const targetPath = pathname === '/' ? '' : pathname;
    const redirectUrl = `/${targetLang}${targetPath}`;

    return context.redirect(redirectUrl);
  }

  return next();
});
