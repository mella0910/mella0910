// LOAD ENVIRONMENT VARIABLES
require("dotenv-extended").config({
    path: __dirname + '/.env'
});

// BOT MODULES / LIBRARUES
const builder = require("botbuilder");
const azure = require("botbuilder-azure");

// CREATE SERVER
const restify = require("restify");
const server = restify.createServer();

// START LISTENING TO SERVER
const port = 3979;
server.listen(port, function(){
    console.log("Listening to %s", port);
});

// BOT CONNECTOR
const connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// BOT AZURE STORAGE
const azureTableClient = new azure.AzureTableClient(
    process.env.DB_TABLE,
    process.env.DB_NAME,
    process.env.DB_KEY
);

const tableStorage = new azure.AzureBotStorage({
        gzipData: false
    },
    azureTableClient
);

// BOT STORAGE
const bot = new builder.UniversalBot(connector).set("storage", tableStorage);
bot.set("persistConversationData", true);
server.post("/api/messages", connector.listen());


bot.dialog("/", new builder.IntentDialog()
    .matches(/\b(hello|hi|howdy|hey)\b/i, "/hello")
    .onDefault("/default")
);

var name, age, gender;
bot.dialog("/hello", [
    function(session){
        builder.Prompts.text(session, "What is your name?");
    }, function(session, results){
        name = results.response;
        builder.Prompts.choice(session, "What is your gender?", "Male|Female", {listStyle: builder.ListStyle.button});
    }, function(session, results){
        gender = results.response.entity;
        builder.Prompts.number(session, "What is your age?");
    }, function(session, results){
        age = results.response;
        session.send("Your name is "+name+" and you're "+gender+". Your age is "+age);
        session.endDialog();
    }
]);

bot.dialog("/default", function(session){
    session.send("No intent found");
    session.endDialog();
});