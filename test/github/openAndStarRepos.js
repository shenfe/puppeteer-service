const repoList = require('../accounts').githubRepos;

module.exports = async (page, repos = repoList) => {
    if (!Array.isArray(repos)) repos = [repos];
    for (let repo of repos) {
        if (Math.random() < 0.2) continue;
        await page.goto(`https://github.com/${repo}`);
        await page.waitFor(5000);
        const starButton = 'button[aria-label="Star this repository"]';
        // await page.waitForSelector(starButton);
        await page.click(starButton);
        console.log(repo, 'star clicked');
        await page.waitFor(2000);
    }

    return page;
};
