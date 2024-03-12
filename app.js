const qrcode = require("qrcode-terminal");
const { Client } = require("whatsapp-web.js");
const { openai } = require("./config");

const opn = require("opn");

const client = new Client();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", (session) => {
  console.log("Client authenticated with session: ", session);
  openWhatsAppWeb();
});


client.on("auth_failure", (msg) => {
  console.error("Authentication failed:", msg);
});

const openWhatsAppWeb = async () => {
  try {
    await opn("https://web.whatsapp.com/");
  } catch (error) {
    console.error("Error opening WhatsApp Web:", error);
  }
};

client.on("ready", () => {
  console.log("Client is ready!");
});

const generateResponse = async (userMessage) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: userMessage },
        { role: "assistant", content: "Hello, how can I assist you today?" }, // You can add previous assistant responses
      ],
      temperature: 0.5,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "Sorry, I couldn't generate a response at the moment.";
  }
};

client.on("message", async (message) => {
  if (message.from !== "status@broadcast") {
    const response = await generateResponse(message.body);
    await message.reply(response);
  }
});

const initializeClient = async () => {
  await client.initialize();
};

initializeClient();
