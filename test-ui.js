const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  await page.waitForSelector('button', { timeout: 5000 });
  
  // Click login button
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const login = btns.find(b => b.textContent.includes('Login'));
    if (login) login.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Click continue as tutor or student
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const login = btns.find(b => b.textContent.includes('Login as Student'));
    if (login) login.click();
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
