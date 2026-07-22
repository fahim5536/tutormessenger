const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  // Listen for console logs and errors
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('http://localhost:3000');
  await page.waitForSelector('button', { timeout: 5000 });
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const login = btns.find(b => b.textContent.includes('Login'));
    if (login) login.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const login = btns.find(b => b.textContent.includes('Login as Student'));
    if (login) login.click();
  });
  
  await new Promise(r => setTimeout(r, 3000));
  
  // Switch to dashboard tab
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const home = btns.find(b => b.textContent.includes('Home'));
    if (home) home.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));

  // Find "Ask AI Tutor"
  const clicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const askAI = btns.find(b => b.textContent.includes('Ask AI Tutor'));
    if (askAI) {
      askAI.click();
      return true;
    }
    return false;
  });
  
  console.log('Clicked Ask AI Tutor:', clicked);
  await new Promise(r => setTimeout(r, 2000));
  
  const modalFound = await page.evaluate(() => {
    const text = document.body.innerText;
    return text.includes('Gemini AI Study Workspace');
  });
  
  console.log('Modal Found:', modalFound);
  
  await browser.close();
})();
