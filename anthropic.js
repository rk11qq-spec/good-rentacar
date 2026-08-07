// Anthropic APIプロキシ(監査F-09対応)
// APIキーはブラウザに出さず、Netlifyの環境変数 ANTHROPIC_API_KEY に保管します。
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "ANTHROPIC_API_KEY が未設定です。Netlifyの Site configuration → Environment variables に登録して再デプロイしてください。" }),
    };
  }
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: event.body,
    });
    const text = await res.text();
    return { statusCode: res.status, headers: { "Content-Type": "application/json" }, body: text };
  } catch (e) {
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Anthropic APIへの接続に失敗しました: " + e.message }),
    };
  }
};
