const puppeteer = require("puppeteer");
const fs = require("fs-extra");

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto("https://comblocmarket.com/classifieds1/categories/combloc-market.1/", {
    waitUntil: "networkidle2",
  });

  const listings = await page.evaluate(() => {
    const items = document.querySelectorAll(".structItem");
    const output = [];

    items.forEach((item) => {
      const links = item.querySelectorAll(".structItem-title a");
      const a = links.length > 1 ? links[1] : links[0];
      const title = a?.textContent.trim();
      const url = a?.href;
      const date = item.querySelector("time")?.getAttribute("datetime") || "";
      const priceMatch = title?.match(/\$\d+(?:,\d{3})*(?:\.\d{2})?/);
      const price = priceMatch ? priceMatch[0] : "";

      if (title && url) {
        output.push({ title, url, price, date });
      }
    });

    return output;
  });

  await fs
