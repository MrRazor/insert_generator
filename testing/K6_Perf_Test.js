import http from "k6/http";

let scenarios =  { 
  shared_iter_scenario: {
    executor: "shared-iterations",
    vus: 10,
    iterations: 100,
  },
  per_vu_scenario: {
    executor: "per-vu-iterations",
    vus: 10,
    iterations: 10,
  }
};

let { scenario } = __ENV;

export let options = {  
  scenarios: scenario ? {
    [scenario]: scenarios[scenario]
  } : {}
};

export default function() {
  for(let i=1; i<=50; i++) {
    http.get("http://localhost:8080/api/posts/all-paged?page=" + i + "&size=20");
  }
  for(let i=1; i<=1000; i++) {
    http.get("http://localhost:8080/api/comments/all/" + i);
  }
}