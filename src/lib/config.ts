interface AppConfig {
  apiUrl: string;
  environment: 'development' | 'production';
}

const config: AppConfig = {
  apiUrl: import.meta.env?.VITE_API_URL || 'http://inventory-api-env.eba-hh4nwx6q.us-east-1.elasticbeanstalk.com/api',
  environment: (import.meta.env?.MODE as 'development' | 'production') || 'production',
};

export default config;