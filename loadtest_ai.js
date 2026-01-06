// Simple load test for AI chat service
import { getAIAnalysis } from "./src/services/gptService";

const weather = {
  city: "Bangkok",
  temperature: 32,
  conditionText: "แดดจ้า"
};

async function runLoadTest(concurrency = 10, requestsPerUser = 3) {
  const results = [];
  const start = Date.now();
  const tasks = [];
  for (let i = 0; i < concurrency; i++) {
    tasks.push((async () => {
      for (let j = 0; j < requestsPerUser; j++) {
        try {
          const res = await getAIAnalysis(weather);
          results.push({ ok: true, res });
        } catch (e) {
          results.push({ ok: false, error: e + "" });
        }
      }
    })());
  }
  await Promise.all(tasks);
  const duration = Date.now() - start;
  const success = results.filter(r => r.ok).length;
  const fail = results.length - success;
  console.log(`Load test done: ${results.length} requests in ${duration}ms`);
  console.log(`Success: ${success}, Fail: ${fail}`);
  if (fail > 0) {
    console.log("Sample errors:", results.filter(r => !r.ok).slice(0, 3));
  }
}

runLoadTest(10, 5); // 10 users, 5 requests each
