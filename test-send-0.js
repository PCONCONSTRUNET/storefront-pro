const APP_ID = "63b84a50-f1ec-4940-97aa-a72bfc1f9a2e";
const API_KEY = "os_v2_app_mo4euuhr5reubf5ku4v7yh42fyj4ulmikcsuwiequ6wfp2iuso42s5easovoc5wpb3nokto7gwnh7h3eyrpf7dfdo6z6qcvccjo32hq";

const payload = {
  app_id: APP_ID,
  headings: { en: "Test", pt: "Test" },
  contents: { en: "Hello", pt: "Hello" },
  filters: [
    { field: "tag", key: "role", relation: "=", value: "nonexistent" },
  ]
};

async function run() {
  const res = await fetch("https://api.onesignal.com/notifications?c=push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${API_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  console.log(res.status, await res.text());
}
run();
