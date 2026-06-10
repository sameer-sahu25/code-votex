module.exports = {
  apps: [
    {
      name: 'ransomshield-backend',
      script: './src/app.js',
      instances: 2,
      exec_mode: 'cluster',
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
