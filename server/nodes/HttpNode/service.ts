import {launchBrowser, BrowserLaunchConfig} from "../../utils/browserUtils.ts";


export async function fetchRenderedHtml (url: string, browserPath?: string): Promise<string> {
    let content = "";

    const config: BrowserLaunchConfig = {executablePath: browserPath};

    await launchBrowser(
        config,
        async (page) => {
            await page.goto(url, {waitUntil: "load"});
            content = await page.content();
        }
    );

    return content;
}