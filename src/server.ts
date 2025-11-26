import {createApp} from './app';
import env from './config/env';

async function start() {
  const app = await createApp();

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
}

start().catch((err) => {
  console.error('Startup error:', err);
  process.exit(1);
});
