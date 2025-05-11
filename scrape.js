const puppeteer = require("puppeteer");
const fs = require("fs-extra");

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  const listings = [];

  for (let i = 1; i <= 3; i++) {
    const url = `https://comblocmarket.com/classifieds1/categories/combloc-market.1/?page=${i}`;
    await page.goto(url, { waitUntil: "networkidle2" });

    const pageListings = await page.evaluate(() => {
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

    listings.push(...pageListings);
  }

  await fs.writeJson("listings.json", listings, { spaces: 2 });
  await browser.close();
})();
