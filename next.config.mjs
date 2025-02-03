import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/index.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
};

export default withNextIntl(nextConfig); 