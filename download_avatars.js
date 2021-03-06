const request = require('request');
const fs = require('fs');
const {
  gitHubKey,
} = require('./secret/tokens.js');

const owner = process.argv[2];
const repo = process.argv[3];


/**
 * [downloadImageByURL fetches the desired avatar_url
 * and saves this information to the given filePath]
 * @param {[string]}  url   [A remote image URL to fetch]
 * @param {[string]}  filePath [A local path for where to persist the file]
 * @return {[undefined]} [undefined]
 */
const downloadImageByURL = (url, filePath) => {
  const startOfuserId = url.lastIndexOf('/u/');
  const endOfUserId = url.lastIndexOf('?');
  const userId = url.slice(startOfuserId + 2, endOfUserId);
  request.get(url)
    .on('error', (err) => {
      console.log(err);
    })
    .on('response', () => {
      // Maybe log something to user letting them know?
    })
    .pipe(fs.createWriteStream(`${filePath}${userId}.jpg`, (err) => {
      console.log(err);
    }));
  return undefined;
};

/**
 * [Callback will be passed in to getRepoContributors()
 * & will be executed when there is a response from request.
 * b loops through each item in the array:
 * It constructs a file path using the login value (e.g., "avatars/dhh.jpg")
 * It then passes the avatar_url value and the file path to downloadImageByURL]
 * @param  {[type]}   err     [error parameter with http request]
 * @param  {[type]}   results [incoming data from the server]
 * @return {[undefined]} [undefined]
 */
const callback = (err, results) => {
  if (err) {
    console.log(err);
    return undefined;
  }
  const parsedResults = JSON.parse(results);
  const numberOfAvatars = parsedResults.length;
  if (numberOfAvatars) {
    console.log(`Downloading ${numberOfAvatars} user avatars.`);
    parsedResults.forEach((result, i) => {
      console.log(`Downloading ${i + 1}/${numberOfAvatars} user avatars.`);
      downloadImageByURL(result.avatar_url, './avatars/');
    });
    console.log('Done!');
  } else {
    console.log('Could not find avatars to download. Please check user and repository provided');
  }
  return undefined;
};

/**
 * [getRepoContributors makes a request for JSON, getting back an array of contributors,
 *  passes this data to cb, an anonymous callback function that it is given,
 *  ]
 * @param  {[type]}   repoOwner [the username of the repoowner]
 * @param  {[type]}   repoName  [the name of the repo]
 * @param  {Function} cb        [the callback function that will handle the data]
 * @return {[undefined]} [undefined]
 */
const getRepoContributors = (repoOwner, repoName, cb) => {
  const options = {
    url: `https://api.github.com/repos/${repoOwner}/${repoName}/contributors`,
    headers: {
      'User-Agent': 'node application',
      Authorization: `token ${gitHubKey}`,
    },
  };
  request(options, (err, res, body) => {
    cb(err, body);
  });
  return undefined;
};

// Does check to ensure arguments passed into command line:
if (owner && repo) {
  console.log('Welcome to the GitHub Avatar Downloader!');
  getRepoContributors(owner, repo, callback);
} else {
  console.log('node download_avatars.js <owner> <repo>');
}
