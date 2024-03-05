import http from "k6/http";
import exec from 'k6/execution';

const scenarios =  {
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

const { scenario } = __ENV;

export const options = {
    scenarios: scenario ? {
        [scenario]: scenarios[scenario]
    } : {}
};

const username = `performance`;
const password = `performance`;
const credentials = `${username}:${password}`;
const params = {
    headers: {
        'Content-Type': 'application/json',
    },
};

export default function() {
    const postData = {
        title: `Title of Post ${exec.scenario.iterationInTest}`,
        content: `Content of Post ${exec.scenario.iterationInTest}`
    };
    http.post(`http://${credentials}@localhost:8080/api/posts/new`, JSON.stringify(postData), params);

    for(let i=1; i<=5; i++) {
        const commentData = {
            content: `Content of Reply ${i} to Post ${exec.scenario.iterationInTest}`
        };
        http.post(`http://${credentials}@localhost:8080/api/comments/new/${exec.scenario.iterationInTest}`, JSON.stringify(commentData), params);
    }
}