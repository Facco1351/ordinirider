/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disabilita telemetry nel build
  env: {
    NEXT_TELEMETRY_DISABLED: '1',
  },
}
module.exports = nextConfig
