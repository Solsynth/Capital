import { ui, defaultLang, languages, type Lang } from './ui';

export { languages };

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as Lang;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: keyof typeof ui[typeof defaultLang]): string {
    return ui[lang][key] || ui[defaultLang][key];
  };
}

export function useTranslatedPath(lang: Lang) {
  return function translatePath(path: string, currentLang?: Lang): string {
    if (!currentLang || currentLang === defaultLang) {
      return path;
    }
    return `/${lang}${path}`;
  };
}

export function getPathByLocale(path: string, lang: Lang): string {
  if (lang === defaultLang) {
    return path;
  }
  return `/${lang}${path}`;
}

export function stripLangFromPath(pathname: string): string {
  const segments = pathname.split('/');
  if (segments[1] === 'zh') {
    return '/' + segments.slice(2).join('/');
  }
  return pathname;
}

export function addLangToPath(pathname: string, lang: Lang): string {
  if (lang === defaultLang) {
    return stripLangFromPath(pathname);
  }
  return `/${lang}${stripLangFromPath(pathname)}`;
}
