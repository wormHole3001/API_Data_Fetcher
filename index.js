/* Imports */
const axios = require("axios");
const fs = require("fs");
const path = require("path");
/* Set the API endpoint and out directory */
const API_ENDPOINT = "https://www.klpzmedia.com/apis/1.0";
const OUT_DIRECTORY_PATH = path.join(__dirname, "data.json");
/* Header required to authenticate with the API */
const axiosClient = axios.create({
    baseURL: API_ENDPOINT,
    timeout: 1000,
    headers: {
        Authorization: "FuLYQH8zYjb55faG"
    },
});
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
const getSuspectsByPage = async (page) => {
    const url = `${API_ENDPOINT}/suspects/?page=${page}&pageSize=100&includeOtherUsers=true`;

    console.log("Fetching page: ", page);

    const response = await axiosClient.get(url);

    return response;
};
const main = async () => {
    /* Remove data.json and update with the version */
    if (fs.existsSync(OUT_DIRECTORY_PATH)) {
        fs.rmSync(OUT_DIRECTORY_PATH);
    }
    /* Set flag; used to check if a page is empty */
    let isEmpty = false;
    let count = 0;
    let page = 1;
    while (!isEmpty) {
        /* Fetch page */
        const response = await getSuspectsByPage(page);
        /* Get suspect */
        const suspects = response.data.suspects;
        const suspectsLength = suspects.length;
        if (suspectsLength === 0) {
            isEmpty = true;
            console.log("Last page.");
            break;
        }
        /* Write to data.json */
        fs.appendFileSync(
            path.join(OUT_DIRECTORY_PATH),
            JSON.stringify(suspects, null, 2),
            "utf-8"
        );
        /* Replacing brackets with comma to follow JSON rules */
        fs.readFile(OUT_DIRECTORY_PATH, 'utf8', (err, data) => {
            if (err) {
                return console.log(err);
            }
            const result = data.replaceAll('][', ',');
            fs.writeFile(OUT_DIRECTORY_PATH, result, 'utf8', (err) => {
                if (err) {
                    return console.log(err);
                }
            });
        });
        count += suspectsLength;
        console.log("count: ", count);
        page++;
        await sleep(1000);
    }
    console.log("Done");
};
/* Call main */
main();