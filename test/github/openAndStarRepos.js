const repoList = require('../accounts').githubRepos;

const { randIn } = require('../../src/util');

module.exports = async (page, repos = repoList) => {
    if (!Array.isArray(repos)) repos = [repos];
    for (let repo of repos) {
        if (Math.random() < 0.2) continue;
        await page.goto(`https://github.com/${repo}`);
        await page.waitFor(randIn(2000, 10000));
        const starButton = 'button[aria-label="Star this repository"]';
        await page.click(starButton);
        console.log(repo, 'star clicked');
        await page.waitFor(randIn(2000, 10000));
    }

    return page;
};
