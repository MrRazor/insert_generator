import http from "k6/http";
import exec from 'k6/execution';

const predefinedScenarios =  {
    shared_iter_scenario: {
        executor: "shared-iterations",
        vus: 10,
        iterations: 1000,
    },
    per_vu_scenario: {
        executor: "per-vu-iterations",
        vus: 10,
        iterations: 100,
    }
};

export const options = {
    scenarios: {},
}

if (__ENV.scenario) {
    options.scenarios[__ENV.scenario] = predefinedScenarios[__ENV.scenario];
}

const username = `performance`;
const password = `performance`;
const credentials = `${username}:${password}`;
const params = {
    headers: {
        'Content-Type': 'application/json',
    },
};

export default function() {
    const id = `${exec.scenario.iterationInTest + 1}`;
    const postData = {
        title: `Title of Post ${id}`,
        content: `Content of Post ${id}`
    };
    http.post(`http://${credentials}@localhost:8080/api/posts/new`, JSON.stringify(postData), params);

    for(let i=1; i<=5; i++) {
        const commentData = {
            content: `Content of Reply ${i} to Post ${id}`
        };
        http.post(`http://${credentials}@localhost:8080/api/comments/new/${id}`, JSON.stringify(commentData), params);
    }
}