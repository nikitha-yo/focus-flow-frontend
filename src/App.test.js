import fs from 'fs';
import path from 'path';

test('does not include the FocusFlow Assistant', () => {
  const appSource = fs.readFileSync(path.join(__dirname, 'App.js'), 'utf8');
  const appStyles = fs.readFileSync(path.join(__dirname, 'App.css'), 'utf8');

  expect(appSource).not.toMatch(/FocusFlow Assistant|ai-chat-widget|MessageCircle/);
  expect(appStyles).not.toMatch(/\.ai-chat-|\.ai-bubble/);
});
