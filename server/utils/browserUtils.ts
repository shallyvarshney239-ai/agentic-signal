import {chromium, LaunchOptions, Page} from "npm:playwright";

export interface BrowserLaunchConfig {
    executablePath?: string;
    forceHeadless?: boolean;
}

function resolveLaunchOptions (config?: BrowserLaunchConfig): LaunchOptions {
    const headless = typeof config?.forceHeadless === "boolean"
        ? config.forceHeadless
        : Deno.env.get("HEADLESS") === "true";

    const args: string[] = [];

    if (headless) {
        args.push(
            "--headless=new",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu"
        );
    }

    return {
        headless,
        executablePath: config?.executablePath,
        args
    };
}

export async function launchBrowser<T> (
    config: BrowserLaunchConfig | undefined,
    callback: (page: Page) => Promise<T>
): Promise<T> {
    const options = resolveLaunchOptions(config);
    const browser = await chromium.launch(options);
    const page = await browser.newPage();

    try {
        return await callback(page);
    } finally {
        await page.close();
        await browser.close();
    }
}