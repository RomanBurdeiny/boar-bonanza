import { bootstrapGame } from './app/bootstrap/bootstrapGame';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) {
  throw new Error('#app root missing');
}

void bootstrapGame(root).catch((e) => {
  console.error(e);
  root.textContent = 'Failed to start game';
});
