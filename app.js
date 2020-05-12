const fs = require("fs-extra")
let puppeteer = require("puppeteer");
let cfile = process.argv[2];

(async function () {

    try {
        let data = await fs.promises.readFile(cfile);
        let { url, item } = JSON.parse(data);
        console.log("launching the browser ");
        let browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            slowMo:50,
            args: ["--start-maximized"],
        })
        let tabs = await browser.pages();
        let tab = await tabs[0];


        await tab.goto(url, { waitUntil: "networkidle0" });
        console.log("waiting for searcg box");

        fs.writeFile("output6.csv", "Heading,Price\n")

        await tab.waitForSelector("#twotabsearchtextbox");
        console.log("typing")
        await tab.type("#twotabsearchtextbox", item);
        console.log("waiting for item")
        await tab.goto(`https://www.amazon.in/s?k=${item}`, { waitUntil: "networkidle0" });
        console.log("waiting for headings")

        let totalPages = await tab.$$(".a-pagination li", { waitUntil: "networkidle2" });
        let lastPage = await tab.evaluate(function (el) {
            return el.innerText;
        }, totalPages[5]);

        console.log("lastpage value is: " + lastPage);

        let k = 0;
        while (k <= 12) {
            console.log("value of k is -- " + k);
            await handlePage(tab, k);
            await tab.waitForSelector("div.s-include-content-margin.s-border-bottom.s-latency-cf-section")
            let parent = await tab.$$("div.s-include-content-margin.s-border-bottom.s-latency-cf-section");
            for (let i = 0; i < parent.length; i++) {
                let heading = await parent[i].$("h2 a span");
                let text1;
                let text2;
                if (heading) {
                    text1 = await tab.evaluate(function (el) {
                        return el.innerText;
                    }, heading);
                }
                let price = await parent[i].$("span[class=a-price-whole]");
                if (price) {
                    text2 = await tab.evaluate(function (el) {
                        return el.innerText;
                    }, price);
                }
                if (text1 != undefined && text2 != undefined)
                    fs.appendFile("output6.csv", `"${text1}","${text2}"\n`);
                    
                    
                     await tab.evaluate(_ => {
                        window.scrollBy(0, window.innerHeight - 400);
                      });
                    
                    
                    console.log(text1+" ----- "+text2+"\n");
            }
            k++;
        }
        console.log("done");
        await browser.close();
    }
    catch (e) {
        console.log(e);
    }


    
    
})()



async function handlePage(tab, k) {
    if (k == 0) {
        console.log("\n\n\n")
        console.log(k + " pAGE is running");
    }
    else {
        console.log(k + " page is running");
        console.log("Inside handle page. ");
        // await tab.waitForSelector(".a-pagination li")
        let totalPages = await tab.$$(".a-pagination li", { waitUntil: "networkidle2" });
        // console.log("total page length value is: " + totalPages.length);
        let lastPage = await tab.evaluate(function (el) {
            return el.innerText;
        }, totalPages[5]);
        // console.log("lastpage value is: " + lastPage);

        let btn = totalPages[totalPages.length-1];
        console.log("button  value is: " + btn);
        let className = await tab.evaluate(function (el) {
            return el.getAttribute("class")
        }, btn);
        // console.log(className);

        if (k == 20) {
            return null;
        }
        // console.log("button will be clicked");
        // await tab.evaluate(function() {
        //     window.scrollBy(0, window.innerHeight);
        //   });
        await btn.click()
        
        await tab.waitForNavigation({ waitUntil: "networkidle2" });
    }

}