const APP_ID = "63b84a50-f1ec-4940-97aa-a72bfc1f9a2e";
const API_KEY = "os_v2_app_mo4euuhr5reubf5ku4v7yh42fyj4ulmikcsuwiequ6wfp2iuso42s5easovoc5wpb3nokto7gwnh7h3eyrpf7dfdo6z6qcvccjo32hq";
const NOTIFICATION_ID = "2dcb8ebb-a707-4bf0-b05b-0d32ad5a4ec8";

async function run() {
  const res = await fetch(`https://api.onesignal.com/notifications/${NOTIFICATION_ID}?app_id=${APP_ID}`, {
    headers: {
      Authorization: `Basic ${API_KEY}`
    }
  });
  console.log(res.status, await res.text());
}
run();
