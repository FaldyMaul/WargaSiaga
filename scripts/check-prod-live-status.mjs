async function check() {
  const res = await fetch("https://warga-siaga.id/modus");
  const text = await res.text();
  console.log("HTTP Status:", res.status);
  
  const jsMatch = text.match(/src="([^"]*main[^"]*\.js)"/);
  if (jsMatch) {
    const jsUrl = new URL(jsMatch[1], "https://warga-siaga.id").href;
    console.log("Main JS Bundle URL:", jsUrl);
    const jsRes = await fetch(jsUrl);
    const jsCode = await jsRes.text();
    console.log("JS Bundle length:", jsCode.length);
    console.log("Includes vector-segment assets:", jsCode.includes("vector-segment"));
    console.log("Includes card-audience-stack:", jsCode.includes("card-audience-stack"));
    console.log("Includes card-quote-text:", jsCode.includes("card-quote-text"));
  }
}
check();
