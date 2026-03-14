import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({requestLocale}) => {
  // Use a static locale to always load English messages
  // or use the locale from the request to load relative messages
  const locale = await requestLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
