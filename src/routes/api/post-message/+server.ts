import { PRIVATE_OPENAI_KEY, PRIVATE_ASSISTANT_ID } from "$env/static/private";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: PRIVATE_OPENAI_KEY
});
export async function POST({ request }){

    const body = await request.json();

    const messages = body.messageFeed;
    const assistant = await openai.beta.assistants.retrieve(PRIVATE_ASSISTANT_ID);

    const thread = await openai.beta.threads.create();

    const userQuestion = messages.at(-1);

    console.log(userQuestion);

    const message = await openai.beta.threads.messages.create(
        thread.id,
        {
            role: "user",
            content: userQuestion ? userQuestion.message : ""
        }
    );

    console.log("Message ok");

    // We use the stream SDK helper to create a run with
    // streaming. The SDK provides helpful event listeners to handle 
    // the streamed response.
    let { readable, writable } = new TransformStream(); 

    // We use the stream SDK helper to create a run with
// streaming. The SDK provides helpful event listeners to handle 
// the streamed response.
 
    const stream = await openai.beta.threads.runs.create(thread.id, 
        { assistant_id: assistant.id, stream: true}
    )

    return new Response(
        stream.toReadableStream(),
        {
            headers: {
                "Content-Type": "text/event-stream"
            }
        }
    );

}