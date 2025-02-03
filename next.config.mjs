import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/index.ts');

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  experimental: {
    forceSwcTransforms: true
  },
  compiler: {
    removeConsole: false
  }
};

export default withNextIntl(config); 