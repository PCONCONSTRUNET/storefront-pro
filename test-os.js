const APP_ID = "63b84a50-f1ec-4940-97aa-a72bfc1f9a2e";
const API_KEY = "os_v2_app_mo4euuhr5reubf5ku4v7yh42fyj4ulmikcsuwiequ6wfp2iuso42s5easovoc5wpb3nokto7gwnh7h3eyrpf7dfdo6z6qcvccjo32hq";
const SUB_ID = "742f1ba7-f095-49ba-bbb8-09e7db1a000a";

async function run() {
  const res = await fetch(`https://api.onesignal.com/players/${SUB_ID}?app_id=${APP_ID}`, {
    headers: {
      Authorization: `Basic ${API_KEY}`
    }
  });
  console.log(res.status, await res.text());
}
run();
